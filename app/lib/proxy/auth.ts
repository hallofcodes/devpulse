import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";

export default async function Auth(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/d", "/api/wakatime/sync"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route}(/.*)?$`).test(pathname),
  );

  if (isProtectedRoute && !session) {
    console.log("User is not authenticated, redirecting to login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  if (authRoutes.includes(pathname) && session) {
    console.log("User is authenticated, redirecting to home.");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return null;
}
