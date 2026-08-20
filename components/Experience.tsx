"use client";

import dynamic from "next/dynamic";
import { useMasterScroll } from "@/lib/animation/useMasterScroll";
import TopNav from "@/components/navigation/TopNav";
import Sidebar from "@/components/sidebar/Sidebar";
import RightProgress from "@/components/progress/RightProgress";
import MobileProgress from "@/components/progress/MobileProgress";
import Footer from "@/components/ui/Footer";
import ColorPicker from "@/components/ui/ColorPicker";
import EngineStart from "@/components/ui/EngineStart";
import RevealScene from "@/components/scenes/RevealScene";
import HeroScene from "@/components/scenes/HeroScene";
import PowerScene from "@/components/scenes/PowerScene";
import CarbonScene from "@/components/scenes/CarbonScene";
import WheelsScene from "@/components/scenes/WheelsScene";
import InteriorScene from "@/components/scenes/InteriorScene";
import SpecificationsScene from "@/components/scenes/SpecificationsScene";
import BeastScene from "@/components/scenes/BeastScene";
import FinalCTA from "@/components/scenes/FinalCTA";

// The R3F canvas touches window/WebGL — load client-only, no SSR.
const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), {
  ssr: false,
});

export default function Experience() {
  useMasterScroll();

  return (
    <>
      <SceneCanvas />
      <TopNav />
      <Sidebar />
      <RightProgress />
      <MobileProgress />
      <ColorPicker />
      <EngineStart />

      <main className="relative z-10 md:pl-[172px] lg:pl-[212px]">
        <RevealScene />
        <HeroScene />
        <PowerScene />
        <CarbonScene />
        <WheelsScene />
        <InteriorScene />
        <SpecificationsScene />
        <BeastScene />
        <FinalCTA />
      </main>

      <div className="md:pl-[172px] lg:pl-[212px]">
        <Footer />
      </div>
    </>
  );
}
