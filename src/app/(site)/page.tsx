import { HeroSection } from "@/components/home/hero-section";
import { IntroSection } from "@/components/home/intro-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { getSettings } from "@/lib/data/settings";

export default async function Home() {
  const s = await getSettings([
    "hero.headline",
    "hero.subheadline",
    "hero.tagline.ko",
    "intro.body",
    "cta.final.headline",
  ]);

  return (
    <>
      <HeroSection
        headline={s["hero.headline"]}
        subheadline={s["hero.subheadline"]}
        tagline={s["hero.tagline.ko"]}
      />
      <IntroSection body={s["intro.body"]} />
      <FinalCtaSection headline={s["cta.final.headline"]} />
    </>
  );
}
