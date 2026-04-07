"use client";

import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGoogle,
  faMicrosoft,
} from "@fortawesome/free-brands-svg-icons";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  const handleOAuthSignIn = async (provider: "google" | "azure" | "github") => {
    document.cookie = `devpulse_redirect=${encodeURIComponent(redirectTo)}; path=/; max-age=600; samesite=lax`;
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
  };

  const handleCaptchaVerify = async (token: string) => {
    setShowCaptcha(false);
    setLoading(true);

    const signInWithPassword = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: token },
        });

        if (error) return reject(error);

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signInWithPassword, {
      pending: "Logging in...",
      success: "Login successful! Redirecting...",
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });

    signInWithPassword.then(() => {
      if (captcha.current) captcha.current.resetCaptcha();
      router.push(redirectTo);
    });
  };

  const handleGoogleSignIn = () => handleOAuthSignIn("google");
  const handleMicrosoftSignIn = () => handleOAuthSignIn("azure");
  const handleGitHubSignIn = () => handleOAuthSignIn("github");

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          Login
        </button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-500">Or continue with</span>
        </div>

        <div className="flex flex-row-321 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 mr-2 text-red-500" />
            <span className="font-medium text-gray-700">Google</span>
          </button>

          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="flex items-center justify-center w-full py-3 rounded-lg bg-[#f3f3f3] border border-gray-300 hover:bg-gray-200 transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon={faMicrosoft} className="h-5 w-5 mr-2 text-sky-600" />
            <span className="font-medium text-gray-700">Microsoft</span>
          </button>

          <button
            type="button"
            onClick={handleGitHubSignIn}
            className="flex items-center justify-center w-full py-3 rounded-lg bg-[#f3f3f3] border border-gray-300 hover:bg-gray-200 transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon={faGithub} className="h-5 w-5 mr-2 text-gray-800" />
            <span className="font-medium text-gray-700"> GitHub</span>
          </button>
        </div>
      </form>

      {showCaptcha && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="glass-card p-8 text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Verify you are human
            </h3>

            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={handleCaptchaVerify}
            />

            <button
              onClick={() => setShowCaptcha(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
