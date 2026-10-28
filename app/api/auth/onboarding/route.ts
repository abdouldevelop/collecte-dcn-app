import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { signCompanyToken, setCompanyCookie, logAudit } from "@/lib/auth";
import { onboardingSchema } from "@/validators";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = onboardingSchema.parse(body);

    // Validate invitation token
    const invitation = await prisma.companyInvitation.findUnique({
      where: { token: input.token },
      include: { products: { select: { productId: true } } },
    });

    if (!invitation) {
      return apiError("Invitation invalide ou introuvable", 400);
    }

    if (invitation.status !== "PENDING") {
      return apiError("Cette invitation a déjà été utilisée ou annulée", 400);
    }

    if (!invitation.email) {
      return apiError("Cette entreprise n’a pas encore d’adresse email configurée", 400);
    }
    const invitationEmail = invitation.email;

    if (invitation.expiresAt < new Date()) {
      await prisma.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return apiError("Cette invitation a expiré", 400);
    }

    // Check if company already exists with this email
    const existingCompany = await prisma.company.findUnique({
      where: { email: invitationEmail },
    });
    if (existingCompany) {
      return apiError("Un compte existe déjà pour cet email", 400);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create company + mark invitation USED in a transaction
    const company = await prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name: input.companyName,
          email: invitationEmail,
          passwordHash,
          rccm: input.rccm || null,
          ncc: input.ncc || null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          sector: input.sector ?? null,
          isOnboarded: true,
          isActive: true,
        },
      });

      if (invitation.products.length > 0) {
        await tx.companyProduct.createMany({
          data: invitation.products.map(({ productId }) => ({
            companyId: created.id,
            productId,
          })),
          skipDuplicates: true,
        });
      }

      await tx.companyInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "USED",
          usedAt: new Date(),
          companyId: created.id,
        },
      });

      return created;
    });

    // Auto-sign in after onboarding
    const token = await signCompanyToken({
      id: company.id,
      email: company.email,
      name: company.name,
      role: "COMPANY",
    });

    await setCompanyCookie(token);

    await logAudit({
      action: "ONBOARDING_COMPLETE",
      entity: "Company",
      entityId: company.id,
      companyId: company.id,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({
      id: company.id,
      email: company.email,
      name: company.name,
      isOnboarded: company.isOnboarded,
      role: "COMPANY",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
