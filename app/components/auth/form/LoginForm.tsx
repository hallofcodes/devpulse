"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Oauth2 from "../Oauth2";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : "/d";
  const justVerified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const loginPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const token = await window.grecaptcha.enterprise.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
          { action: "login" },
        );

        const result = await signIn("credentials", {
          email,
          password,
          token,
          redirect: false,
        });

        if (result?.error)
          return reject(new Error("Invalid email or password."));
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(loginPromise, {
      pending: "Logging in...",
      success: "Login successful! Redirecting...",
      error: {
        render({ data }) {
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });

    loginPromise
      .then(() => {
        router.push(redirectTo);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {justVerified && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Thank you for verifying your email!
        </div>
      )}
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

        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          className="input-field"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href={
              redirectTo
                ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
                : "/signup"
            }
            className="text-blue-500 hover:underline"
          >
            Sign up
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="w-16 h-px bg-gray-700" />
          <span className="text-sm text-gray-500">Or continue with</span>
          <span className="w-16 h-px bg-gray-700" />
        </div>

        <Oauth2 redirectTo={redirectTo} />
      </form>
    </>
  );
}
