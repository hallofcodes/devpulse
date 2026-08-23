"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Oauth2 from "../Oauth2";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : "/d";

  const [email, setEmail] = useState("");
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

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!grecaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error(
        "Recaptcha Enterprise is not loaded. Please try again later.",
      );
      return;
    }

    setLoading(true);

    const signUp = new Promise<void>(async (resolve, reject) => {
      try {
        if (password !== confirmPassword) {
          return reject(new Error("Passwords do not match!"));
        }

        const token = await window.grecaptcha.enterprise.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
          { action: "register" },
        );

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, token }),
        });

        const data = await res.json();
        if (!res.ok) return reject(new Error(data.error));

        await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signUp, {
      pending: "Creating account...",
      success: {
        render() {
          setLoading(false);
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          
          return "Please check your email to verify your account.";
        },
      },
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to sign up. Please try again.";
        },
      },
    });
  };

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm Password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <p className="text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link
            href="/legal/terms"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Register
        </button>

        <div className="flex items-center justify-center gap-2">
          <span className="w-16 h-px bg-gray-200" />
          <span className="text-sm text-gray-500">Or continue with</span>
          <span className="w-16 h-px bg-gray-200" />
        </div>

        <Oauth2 redirectTo={redirectTo} />
      </form>
    </>
  );
}
