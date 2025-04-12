import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import AboutSection from "@/components/AboutSection";
// Removed WaitlistSection import

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <FeatureSection />
        <AboutSection />
        {/* WaitlistSection component removed */}
      </main>
    </div>
  );
}
