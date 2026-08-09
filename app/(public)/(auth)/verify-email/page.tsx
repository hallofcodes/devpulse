import { Metadata } from "next/types";
import { Suspense } from "react";
import VerifyEmail from "@/app/components/auth/VerifyEmail";
import { auth } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Verify Email - Devpulse",
  description: "Verify your email address to activate your Devpulse account.",
};

export default async function VerifyEmailPage() {
  const session = await auth();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmail sessionEmail={session?.user?.email} />
    </Suspense>
  );
}
