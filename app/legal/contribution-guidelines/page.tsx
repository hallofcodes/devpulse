export const dynamic = "force-static";

import Footer from "@/app/components/layout/Footer";
import Nav from "@/app/components/layout/Nav";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Contribution Guidelines - Devpulse",
  description:
    "Read our Contribution Guidelines to understand how you can contribute to Devpulse.",
};

export default function ContributionGuidelines() {
  return (
    <div className="min-h-screen  overflow-hidden grid-bg relative">
      <Nav />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 lg:pb-32 min-h-[85vh]">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6">
          Contribution Guidelines
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
          Thank you for considering contributing to <strong>Devpulse</strong>!
          To help maintain the quality, stability, and integrity of our codebase
          (&quot;Hall of Codes&quot;), please read and follow these guidelines.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Before Contributing
        </h2>
        <p className="mb-4">
          Please reach out to us before modifying any existing design or logic
          that is currently working or in active use. This ensures we avoid
          conflicts and preserve the stability of Devpulse.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. What You Can Contribute
        </h2>
        <p className="mb-4">You are welcome to:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Propose or contribute new features</li>
          <li>Fix bugs or improve documentation</li>
        </ul>
        <p className="mb-4">
          Before submitting a pull request (PR), check the{" "}
          <strong>Issues</strong> tab if it exists to avoid duplicating work or
          causing conflicts.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. PR Review Policy</h2>
        <p className="mb-4">
          Any PR that modifies existing, working code without prior discussion
          may not be merged. We reserve the right to reject contributions that
          conflict with ongoing development or compromise the stability of the
          Devpulse.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Protecting the Hall of Codes
        </h2>
        <p className="mb-4">
          Our codebase represents the core of <strong>Devpulse</strong>.
          Contributors are expected to respect coding standards, write clean,
          maintainable code, and document changes clearly. Unauthorized
          modifications, destructive changes, or attempts to bypass review
          processes are not allowed and may result in removal of the
          contribution.
        </p>

        <p className="mb-4">
          By contributing, you agree to follow these guidelines to keep Devpulse
          stable, reliable, and enjoyable for all users.
        </p>
      </div>

      <Footer />
    </div>
  );
}
