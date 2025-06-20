"use client";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { LandingNav } from "@/components/LandingNav";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GridPatternCard, GridPatternCardBody } from "@/components/ui/card-with-grid-ellipsis-pattern"
import { FeaturesSectionWithHoverEffects } from "@/components/feature-section-with-hover-effects";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
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
    title: "Planning",
    date: "Jan 2024",
    content: "Project planning and requirements gathering phase.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Design",
    date: "Feb 2024",
    content: "UI/UX design and system architecture.",
    category: "Design",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Development",
    date: "Mar 2024",
    content: "Core features implementation and testing.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "Testing",
    date: "Apr 2024",
    content: "User testing and bug fixes.",
    category: "Testing",
    icon: User,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 5,
    title: "Release",
    date: "May 2024",
    content: "Final deployment and release.",
    category: "Release",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 10,
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
          Join now
        </button>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Signup
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
   
      <RadialOrbitalTimeline timelineData={timelineData} />
</div>

)

}

export default Landing;