import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedSkills from "@/components/landing/FeaturedSkills";
import ImpactSection from "@/components/landing/ImpactSection";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FeaturedSkills />
      <ImpactSection />
      <FinalCta />
      <Footer />
    </main>
  );
}