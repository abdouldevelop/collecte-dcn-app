import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiValidationError(error: ZodError): NextResponse {
  return NextResponse.json(
    { success: false, error: "Validation error", details: error.flatten() },
    { status: 422 }
  );
}

export function apiUnauthorized(): NextResponse {
  return apiError("Non autorisé", 401);
}

export function apiNotFound(entity = "Ressource"): NextResponse {
  return apiError(`${entity} introuvable`, 404);
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) return apiValidationError(error);
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return apiUnauthorized();
    return apiError(error.message, 500);
  }
  return apiError("Erreur interne du serveur", 500);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
