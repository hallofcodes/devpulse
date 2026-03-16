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
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/logout"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    console.log("User is not authenticated, redirecting to login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const authRoutes = ["/login", "/signup"];
  if (authRoutes.includes(pathname) && user) {
    console.log("User is authenticated, redirecting to dashboard.");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
}
