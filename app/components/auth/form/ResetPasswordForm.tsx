"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetToken) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (!grecaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error(
        "Recaptcha Enterprise is not loaded. Please try again later.",
      );
      return;
    }

    setLoading(true);

    const updatePasswordPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const token = await window.grecaptcha.enterprise.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
          { action: "reset_password" },
        );

        await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reset_token: resetToken, password, token }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          if (password !== confirmPassword)
            throw new Error("Passwords do not match.");
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(updatePasswordPromise, {
      pending: "Resetting password...",
      success: {
        render() {
          setLoading(false);
          setPassword("");
          setConfirmPassword("");
          return "Password updated! You can log in now.";
        },
      },
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to reset password. Please try again.";
        },
      },
    });

    updatePasswordPromise.then(() => {
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
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          Reset Password
        </button>
      </form>
    </>
  );
}
