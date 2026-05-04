import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { sendFocalPointInvitationEmail } from "@/lib/mail";
import { z } from "zod";

const MAX_FOCAL_POINTS = 4;

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requireCompanySession();
    const focalPoints = await prisma.focalPoint.findMany({
      where: { companyId: session.id, isActive: true },
      include: { invitation: { select: { status: true, expiresAt: true, token: true } } },
      orderBy: { createdAt: "asc" },
    });
    return apiSuccess(focalPoints);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const count = await prisma.focalPoint.count({
      where: { companyId: session.id, isActive: true },
    });
    if (count >= MAX_FOCAL_POINTS) {
      return apiError(`Maximum ${MAX_FOCAL_POINTS} points focaux autorisés`, 400);
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.focalPoint.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Un point focal avec cet email existe déjà", 409);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const focalPoint = await prisma.$transaction(async (tx) => {
      const fp = await tx.focalPoint.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone ?? null,
          position: data.position ?? null,
          companyId: session.id,
        },
      });
      await tx.focalPointInvitation.create({
        data: { token, email: data.email, expiresAt, companyId: session.id, focalPointId: fp.id },
      });
      return fp;
    });

    try {
      await sendFocalPointInvitationEmail({
        to: data.email,
        companyName: session.name ?? "votre entreprise",
        firstName: data.firstName,
        token,
      });
    } catch {
      // email failure is non-blocking
    }

    return apiSuccess(focalPoint, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
