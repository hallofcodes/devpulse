"use client";

import { useState } from "react";
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

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const loginPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
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
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });

    loginPromise.then(() => {
      router.push(redirectTo);
    });
  };

  return (
    <>
      {justVerified && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Email verified successfully. You can now log in.
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
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
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
