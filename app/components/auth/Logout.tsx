"use client";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { useEffect } from "react";

export default function Logout() {
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      redirect("/");
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white px-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
    </div>
  );
}
