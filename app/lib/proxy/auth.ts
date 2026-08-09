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
    if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
  }

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  if (authRoutes.includes(pathname) && session) {
    if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
    return NextResponse.redirect(new URL("/d", req.url));
  }

  if (pathname === "/verify-email" && session?.user.emailVerified) {
    return NextResponse.redirect(new URL("/d", req.url));
  }

  return null;
}
