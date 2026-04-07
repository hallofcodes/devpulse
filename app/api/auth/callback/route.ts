import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const cookieRedirect = req.cookies.get("devpulse_redirect")?.value;
  const redirectParam = cookieRedirect ? decodeURIComponent(cookieRedirect) : null;
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";

  const response = NextResponse.redirect(`${origin}${redirectTo}`);
  response.cookies.set("devpulse_redirect", "", { path: "/", maxAge: 0 });
  if (!code) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error)
    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed&redirect=${encodeURIComponent(redirectTo)}`,
    );

  return response;
}
