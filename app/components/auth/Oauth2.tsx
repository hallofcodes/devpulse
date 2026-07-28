import {
  faGithub,
  faGoogle,
  faMicrosoft,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";

export default function Oauth2({ redirectTo }: { redirectTo: string }) {
  const handleOAuth = (
    provider: "google" | "microsoft-entra-id" | "github",
  ) => {
    signIn(provider, { callbackUrl: redirectTo });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 hover:border-white/20 transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-400" />
        <span className="text-sm font-semibold">Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("microsoft-entra-id")}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 hover:border-white/20 transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faMicrosoft} className="h-5 w-5 text-sky-400" />
        <span className="text-sm font-semibold">Microsoft</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("github")}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 hover:border-white/20 transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faGithub} className="h-5 w-5 text-gray-200" />
        <span className="text-sm font-semibold">GitHub</span>
      </button>
    </div>
  );
}
