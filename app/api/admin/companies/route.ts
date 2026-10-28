import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendWelcomeEmailWithCredentials } from "@/lib/mail";
import { generateSecurePassword } from "@/lib/utils";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { rccm: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(isActive !== null && isActive !== ""
        ? { isActive: isActive === "true" }
        : {}),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          rccm: true,
          ncc: true,
          sector: true,
          isActive: true,
          isOnboarded: true,
          createdAt: true,
          focalPoints: {
            where: { isActive: true },
            take: 1,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              importDeclarations: true,
              exportDeclarations: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return apiSuccess({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const createCompanySchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  email: z.string().email("Email invalide"),
  rccm: z.string().optional(),
  ncc: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body: unknown = await request.json();
    const input = createCompanySchema.parse(body);

    // Vérifier si une entreprise existe déjà avec cet email
    const existingCompany = await prisma.company.findUnique({
      where: { email: input.email },
    });
    if (existingCompany) {
      return apiError("Une entreprise existe déjà avec cet email.", 400);
    }

    // Générer un mot de passe temporaire sécurisé
    const temporaryPassword = generateSecurePassword(12);
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    // Créer l'entreprise directement avec le mot de passe temporaire
    const company = await prisma.company.create({
      data: {
        name: input.companyName,
        email: input.email,
        passwordHash,
        rccm: input.rccm ?? null,
        ncc: input.ncc ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        sector: input.sector ?? null,
        isActive: true,
        isOnboarded: true,
        mustChangePassword: true, // Force le changement de mot de passe
      },
    });

    // Envoyer l'email de bienvenue avec les identifiants
    try {
      await sendWelcomeEmailWithCredentials({
        to: input.email,
        companyName: input.companyName,
        email: input.email,
        temporaryPassword,
      });
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr);
      // Ne pas échouer la création si l'email ne peut pas être envoyé
    }

    // Logger l'action
    await logAudit({
      action: "COMPANY_CREATED",
      entity: "Company",
      entityId: company.id,
      adminId: session.id,
      details: { email: input.email, companyName: input.companyName },
    });

    return apiSuccess(
      {
        id: company.id,
        name: company.name,
        email: company.email,
        message: "Entreprise créée avec succès. Un email avec les identifiants a été envoyé.",
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
