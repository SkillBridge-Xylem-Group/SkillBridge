import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

// Salesforce-Avant-Garde / Salesforce-Sans (from the Slack-style skill) are
// proprietary Salesforce assets with no public distribution, so they can't be
// loaded via next/font/google. Jost is an open-source geometric sans built in
// the same Avant Garde Gothic family the skill calls for, used here for
// display/headings; Inter stands in for Salesforce-Sans as the body/UI face.
const displayFont = Jost({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillBridge",
  description: "Trade skills with people worldwide, at no cost, on SkillBridge.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
