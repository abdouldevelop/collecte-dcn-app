import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

const markReadSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const notifications = await prisma.notification.findMany({
      where: { companyId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = markReadSchema.parse(body);

    if (input.markAll) {
      // Mark all notifications as read for this company
      await prisma.notification.updateMany({
        where: { companyId: session.id, isRead: false },
        data: { isRead: true },
      });
      return apiSuccess({ message: "Toutes les notifications marquées comme lues" });
    }

    if (!input.id) {
      return apiError("ID de notification requis", 400);
    }

    // Verify notification belongs to company
    const notification = await prisma.notification.findFirst({
      where: { id: input.id, companyId: session.id },
    });

    if (!notification) {
      return apiError("Notification introuvable", 404);
    }

    const updated = await prisma.notification.update({
      where: { id: input.id },
      data: { isRead: true },
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
