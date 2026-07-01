import Hero from "@/components/landing/Hero";
import HeroCtaSection from "@/components/landing/HeroCtaSection";
import About from "@/components/landing/About";
import Subjects from "@/components/landing/Subjects";
import Stats from "@/components/landing/Stats";
import Growth from "@/components/landing/Growth";
import HowItWorks from "@/components/landing/HowItWorks";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HeroCtaSection />
      <About />
      <Subjects />
      <Stats />
      <Growth />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </main>
  );
}