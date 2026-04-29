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
    });

    if (!invitation) {
      return apiError("Invitation invalide ou introuvable", 400);
    }

    if (invitation.status !== "PENDING") {
      return apiError("Cette invitation a déjà été utilisée ou annulée", 400);
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return apiError("Cette invitation a expiré", 400);
    }

    // Check if company already exists with this email
    const existingCompany = await prisma.company.findUnique({
      where: { email: invitation.email },
    });
    if (existingCompany) {
      return apiError("Un compte existe déjà pour cet email", 400);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create company + mark invitation USED in a transaction
    const company = await prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name: invitation.companyName,
          email: invitation.email,
          passwordHash,
          rccm: invitation.rccm ?? null,
          ncc: invitation.ncc ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          sector: input.sector ?? null,
          isOnboarded: true,
          isActive: true,
        },
      });

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
