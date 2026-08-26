import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import AOSWrapper from "./components/AOSWrapper";
import DevToolsDetector from "./components/DevToolsDetector";
import NextTopLoader from "nextjs-toploader";
import NortonSafeweb from "./components/common/metadata/NortonSafeweb";
import BrowserCheck from "./components/BrowserCheck";
import { Metadata } from "next/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const revalidate = 43200; // 12 hours (in seconds)

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://devpulse.hallofcodes.org"),
    title:
      "Devpulse - Monitor Your Coding Activity and Compete on Leaderboards",
    description:
      "Devpulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
    keywords: [
      "Devpulse",
      "coding activity tracker",
      "developer leaderboards",
      "WakaTime integration",
      "coding stats",
      "programming habits",
      "developer competition",
      "flex your projects",
      "coding streaks",
      "productivity insights",
    ],
    alternates: {
      canonical: "https://devpulse.hallofcodes.org",
      types: {
        "application/xml": "https://devpulse.hallofcodes.org/sitemap.xml",
      },
    },
    openGraph: {
      title:
        "Devpulse - Monitor Your Coding Activity and Compete on Leaderboards",
      description:
        "Devpulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
      url: "https://devpulse.hallofcodes.org",
      siteName: "Devpulse",
      images: [
        {
          url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
          width: 1200,
          height: 630,
          alt: "Devpulse Cover Image",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Devpulse - Monitor Your Coding Activity and Compete on Leaderboards",
      description:
        "Devpulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
      images: [
        {
          url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
          alt: "Devpulse Cover Image",
        },
      ],
    },
    icons: [
      {
        rel: "icon",
        url: "/favicon.ico",
      },
      {
        rel: "icon",
        url: "/favicon-32x32.png",
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const env = process.env.NEXT_PUBLIC_NODE_ENV || "production";
  const isProduction = env === "production";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="hostname" content="devpulse.hallofcodes.org" />

        <link
          rel="alternate"
          type="application/xml"
          href="https://devpulse.hallofcodes.org/sitemap.xml"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <NortonSafeweb />
      </head>
      <body className="antialiased">
        <NextTopLoader showSpinner={false} color="#2563eb" />
        <AOSWrapper />

        {children}

        <ToastContainer
          toastStyle={{
            backgroundColor: "#ffffff",
            color: "#1a1f2e",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        />

        {isProduction && (
          <>
            <DevToolsDetector />
            <BrowserCheck />
          </>
        )}
      </body>
    </html>
  );
}
