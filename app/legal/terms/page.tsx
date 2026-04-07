import Footer from "@/app/components/layout/Footer";
import Nav from "@/app/components/layout/Nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - DevPulse",
  description:
    "Read our Terms of Service to understand the rules and guidelines for using DevPulse.",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden grid-bg relative">
      <Nav />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 lg:pb-32 min-h-[85vh]">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6">
          Terms of Service
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
          These Terms of Service (&quot;Terms&quot;) govern your use of{" "}
          <strong>DevPulse</strong>
          (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) available at{" "}
          <strong>devpulse-waka.vercel.app</strong>. By using this service, you
          agree to these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Use of the Service
        </h2>
        <p className="mb-4">
          DevPulse provides tools to visualize and analyze your coding activity
          using third-party integrations such as WakaTime and GitHub. You agree
          to use the service only for lawful purposes and in compliance with all
          applicable laws.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Accounts</h2>
        <p className="mb-2">
          To use certain features, you may be required to create an account
          using Supabase authentication. You agree to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Be responsible for all activity under your account</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Third-Party Services
        </h2>
        <p className="mb-2">
          DevPulse relies on third-party services, including:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Vercel (hosting)</li>
          <li>Supabase (authentication and backend)</li>
          <li>WakaTime API (coding statistics)</li>
          <li>GitHub OAuth (authentication and profile data)</li>
          <li>Google Search Console (analytics)</li>
          <li>Sentry (error monitoring)</li>
        </ul>
        <p className="mb-4">
          We are not responsible for the availability, accuracy, or practices of
          these third-party services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. API Keys and Integrations
        </h2>
        <p className="mb-4">
          You may provide a WakaTime API key to use certain features. You are
          responsible for keeping your API key secure. We are not liable for any
          misuse resulting from unauthorized access to your key.
        </p>
        <p className="mb-4">
          When you visit us and an error occurs, we may use Sentry to capture
          error details. This helps us improve the service, but we do not use
          this data for any other purpose.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Data and Content</h2>
        <p className="mb-4">
          You retain ownership of your data. By using the service, you grant us
          permission to process your data solely for the purpose of providing
          the service’s features.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          6. Service Availability
        </h2>
        <p className="mb-4">
          We do not guarantee that the service will be uninterrupted or
          error-free. Features may change, be modified, or discontinued at any
          time without notice.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          DevPulse is provided &quot;as is&quot; without warranties of any kind.
          We are not liable for any damages, including loss of data, arising
          from your use of the service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your access to the
          service at any time, without prior notice, if you violate these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Changes to Terms</h2>
        <p className="mb-4">
          We may update these Terms from time to time. Continued use of the
          service after changes means you accept the updated Terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">10. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us through
          the project repository or application interface.
        </p>
      </div>

      <Footer />
    </div>
  );
}
