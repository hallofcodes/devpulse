import { Metadata } from "next/types";
import { Suspense } from "react";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import VerifyWakatime from "@/app/components/auth/VerifyWakatime";

export const metadata: Metadata = {
  title: "Verify Wakatime - Devpulse",
};

export default async function VerifyWakatimePage() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.wakatime_api_key) {
    return redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyWakatime />
    </Suspense>
  );
}
