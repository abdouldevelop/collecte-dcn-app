import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api";
import { clearCompanyCookie, getCompanySession, logAudit } from "@/lib/auth";
import { getClientIp } from "@/lib/api";

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

    return apiSuccess({ message: "Déconnexion réussie" });
  } catch (error) {
    return handleApiError(error);
  }
}
