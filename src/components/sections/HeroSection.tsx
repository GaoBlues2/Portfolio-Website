import { Suspense } from 'react'

import { Lanyard } from '../lanyard/Lanyard'
import Shuffle from '../ui/Shuffle'

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-dvh w-full overflow-hidden bg-[linear-gradient(to_bottom,#030712_0%,#02040a_40%,#000_100%)] items-center justify-start"
      aria-label="Khu vực hero"
    >
      {/* Canvas Lanyard ở phía sau */}
      <div className="absolute inset-0 z-1 w-full pointer-events-none">
        <Suspense fallback={null}>
          <Lanyard transparent />
        </Suspense>
      </div>

      {/* Ánh sáng rọi từ trên xuống */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-250px] z-[1] h-[700px] w-[900px] -translate-x-1/2 blur-[20px] bg-[radial-gradient(ellipse_at_top,rgba(120,220,255,0.35)_0%,rgba(80,180,255,0.18)_18%,rgba(40,120,255,0.08)_35%,rgba(0,0,0,0)_70%)]"
        aria-hidden
      />

      <div
        className="relative z-[2] w-full lg:w-2/3 px-6 md:px-12 lg:px-20 text-white space-y-3 md:space-y-4"
        style={{ lineHeight: 'revert' }}
      >
        <p className="text-base md:text-lg text-slate-200">Hi, I'm Ethan</p>
        <Shuffle
          tag="h1"
          text="Fullstack Developer"
          className="text-white"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce
          triggerOnHover
          respectReducedMotion
          loop={false}
          loopDelay={0}
          textAlign="left"
        />
        <p>
          <span className="block text-lg md:text-xl text-slate-200">
            I build scalable web and mobile products across Web2 and Web3.
          </span>
        </p>
      </div>
    </section>
  )
}
