import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-500">
        <div className="my-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-gray-600">
              © {new Date().getFullYear()} Devpulse
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/leaderboard"
              className="hover:text-gray-600 transition"
            >
              Leaderboard
            </Link>
            <Link href="/flex" className="hover:text-gray-600 transition">
              Flex
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-gray-600 transition"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-gray-600 transition"
            >
              Terms
            </Link>
            <a
              href="https://github.com/hallofcodes/devpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600">
          <Link href="https://www.hallofcodes.org">
            Made with ❤️ by Hall of Codes
          </Link>
        </div>
      </div>
    </footer>
  );
}
