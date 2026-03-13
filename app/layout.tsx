import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";

import { PwaRegister } from "@/components/pwa/PwaRegister";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: "#07111f",
};

export const metadata: Metadata = {
  title: "ToDoApp",
  description: "A futuristic PWA task hub with history and recurring routines.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ToDoApp",
  },
  icons: {
    icon: [
      { url: "/icon/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${spaceGrotesk.variable} ${orbitron.variable}`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
