import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// next/font serves the files from this app: no request to Google at run time, no layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Bookmarked - Personal Media Tracker",
    template: "%s · Bookmarked",
  },
  description: "Track the books you read and the movies you watch.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the class before hydration, so the server and client html differ
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
