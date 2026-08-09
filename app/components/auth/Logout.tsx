"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

export default function Logout() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  return (
    <div className="min-h-screen flex items-center justify-center  grid-bg">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
