import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { focalPointSchema } from "@/validators";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const focalPoint = await prisma.focalPoint.findUnique({
      where: { companyId: session.id },
    });

    return apiSuccess(focalPoint);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = focalPointSchema.parse(body);

    const focalPoint = await prisma.focalPoint.upsert({
      where: { companyId: session.id },
      create: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        position: input.position ?? null,
        companyId: session.id,
      },
      update: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        position: input.position ?? null,
      },
    });

    return apiSuccess(focalPoint);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
