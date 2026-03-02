import Link from "next/link";
import SignupForm from "@/app/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - DevPulse",
  description:
    "Create a DevPulse account to monitor your coding activity and compete on leaderboards.",
};

export default async function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center">DevPulse</h2>
        <p className="mb-6 text-gray-400">
          Create your account to start monitoring your coding activity and
          competing on leaderboards!
        </p>

        <SignupForm />

        <Link
          href="/login"
          className="block mt-4 text-center text-sm text-gray-400 hover:text-gray-300"
        >
          Already have an account? Log In
        </Link>
      </div>
    </div>
  );
}
