import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";

export default async function Auth(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/d", "/api/wakatime/sync"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route}(/.*)?$`).test(pathname),
  );

  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!session.user.email_verified) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
    if (!session.user.wakatime_api_key && pathname.startsWith("/d")) {
      return NextResponse.redirect(new URL("/verify-wakatime", req.url));
    }
  }

  const authRoutes = ["/login", "/signup", "/forgot-password"];

  if (authRoutes.includes(pathname) && session) {
    if (!session.user.email_verified) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
    if (!session.user.wakatime_api_key) {
      return NextResponse.redirect(new URL("/verify-wakatime", req.url));
    }
    return NextResponse.redirect(new URL("/d", req.url));
  }

  if (pathname === "/reset-password") {
    return null;
  }

  if (
    (pathname === "/verify-email" && session?.user.email_verified) ||
    (pathname === "/verify-wakatime" && session?.user.wakatime_api_key)
  ) {
    return NextResponse.redirect(new URL("/d", req.url));
  }

  return null;
}
