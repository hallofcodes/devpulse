"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ResetPassword({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleCaptchaVerify = async (_token: string) => {
    setShowCaptcha(false);
    setLoading(true);

    const resetUserPassword = fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 mb-3.5">
          <p className="text-sm text-gray-900 font-semibold mb-0.5">
            Reset Password
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            Send a secure reset link to{" "}
            <span className="text-gray-600">{email}</span>.
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
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Verify you are human
            </h3>

            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={handleCaptchaVerify}
            />

            <button
              onClick={() => setShowCaptcha(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
