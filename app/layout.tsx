import type { Metadata } from "next";
import { Jost, Inter, Dancing_Script, Baloo_2, Poppins } from "next/font/google";
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

const scriptFont = Dancing_Script({
  variable: "--font-script",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

// Landing page + login/signup/reset-password card + reset-password page use
// their own "playful" type system (Baloo 2 headings, Poppins body) instead
// of the Jost/Inter pair the rest of the app uses.
const playfulFont = Baloo_2({
  variable: "--font-baloo",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const friendlyFont = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
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
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${scriptFont.variable} ${playfulFont.variable} ${friendlyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem("sb-locale");if(l){document.documentElement.lang=l;if(l==="ar")document.documentElement.dir="rtl"}}catch(e){}`,
          }}
        />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
