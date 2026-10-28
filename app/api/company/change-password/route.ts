import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession, logAudit } from "@/lib/auth";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@#$%&*!)"
    ),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = changePasswordSchema.parse(body);

    // Vérifier que les mots de passe correspondent
    if (input.newPassword !== input.confirmPassword) {
      return apiError("Les mots de passe ne correspondent pas", 400);
    }

    // Récupérer l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: session.id },
    });

    if (!company) {
      return apiError("Entreprise introuvable", 404);
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      input.currentPassword,
      company.passwordHash
    );

    if (!isPasswordValid) {
      return apiError("Le mot de passe actuel est incorrect", 400);
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(
      input.newPassword,
      company.passwordHash
    );

    if (isSamePassword) {
      return apiError(
        "Le nouveau mot de passe doit être différent de l'ancien",
        400
      );
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(input.newPassword, 12);

    // Mettre à jour le mot de passe et retirer le flag mustChangePassword
    await prisma.company.update({
      where: { id: session.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    // Logger l'action
    await logAudit({
      action: "PASSWORD_CHANGED",
      entity: "Company",
      entityId: company.id,
      companyId: company.id,
      details: { email: company.email },
    });

    return apiSuccess({
      message: "Mot de passe changé avec succès",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
