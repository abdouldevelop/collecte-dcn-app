import { NextRequest, NextResponse } from "next/server";
import { handleApiError, getClientIp } from "@/lib/api";
import { clearCompanyCookie, getCompanySession, logAudit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getCompanySession();

    if (session) {
      await logAudit({
        action: "LOGOUT",
        entity: "Company",
        entityId: session.id,
        companyId: session.id,
        ipAddress: getClientIp(request),
      });
    }

    await clearCompanyCookie();

    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  } catch (error) {
    return handleApiError(error);
  }
}
