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
    // signIn(provider, { callbackUrl: redirectTo });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled
        className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-600" />
        <span className="text-sm font-semibold">Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("microsoft-entra-id")}
        disabled
        className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faMicrosoft} className="h-5 w-5 text-sky-600" />
        <span className="text-sm font-semibold">Microsoft</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("github")}
        disabled
        className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <FontAwesomeIcon icon={faGithub} className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-semibold">GitHub</span>
      </button>
    </div>
  );
}
