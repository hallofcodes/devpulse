import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../utils/rate-limit";

/*
 * Gets the rate limit for a given route based on pathname and method.
 *
 * @param pathname The pathname of the request.
 * @param method The HTTP method of the request.
 * @returns An object containing the maximum number of requests and the window duration in milliseconds.
 */
function getLimitsForRoute(pathname: string, method: string) {
  const isAuthEndpoint = /api\/(login|signup)/.test(pathname);
  if (isAuthEndpoint) return { max: 10, windowMs: 60 * 60 * 1000 }; // thats 1 hour for 10 requests

  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutating) return { max: 20, windowMs: 5 * 60 * 1000 }; // thats 5 minutes for 20 requests

  return { max: 100, windowMs: 5 * 60 * 1000 }; // thats 5 minutes for 100 requests
}

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
      : [/^https?:\/\/devpulse\.hallofcodes\.org(:\d+)?$/];

  const isOriginAllowed =
    !origin || allowedOrigins.some((pattern) => pattern.test(origin));

  if (!isOriginAllowed) {
    return NextResponse.json(
      { error: "Hehe you're going too far naah..." },
      { status: 403 },
    );
  }

  const { max, windowMs } = getLimitsForRoute(
    request.nextUrl.pathname,
    request.method,
  );
  const withinLimit = checkRateLimit(ip, max, windowMs);

  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // let it through so auth still runs
  return undefined;
}
