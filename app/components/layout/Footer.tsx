import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-gray-300">
              © {new Date().getFullYear()} DevPulse
            </p>
            <p className="text-gray-500 mt-1">
              Built by{" "}
              <span className="text-indigo-400 font-medium">Hall of Codes</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/legal/privacy"
              className="hover:text-gray-300 transition"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-gray-300 transition"
            >
              Terms
            </Link>
            <a
              href="https://github.com/hallofcodes/devpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="my-6 border-t border-white/5" />

        <div className="text-center text-xs text-gray-600">
          <p>Open-source project maintained by the DevPulse team.</p>
        </div>
      </div>
    </footer>
  );
}
