import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { sendFocalPointInvitationEmail } from "@/lib/mail";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const fp = await prisma.focalPoint.findFirst({ where: { id, companyId: session.id } });
    if (!fp) return apiError("Point focal non trouvé", 404);

    const body = await request.json();
    const data = updateSchema.parse(body);
    const updated = await prisma.focalPoint.update({ where: { id }, data });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const fp = await prisma.focalPoint.findFirst({ where: { id, companyId: session.id } });
    if (!fp) return apiError("Point focal non trouvé", 404);

    await prisma.focalPoint.update({ where: { id }, data: { isActive: false } });
    return apiSuccess({ message: "Point focal désactivé" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Resend invitation
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const fp = await prisma.focalPoint.findFirst({
      where: { id, companyId: session.id },
      include: { invitation: true },
    });
    if (!fp) return apiError("Point focal non trouvé", 404);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (fp.invitation) {
      await prisma.focalPointInvitation.update({
        where: { id: fp.invitation.id },
        data: { token, expiresAt, status: "PENDING", usedAt: null },
      });
    } else {
      await prisma.focalPointInvitation.create({
        data: { token, email: fp.email, expiresAt, companyId: session.id, focalPointId: fp.id },
      });
    }

    try {
      await sendFocalPointInvitationEmail({
        to: fp.email,
        companyName: session.name ?? "votre entreprise",
        firstName: fp.firstName,
        token,
      });
    } catch {
      // non-blocking
    }

    return apiSuccess({ message: "Invitation renvoyée" });
  } catch (error) {
    return handleApiError(error);
  }
}
