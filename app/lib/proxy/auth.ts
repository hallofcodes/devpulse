import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function Auth(req: NextRequest) {
  const response = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/update-password", "/logout"];
  const isProtectedRoute = protectedRoutes.some((route) => {
    const regex = new RegExp(`^${route}(/.*)?$`);
    return regex.test(pathname);
  });

  if (isProtectedRoute && !user) {
    console.log("User is not authenticated, redirecting to login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const authRoutes = ["/login", "/signup"];
  if (authRoutes.includes(pathname) && user) {
    console.log("User is authenticated, redirecting to dashboard.");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return undefined;
}
