import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { supportTicketSchema } from "@/validators";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const tickets = await prisma.supportTicket.findMany({
      where: { companyId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(tickets);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = supportTicketSchema.parse(body);

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: input.subject,
        message: input.message,
        priority: input.priority,
        companyId: session.id,
        status: "OPEN",
      },
    });

    return apiSuccess(ticket, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
