"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
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

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!grecaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error(
        "Recaptcha Enterprise is not loaded. Please try again later.",
      );
      return;
    }

    setLoading(true);

    const sendResetPromise = new Promise<void>(async (resolve, reject) => {
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
    });

    toast.promise(sendResetPromise, {
      pending: "Hold tight...",
      success: "Reset instructions sent! Check your email.",
      error: {
        render({ data }) {
          const err = data as Error;
          return (
            err?.message ||
            "Failed to send reset instructions. Please try again."
          );
        },
      },
    });

    sendResetPromise.then(() => {
      setLoading(false);
    });
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          className="input-field"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          // disabled={loading}
          disabled
          className={`disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          Send reset instructions
        </button>
      </form>
    </>
  );
}
