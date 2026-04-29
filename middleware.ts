import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCompanyToken, verifyAdminToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/admin/login", "/onboarding", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
}

function isCompanyPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/declarations") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/focal-point")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes that are public
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const session = await verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expirée" }, { status: 401 });
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    const token = request.cookies.get("company-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const session = await verifyCompanyToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expirée" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Public pages
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from login pages
    if (pathname === "/login") {
      const token = request.cookies.get("company-token")?.value;
      if (token) {
        const session = await verifyCompanyToken(token);
        if (session) return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    if (pathname === "/admin/login") {
      const token = request.cookies.get("admin-token")?.value;
      if (token) {
        const session = await verifyAdminToken(token);
        if (session) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // Admin routes
  if (isAdminPath(pathname)) {
    const token = request.cookies.get("admin-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const session = await verifyAdminToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin-token");
      return response;
    }
    return NextResponse.next();
  }

  // Company routes
  if (isCompanyPath(pathname)) {
    const token = request.cookies.get("company-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifyCompanyToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("company-token");
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
