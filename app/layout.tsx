import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import AOSWrapper from "./components/AOSWrapper";
import DevToolsDetector from "./components/DevToolsDetector";
import NextTopLoader from "nextjs-toploader";

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevPulse - Monitor Your Coding Activity and Compete on Leaderboards",
  description:
    "DevPulse is a platform that tracks your coding activity and allows you to compete with other developers on leaderboards. Sign up now to start monitoring your coding habits and see how you stack up against the competition!",
};

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
