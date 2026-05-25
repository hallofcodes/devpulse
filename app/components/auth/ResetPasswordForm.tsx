"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const captcha = useRef<HCaptcha>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifyResetSession = async () => {
      const type = searchParams.get("type");
      const code = searchParams.get("code");

      if (type && type !== "recovery") {
        router.replace("/login");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      if (!cancelled) setChecking(false);
    };

    verifyResetSession();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, supabase]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checking) return;
    setShowCaptcha(true);
  };

  const handleCaptchaVerify = async (_token: string) => {
    setShowCaptcha(false);
    setLoading(true);

    const updatePassword = new Promise(async (resolve, reject) => {
      try {
        if (password !== confirmPassword) {
          return reject(new Error("Passwords do not match."));
        }

        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return reject(error);

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(updatePassword, {
      pending: "Resetting password...",
      success: {
        render() {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          setPassword("");
          setConfirmPassword("");
          return "Password updated! You can log in now.";
        },
      },
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to reset password. Please try again.";
        },
      },
    });

    updatePassword.then(() => {
      router.replace("/login");
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="New Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm New Password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || checking}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading || checking
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          Reset Password
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
