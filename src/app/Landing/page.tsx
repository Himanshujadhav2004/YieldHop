"use client";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { LandingNav } from "@/components/LandingNav";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GridPatternCard, GridPatternCardBody } from "@/components/ui/card-with-grid-ellipsis-pattern"
import { FeaturesSectionWithHoverEffects } from "@/components/feature-section-with-hover-effects";
import { Meteors } from "@/components/ui/meteors";
import { Footerdemo } from "@/components/ui/footer-section";

import { DollarSign, Lock, Shuffle, Send, Shield} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";


function Landing(){
   
  const words = [
    {
      text: " Earn",
    },
    {
      text: "across",
    },
    {
      text: "chains",
    },
    {
      text:"with"
    }
  ,
    {
      text:"YieldHop",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  const timelineData = [
  {
    id: 1,
    title: "Earn",
    date: "Jun 2024",
    content: "Users earn optimized yield automatically.",
    category: "Feature",
    icon: DollarSign,
    relatedIds: [2],
    status: "pending" as const,
    energy: 20,
  },
  {
    id: 2,
    title: "Stake",
    date: "Jun 2024",
    content: "Users stake once across chains.",
    category: "Feature",
    icon: Lock,
    relatedIds: [1, 3],
    status: "pending" as const,
    energy: 20,
  },
  {
    id: 3,
    title: "Cross",
    date: "Jun 2024",
    content: "Enables cross-chain yield routing.",
    category: "Feature",
    icon: Shuffle,
    relatedIds: [2, 4],
    status: "pending" as const,
    energy: 20,
  },
  {
    id: 4,
    title: "Route",
    date: "Jun 2024",
    content: "Assets are routed automatically.",
    category: "Feature",
    icon: Send,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 20,
  },
  {
    id: 5,
    title: "Trust",
    date: "Jun 2024",
    content: "Built on Chainlink's trusted infrastructure.",
    category: "Feature",
    icon: Shield,
    relatedIds: [4],
    status: "pending" as const,
    energy: 20,
  },
];

return(<div>
  <GridPatternCard>
      <GridPatternCardBody>
<LandingNav></LandingNav>

    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        The journey to smarter finance starts here
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Stake now
        </button>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Earn now
        </button>
      </div>
    </div>
  
     </GridPatternCardBody>
    </GridPatternCard>

      <Card className=" dark:bg-black/[0.96] bg-white relative overflow-hidden flex flex-col items-center justify-center h-[40rem] ">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex h-full w-[1150px]">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl md:text-3xl font-bold 
  text-black 
  dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-400">
      <span className="text-blue-500">Chainlink </span>CCIP Automation
          </h1>
          <p className="mt-4 text-black dark:text-neutral-300 max-w-lg">
Chainlink CCIP and Automation enable secure, automated cross-chain yield transfers and smart contract execution.          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>

    <GridPatternCard>
      <GridPatternCardBody>
     <div className="h-[600px] w-full">
      <div className="w-full">
        <FeaturesSectionWithHoverEffects />
      </div>
    </div>
    </GridPatternCardBody>
    </GridPatternCard>
    <section className="w-full px-4 py-10 lg:py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10">
        
        {/* Timeline Left */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <RadialOrbitalTimeline timelineData={timelineData} />
        </div>

        {/* Info Right */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-blue-100/50 dark:border-zinc-700/50 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-10 blur-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-10 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  About YieldHop
                </h2>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-6">
                YieldHop is a cross-chain yield optimizer powered by <span className="font-semibold text-blue-600 dark:text-blue-400">Chainlink CCIP</span> and <span className="font-semibold text-indigo-600 dark:text-indigo-400">Automation</span>. It routes stablecoins across chains to find the best returns automatically and securely.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Stake once, earn everywhere</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Secure cross-chain yield routing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Built on Chainlink infrastructure</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Fully decentralized & transparent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>



          <div className="block">
      <Footerdemo />
    </div>
</div>

)

}

export default Landing;