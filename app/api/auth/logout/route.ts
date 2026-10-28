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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.url;
    const response = NextResponse.redirect(new URL("/login", appUrl), { status: 303 });
    response.cookies.set("company-token", "", { path: "/", maxAge: 0 });
    response.cookies.set("admin-token", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
