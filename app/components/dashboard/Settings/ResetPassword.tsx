"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function ResetPassword({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
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
    </>
  );
}
