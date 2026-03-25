import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import AOSWrapper from "./components/AOSWrapper";
import DevToolsDetector from "./components/DevToolsDetector";
import NextTopLoader from "nextjs-toploader";
import { headers } from "next/headers";
import NortonSafeweb from "./components/NortonSafeweb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();

  return {
    metadataBase: new URL("https://devpulse-waka.vercel.app"),
    title:
      "DevPulse - Monitor Your Coding Activity and Compete on Leaderboards",
    description:
      "DevPulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
    keywords: [
      "DevPulse",
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
      canonical: `https://devpulse-waka.vercel.app${h.get("x-pathname")}`,
      types: {
        "application/xml": "https://devpulse-waka.vercel.app/sitemap.xml",
      },
    },
    openGraph: {
      title:
        "DevPulse - Monitor Your Coding Activity and Compete on Leaderboards",
      description:
        "DevPulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
      url: `https://devpulse-waka.vercel.app${h.get("x-pathname")}`,
      siteName: "DevPulse",
      images: [
        {
          url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
          width: 1200,
          height: 630,
          alt: "DevPulse Cover Image",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "DevPulse - Monitor Your Coding Activity and Compete on Leaderboards",
      description:
        "DevPulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
      images: [
        {
          url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
          alt: "DevPulse Cover Image",
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
        url: "/favicon.png",
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
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="9BoujBl0viqXOwAOwv8uJM-JkJo7gDrt_f1ID9NabRI"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="hostname" content="devpulse-waka.vercel.app" />
        <NortonSafeweb />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader showSpinner={false} />
        <AOSWrapper />
        {children}
        <ToastContainer
          toastStyle={{ backgroundColor: "#312e81", color: "#fff" }}
        />
        {isProduction && (
          <>
            <DevToolsDetector />
          </>
        )}
      </body>
    </html>
  );
}
