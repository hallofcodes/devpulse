import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../rate-limit";

export default function RateLimiter(
  request: NextRequest,
): NextResponse | undefined {
  if (!/api\//.test(request.nextUrl.pathname)) {
    return undefined;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const origin = request.headers.get("origin");

  const allowedOrigins =
    process.env.NODE_ENV === "development"
      ? [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
      : [/^https?:\/\/devpulse-waka\.vercel\.app(:\d+)?$/];

  const isOriginAllowed =
    !origin || allowedOrigins.some((pattern) => pattern.test(origin));

  if (!isOriginAllowed) {
    return NextResponse.json(
      { error: "Hehe you're going too far naah..." },
      { status: 403 },
    );
  }

  const isAuthEndpoint = /api\/(login|signup)/.test(request.nextUrl.pathname);
  const maxRequests = isAuthEndpoint ? 5 : 10;
  const windowMs = isAuthEndpoint ? 60 * 60 * 1000 : 5 * 60 * 1000;

  const withinLimit = checkRateLimit(ip, maxRequests, windowMs);

  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // let it through so auth still runs
  return undefined;
}
