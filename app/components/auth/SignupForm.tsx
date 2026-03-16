"use client";

import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useRef<HCaptcha>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  const handleOAuthSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
  };

  const handleCaptchaVerify = async (token: string) => {
    setShowCaptcha(false);
    setLoading(true);

    const signUp = new Promise(async (resolve, reject) => {
      try {
        if (password !== confirmPassword) {
          return reject(new Error("Passwords do not match!"));
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { captchaToken: token },
        });

        if (error) return reject(error);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signUp, {
      pending: "Signing up...",
      success: {
        render() {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          return "Signed up successfully! Check your email to confirm your account.";
        },
      },
      error: {
        render({ data }) {
          if (captcha.current) captcha.current.resetCaptcha();
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to signup. Please try again.";
        },
      },
    });
  };

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-6">
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-0 top-3 w-4 h-4 text-indigo-400" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-transparent border-0 border-b border-white/10 py-2.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-indigo-500 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-0 top-3 w-4 h-4 text-indigo-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent border-0 border-b border-white/10 py-2.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-indigo-500 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-0 top-3 w-4 h-4 text-indigo-400" />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-transparent border-0 border-b border-white/10 py-2.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-indigo-500 transition-colors"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60 text-gray-400 shadow-none"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
          }`}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <button
          type="button"
          onClick={handleOAuthSignUp}
          className="btn-secondary w-full py-2.5 !rounded-lg text-sm flex items-center justify-center gap-2 group hover:bg-white/[0.05] transition-colors"
        >
          <FontAwesomeIcon icon={faGithub} className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          Continue with GitHub
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
