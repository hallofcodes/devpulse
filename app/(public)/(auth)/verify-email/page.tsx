import { Metadata } from "next/types";
import { Suspense } from "react";
import VerifyEmail from "@/app/components/auth/VerifyEmail";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify Email - Devpulse",
  description: "Verify your email address to activate your Devpulse account.",
};

export default async function VerifyEmailPage() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

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
