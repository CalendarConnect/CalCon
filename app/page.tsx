import HeroSection from "@/components/homepage/hero-section";
import WaitlistCTA from "@/components/homepage/waitlist-cta";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <WaitlistCTA />
    </main>
  );
}
