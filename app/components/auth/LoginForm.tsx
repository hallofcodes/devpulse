"use client";

import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  const handleOAuthSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
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
      router.push("/dashboard");
    });
  };

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

        <button
          type="button"
          onClick={handleOAuthSignIn}
          className="btn-secondary w-full py-3"
        >
          Sign In with GitHub
        </button>
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
