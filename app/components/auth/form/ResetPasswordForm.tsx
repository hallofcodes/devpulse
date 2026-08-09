"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    const updatePassword = fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (password !== confirmPassword)
        throw new Error("Passwords do not match.");
    });

    toast.promise(updatePassword, {
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
