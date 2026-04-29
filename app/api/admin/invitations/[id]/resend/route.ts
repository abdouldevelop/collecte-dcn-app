import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;

    const invitation = await prisma.companyInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return apiNotFound("Invitation");
    }

    if (invitation.status === "USED") {
      return apiError("Cette invitation a déjà été utilisée.", 400);
    }

    if (invitation.status === "CANCELLED") {
      return apiError("Cette invitation a été annulée.", 400);
    }

    // Extend expiry by 7 days from now
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await prisma.companyInvitation.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
        status: "PENDING",
      },
    });

    // Resend email
    try {
      await sendInvitationEmail({
        to: invitation.email,
        companyName: invitation.companyName,
        token: invitation.token,
      });
    } catch (mailErr) {
      console.error("Failed to resend invitation email:", mailErr);
    }

    await logAudit({
      action: "INVITATION_RESENT",
      entity: "CompanyInvitation",
      entityId: invitation.id,
      adminId: session.id,
      details: { email: invitation.email, newExpiresAt },
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
