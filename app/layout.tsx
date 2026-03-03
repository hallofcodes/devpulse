import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastContainer
          toastStyle={{ backgroundColor: "#312e81", color: "#fff" }}
        />
      </body>
    </html>
  );
}
