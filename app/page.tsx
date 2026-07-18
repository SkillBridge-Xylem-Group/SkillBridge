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
        background: "linear-gradient(135deg, #fdf3e7 0%, #f3eefc 45%, #e3edfb 100%)",
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
