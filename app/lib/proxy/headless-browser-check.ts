import { NextResponse } from "next/server";

const HEADLESS_PATTERNS = [
  "HeadlessChrome",
  "PhantomJS",
  "SlimerJS",
  "Puppeteer",
  "Playwright",
  "Chrome-Lighthouse",
] as const;

// block bots, pass through real browsers
export default function HeadlessBrowserCheck(
  req: Request,
): NextResponse | undefined {
  const ua = req.headers.get("user-agent") ?? "";
  const isHeadless = HEADLESS_PATTERNS.some((p) =>
    ua.toLowerCase().includes(p.toLowerCase()),
  );

  if (isHeadless) {
    return new NextResponse(
      JSON.stringify({ error: "Automated browsers are not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return undefined;
}
