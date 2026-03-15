"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { useEffect } from "react";

export default function Logout() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      router.push("/");
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white grid-bg">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
