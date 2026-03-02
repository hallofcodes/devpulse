"use client";

import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captcha = useRef<HCaptcha>(null);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const signInWithPassword = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });

        if (error) return reject(error);

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signInWithPassword, {
      pending: "Logging in...",
      success: {
        render() {
          if (captcha.current) captcha.current.resetCaptcha();
          router.push("/dashboard");
          return "Login successful! Redirecting...";
        },
      },
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 mb-4 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-4 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="mb-4">
        <HCaptcha
          ref={captcha}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
          onVerify={(token) => {
            setCaptchaToken(token);
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 mb-3 rounded-lg font-semibold transition
         ${
           loading
             ? "bg-gray-700 cursor-not-allowed opacity-70"
             : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105"
         }`}
      >
        Login
      </button>
    </form>
  );
}
