import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Network } from "@/components/home/Network";
import { Steps } from "@/components/home/Steps";
import { Testimonials } from "@/components/home/Testimonials";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** The public partner registration page (S1). Hero and benefits must fit above the fold at 1366×768. */
export function HomePage() {
  return (
    <div className="at-root at-sky po-page" id="top">
      <SiteHeader />
      <main>
        <Hero />
        <Benefits />
        <Steps />
        <Network />
        <Testimonials />
        <CtaBanner />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
