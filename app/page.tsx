import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import CommunityTrust from "@/components/landing/CommunityTrust";
import GrowingTogether from "@/components/landing/GrowingTogether";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Testimonials from "@/components/landing/Testimonials";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

// Each section below now animates its own entrance (Framer Motion
// whileInView + staggerChildren on its card grid), so sections no longer
// need to be wrapped in the old <Reveal> component.
export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <CommunityTrust />
      <GrowingTogether />
      <FeatureGrid />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  );
}
