import Image from "next/image";
import UpdatePasswordForm from "@/app/components/auth/form/UpdatePasswordForm";
import { Metadata } from "next/types";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "Update Password - Devpulse",
};

export default async function UpdatePassword() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center  px-4 relative">
        <div className="w-full max-w-lg glass-card p-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/apple-touch-icon.png" alt="Devpulse Logo" width={36} height={36} />
            <h2 className="text-2xl font-bold gradient-text">Devpulse</h2>
          </div>
          <p className="mb-8 text-gray-500 text-sm">
            Update your password to keep your account secure. Enter a strong new
          </p>

          <UpdatePasswordForm />
        </div>
      </div>

      <Footer />
    </>
  );
}
