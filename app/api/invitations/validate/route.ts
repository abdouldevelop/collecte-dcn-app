import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || token.trim() === "") {
      return apiError("Token requis", 400);
    }

    const invitation = await prisma.companyInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return apiError("Invitation invalide ou introuvable", 400);
    }

    if (invitation.status !== "PENDING") {
      return apiError("Cette invitation a déjà été utilisée ou annulée", 400);
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired in DB
      await prisma.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return apiError("Cette invitation a expiré", 400);
    }

    return apiSuccess({
      companyName: invitation.companyName,
      email: invitation.email,
      rccm: invitation.rccm,
      ncc: invitation.ncc,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
