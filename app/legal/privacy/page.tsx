import Footer from "@/app/components/layout/Footer";
import Nav from "@/app/components/layout/Nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - DevPulse",
  description:
    "Read our Privacy Policy to understand how we collect, use, and protect your information when you use DevPulse.",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden grid-bg relative">
      <Nav />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 lg:pb-32 min-h-[85vh]">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6">
          Privacy Policy
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
          This Privacy Policy explains how <strong>DevPulse</strong>{" "}
          (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses,
          and protects your information when you use
          <strong> devpulse-waka.vercel.app</strong>.{" "}
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Information We Collect
        </h2>

        <h3 className="font-semibold mt-4">a. Automatically Collected Data</h3>
        <p className="mb-2">
          Our application is hosted on Vercel. Vercel may automatically collect
          certain information such as:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Request logs and usage data</li>
        </ul>

        <h3 className="font-semibold mt-4">b. Authentication (Supabase)</h3>
        <p className="mb-2">
          We use Supabase as our authentication provider. When you sign up or
          log in, we collect:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Email address</li>
          <li>Password</li>
        </ul>
        <p className="mb-4">
          This information is securely processed and stored by Supabase to
          create and manage your account. We do not directly store or have
          access to your password in plain text.
        </p>

        <h3 className="font-semibold mt-4">c. WakaTime API Key</h3>
        <p className="mb-4">
          When you use DevPulse, you may provide your WakaTime API key. This key
          is used solely to fetch your coding activity data from the WakaTime
          API and generate statistics. We do not use this key for any other
          purpose.
        </p>

        <h3 className="font-semibold mt-4">d. GitHub OAuth Data</h3>
        <p className="mb-2">
          When you connect your GitHub account via OAuth2, we may access:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Your name</li>
          <li>Your email address</li>
        </ul>
        <p className="mb-4">
          This information is used only to identify your account and personalize
          your experience.
        </p>

        <h3 className="font-semibold mt-4">e. Sentry</h3>
        <p className="mb-4">
          We use Sentry for error monitoring. While only error-related features
          are enabled, Sentry may still collect certain information, including
          personally identifiable information (PII), stack traces, and request
          data. This information is used solely to help diagnose errors and
          improve the reliability and performance of the application.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 mb-4">
          <li>To authenticate users and manage accounts</li>
          <li>To fetch and display your coding statistics</li>
          <li>To personalize your experience</li>
          <li>To improve the performance and reliability of the app</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Third-Party Services
        </h2>
        <p className="mb-4">
          We use third-party services that may collect and process data:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Vercel (hosting and infrastructure)</li>
          <li>Supabase (authentication and backend services)</li>
          <li>Google Search Console (search performance monitoring)</li>
          <li>WakaTime API (coding activity data)</li>
          <li>GitHub OAuth (authentication and profile data)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Data Storage and Security
        </h2>
        <p className="mb-4">
          We take reasonable measures to protect your information.
          Authentication data is handled securely by Supabase. However, no
          method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Sharing</h2>
        <p className="mb-4">
          We do not sell, trade, or rent your personal information. Data is only
          shared with third-party services as necessary to operate the
          application.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
        <p className="mb-4">
          You may choose not to provide certain information (such as your
          WakaTime API key or GitHub access), but this may limit functionality.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          7. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          through the project repository or application interface.
        </p>
      </div>

      <Footer />
    </div>
  );
}
