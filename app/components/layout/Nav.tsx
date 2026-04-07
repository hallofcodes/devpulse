import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import Image from "next/image";
import Link from "next/link";
import ProfileDropdown from "../ProfileDropdown";

export default async function Nav() {
  const { user } = await getUserWithProfile();

  return (
    <header className="absolute top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
          data-aos="fade-down"
        >
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <span className="text-xl font-bold tracking-tight">DevPulse</span>
        </Link>

        {user ? (
          <ProfileDropdown
            avatar={
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              user.user_metadata?.avatar ||
              null
            }
            name={user.user_metadata?.name || user.email!.split("@")[0]}
            email={user.email!}
          />
        ) : (
          <div
            className="flex items-center gap-6 text-sm font-medium"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-white/10 hover:bg-white/20 border border-white/5 px-6 py-2.5 rounded-full transition-all shadow-lg backdrop-blur-md"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
