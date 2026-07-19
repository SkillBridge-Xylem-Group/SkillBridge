import type { Metadata } from "next";
import { Jost, Inter, Dancing_Script, Baloo_2, Poppins } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

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
            __html: `try{var l=localStorage.getItem("sb-locale");if(l){document.documentElement.lang=l;document.documentElement.dir="ltr"}}catch(e){}`,
          }}
        />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}