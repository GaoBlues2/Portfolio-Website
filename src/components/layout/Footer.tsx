import { ArrowUp } from '@phosphor-icons/react'
import { motion } from 'motion/react'

export function Footer() {
  return (
    <motion.footer
      className="border-t border-border bg-surface-elevated"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-section-x py-10 sm:flex-row sm:py-8">
        <p className="text-center text-sm text-ink-muted sm:text-left">
          © {new Date().getFullYear()} — Layout portfolio (placeholder)
        </p>
        <motion.button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:border-accent hover:text-accent"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Lên đầu trang
          <ArrowUp className="h-4 w-4" weight="bold" aria-hidden />
        </motion.button>
      </div>
    </motion.footer>
  )
}
