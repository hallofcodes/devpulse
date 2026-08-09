"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setLoading(true);

    const updateUserPassword = fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (password !== confirmPassword)
        throw new Error("Passwords do not match!");
    });

    toast.promise(updateUserPassword, {
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
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          Update Password
        </button>
      </form>
    </>
  );
}
