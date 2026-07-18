import Hero from "@/components/landing/Hero";
import Showcase from "@/components/landing/Showcase";
import HowItWorks from "@/components/landing/HowItWorks";
import SkillsMarquee from "@/components/landing/SkillsMarquee";
import JoinSection from "@/components/landing/JoinSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #f7fef9 45%, #ecfdf5 100%)",
        backgroundAttachment: "fixed",
        fontFamily: "var(--font-friendly)",
        color: "var(--neu-ink)",
      }}
    >
      <Hero />
      <Showcase />
      <HowItWorks />
      <SkillsMarquee />
      <JoinSection />
      <Footer />
    </main>
  );
}
