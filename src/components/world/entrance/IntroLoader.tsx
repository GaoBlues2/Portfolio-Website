import { useEffect } from 'react'
import './awakening.css'

export function IntroLoader({ ready, onComplete }: { ready: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(onComplete, 180)
    return () => window.clearTimeout(timer)
  }, [ready, onComplete])

  return <div className={`intro-loader${ready ? ' intro-loader--ready' : ''}`}>
    <div className="intro-loader__content" role="status" aria-live="polite">
      <p className="intro-loader__label">{ready ? 'Welcome to my world' : 'Preparing your world'}</p>
      <div className="intro-loader__track" aria-hidden="true"><div /></div>
    </div>
  </div>
}
