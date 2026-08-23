import { Suspense } from "react";
import Logout from "@/app/components/auth/Logout";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
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
      <Logout />
    </Suspense>
  );
}
