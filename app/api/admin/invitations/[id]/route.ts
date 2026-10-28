import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail";

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email("Email invalide") });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const { email } = emailSchema.parse(await request.json());
    const invitation = await prisma.companyInvitation.findUnique({ where: { id } });
    if (!invitation) return apiNotFound("Entreprise en attente");
    if (!invitation.isDraft) return apiError("L’email de cette invitation a déjà été renseigné.", 400);
    if (await prisma.company.findUnique({ where: { email } })) {
      return apiError("Un compte existe déjà pour cet email.", 400);
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await sendInvitationEmail({ to: email, companyName: invitation.companyName, token });
    const updated = await prisma.companyInvitation.update({
      where: { id },
      data: { email, token, expiresAt, status: "PENDING", isDraft: false },
    });
    await logAudit({
      action: "DRAFT_COMPANY_INVITED",
      entity: "CompanyInvitation",
      entityId: id,
      adminId: session.id,
      details: { email, companyName: invitation.companyName },
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
