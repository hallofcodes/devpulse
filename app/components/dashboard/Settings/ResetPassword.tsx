"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function ResetPassword({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [grecaptchaLoaded, setGrecaptchaLoaded] = useState(false);

  useEffect(() => {
    const loadGrecaptcha = () => {
      const scriptId = "recaptcha-enterprise";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.onload = () => setGrecaptchaLoaded(true);
        document.body.appendChild(script);
      } else {
        setGrecaptchaLoaded(true);
      }
    };

    loadGrecaptcha();
  }, []);

  const handleResetPassword = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!grecaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error(
        "Recaptcha Enterprise is not loaded. Please try again later.",
      );
      return;
    }

    setLoading(true);

    const resetUserPasswordPromise = new Promise<void>(
      async (resolve, reject) => {
        try {
          const token = await window.grecaptcha.enterprise.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
            { action: "forgot_password" },
          );

          await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      },
    );

    toast.promise(resetUserPasswordPromise, {
      pending: "Sending reset email...",
      success: {
        render() {
          setLoading(false);
          return "Reset email sent!";
        },
      },
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return (
            err?.message || "Failed to send reset email. Please try again."
          );
        },
      },
    });
  };

  return (
    <form
      onSubmit={handleResetPassword}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faShieldHalved}
            className="w-3.5 h-3.5 text-gray-600"
          />
        </div>
        <h3 className="font-bold text-gray-900 tracking-tight">Security</h3>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 mb-3.5">
        <p className="text-sm text-gray-900 font-semibold mb-1.5">
          Reset Password
        </p>
        <div className="flex items-start gap-1.5 text-xs md:text-sm text-gray-500">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="w-3 h-3 text-gray-400 mt-0.5 shrink-0"
          />
          <span>
            Send a secure reset link to{" "}
            <span className="text-gray-700 font-medium">{email}</span>.
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn-primary !px-4 !py-2 text-sm leading-none ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Preparing..." : "Send Reset Link"}
      </button>
    </form>
  );
}
