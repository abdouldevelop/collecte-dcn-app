import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail";
import { invitationSchema } from "@/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(status ? { status: status as "PENDING" | "USED" | "EXPIRED" | "CANCELLED" } : {}),
    };

    const [invitations, total] = await Promise.all([
      prisma.companyInvitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sentBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.companyInvitation.count({ where }),
    ]);

    return apiSuccess({
      invitations,
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

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body: unknown = await request.json();
    const input = invitationSchema.parse(body);

    // Check if invitation already exists for this email
    const existingInvitation = await prisma.companyInvitation.findFirst({
      where: { email: input.email, status: "PENDING" },
    });
    if (existingInvitation) {
      return apiError("Une invitation est déjà en cours pour cet email.", 400);
    }

    // Check if company already exists with this email
    const existingCompany = await prisma.company.findUnique({
      where: { email: input.email },
    });
    if (existingCompany) {
      return apiError("Un compte existe déjà pour cet email.", 400);
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.companyInvitation.create({
      data: {
        token,
        companyName: input.companyName,
        email: input.email,
        rccm: input.rccm ?? null,
        ncc: input.ncc ?? null,
        expiresAt,
        adminId: session.id,
        status: "PENDING",
      },
    });

    // Send invitation email (non-blocking — log error but don't fail)
    try {
      await sendInvitationEmail({
        to: input.email,
        companyName: input.companyName,
        token,
      });
    } catch (mailErr) {
      console.error("Failed to send invitation email:", mailErr);
    }

    await logAudit({
      action: "INVITATION_CREATED",
      entity: "CompanyInvitation",
      entityId: invitation.id,
      adminId: session.id,
      details: { email: input.email, companyName: input.companyName },
    });

    return apiSuccess(invitation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
