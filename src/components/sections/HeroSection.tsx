import { Suspense } from 'react'

import PixelSnow from '../backgrounds/PixelSnow'
import { Lanyard } from '../lanyard/Lanyard'
import Shuffle from '../ui/Shuffle'

export function HeroSection() {
  const capabilities = [
    'UI Systems',
    'APIs',
    'Mobile Apps',
    '3D Web',
    'AI Workflows',
    'Web3 Products',
  ]

  return (
    <section
      id="top"
      className="relative flex min-h-dvh w-full overflow-hidden bg-black items-center justify-start"
      aria-label="Khu vực hero"
    >
      <div className="absolute inset-0 z-0">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.3}
          direction={125}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.16)_40%,rgba(0,0,0,0.56)_76%,rgba(0,0,0,0.82)_100%)]"
        aria-hidden
      />

      {/* Canvas Lanyard ở phía sau */}
      <div className="absolute inset-0 z-1 w-full pointer-events-none">
        <Suspense fallback={null}>
          <Lanyard transparent />
        </Suspense>
      </div>

      {/* Lớp sáng phụ để giữ vùng headline sáng hơn effect nền */}
      <div
        className="pointer-events-none absolute left-[24%] top-[12%] z-[1] h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 blur-[56px] bg-[radial-gradient(circle,rgba(140,180,255,0.09)_0%,rgba(120,150,220,0.05)_34%,rgba(0,0,0,0)_72%)]"
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
          autoShuffleInterval={5000}
          textAlign="left"
        />
        <div className="max-w-3xl space-y-3">
          <p className="text-lg font-medium text-white md:text-xl">
            I turn ideas into production-ready products.
          </p>
          <p className="text-base text-slate-300 md:text-lg">
            UI, APIs, motion, 3D, mobile, Web3, and the systems behind them.
          </p>
        </div>
        <div className="flex max-w-3xl flex-wrap gap-2 pt-1 text-sm text-slate-200 md:text-base">
          {capabilities.map((capability) => (
            <span
              key={capability}
              className="rounded-full border border-white/20 bg-white/6 px-3 py-1.5 backdrop-blur-sm"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
