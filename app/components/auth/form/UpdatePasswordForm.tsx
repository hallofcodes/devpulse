"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grecaptchaLoaded, setGrecaptchaLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleUpdatePassword = async (
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

    const updateUserPasswordPromise = new Promise<void>(
      async (resolve, reject) => {
        try {
          const token = await window.grecaptcha.enterprise.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
            { action: "update_password" },
          );

          await fetch("/api/auth/update-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, token }),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (password !== confirmPassword)
              throw new Error("Passwords do not match!");
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      },
    );

    toast.promise(updateUserPasswordPromise, {
      pending: "Updating password...",
      success: {
        render() {
          setLoading(false);
          return "Password updated!";
        },
      },
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to update password. Please try again.";
        },
      },
    });
  };

  return (
    <>
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          className="input-field mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="input-field mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update Password
        </button>
      </form>
    </>
  );
}
