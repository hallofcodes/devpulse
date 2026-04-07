import Image from "next/image";
import UpdatePasswordForm from "@/app/components/auth/UpdatePasswordForm";
import { Metadata } from "next";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "Update Password - DevPulse",
};

export default async function UpdatePassword() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white px-4 grid-bg relative">

        <div className="w-full max-w-lg glass-card p-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
            <h2 className="text-2xl font-bold gradient-text">DevPulse</h2>
          </div>
          <p className="mb-8 text-gray-400 text-sm">
            Update your password to keep your account secure. Enter a strong new
          </p>

          <UpdatePasswordForm />
        </div>
      </div>

      <Footer />
    </>
  );
}
