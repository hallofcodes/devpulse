"use client";

import { useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { User } from "@supabase/supabase-js";

export default function ResetPassword({ user }: { user: User }) {
  const supabase = createClient();
  const [email] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleCaptchaVerify = async (token: string) => {
    setShowCaptcha(false);
    setLoading(true);

    const resetUserPassword = new Promise(async (resolve, reject) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/update-password`,
          captchaToken: token,
        });

        if (error) return reject(error);
        resolve("Reset email sent!");
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(resetUserPassword, {
      pending: "Sending reset email...",
      success: {
        render() {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          return "Reset email sent!";
        },
      },
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return (
            err?.message || "Failed to send reset email. Please try again."
          );
        },
      },
    });
  };

  const handleResetPassword = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  return (
    <>
      <form
        onSubmit={handleResetPassword}
        className="glass-card p-5 border-t-4 border-violet-500/40"
      >
        <h3 className="text-xs font-semibold text-violet-300 uppercase tracking-widest mb-4">
          Security
        </h3>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 mb-3.5">
          <p className="text-sm text-white font-semibold mb-0.5">Reset Password</p>
          <p className="text-xs md:text-sm text-gray-400">
            Send a secure reset link to <span className="text-gray-300">{email}</span>.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary !px-4 !py-2 text-sm leading-none"
        >
          {loading ? "Preparing..." : "Send Reset Link"}
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
