import { NextRequest, NextResponse } from "next/server";
import { handleApiError, getClientIp } from "@/lib/api";
import { clearAdminCookie, getAdminSession, logAudit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (session) {
      await logAudit({
        action: "ADMIN_LOGOUT",
        entity: "Admin",
        entityId: session.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });
    }

    await clearAdminCookie();

    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  } catch (error) {
    return handleApiError(error);
  }
}
