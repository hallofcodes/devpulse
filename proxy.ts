import { NextResponse, type NextRequest } from "next/server";
import auth from "./app/lib/proxy/auth";
import headlessBrowserCheck from "./app/lib/proxy/headless-browser-check";
import RateLimiter from "./app/lib/proxy/rate-limiter";

const env = process.env.NODE_ENV;

// headless → rate limit → auth; only return when we block or redirect
export async function proxy(req: NextRequest) {
  const response = NextResponse.next({
    request: { headers: req.headers },
  });

  const headlessResponse = headlessBrowserCheck(req);
  if (headlessResponse) return headlessResponse;

  if (env === "production") {
    const rateLimitResponse = RateLimiter(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  const authResponse = await auth(req);
  if (authResponse) return authResponse;

  return response;
}

export const config = {
  matcher: [
    "/",
    "/d/:path*",
    "/api/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
