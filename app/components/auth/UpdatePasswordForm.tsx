"use client";

import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { toast } from "react-toastify";

export default function UpdatePasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleCaptchaVerify = async (token: string) => {
    // Optionally use token here when implemented to backend
    void token;
    setShowCaptcha(false);
    setLoading(true);

    const updateUserPassword = new Promise(async (resolve, reject) => {
      try {
        if (password !== confirmPassword) {
          return reject(new Error("Passwords do not match!"));
        }

        const { error } = await supabase.auth.updateUser({
          password,
          // options: { captchaToken: token },
        });

        if (error) return reject(error);
        resolve("Password updated!");
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(updateUserPassword, {
      pending: "Updating password...",
      success: {
        render() {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          return "Password updated!";
        },
      },
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to update password. Please try again.";
        },
      },
    });
  };

  const handleUpdatePassword = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setShowCaptcha(true);
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
