import { getCurrentUser } from "@/app/lib/auth/user";
import Image from "next/image";
import Link from "next/link";
import NavProfileDropdown from "../common/NavProfileDropdown";

export default async function Nav() {
  const { user } = await getCurrentUser();

  return (
    <header className="absolute top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
          data-aos="fade-down"
        >
          <Image src="/logo.svg" alt="Devpulse Logo" width={36} height={36} />
          <span className="text-xl font-bold tracking-tight">Devpulse</span>
        </Link>

        {user ? (
          <NavProfileDropdown
            avatar={user.image ?? null}
            name={user.name ?? user.email?.split("@")[0] ?? ""}
            email={user.email ?? ""}
            type="navbar"
          />
        ) : (
          <div
            className="flex items-center gap-6 text-sm font-medium"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full transition-all shadow-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
