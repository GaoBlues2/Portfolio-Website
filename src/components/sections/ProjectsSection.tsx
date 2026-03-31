import { FolderOpen } from '@phosphor-icons/react'
import { motion } from 'motion/react'

const placeholders = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Dự án ${i + 1}`,
}))

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="border-t border-border px-section-x py-section-y"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <FolderOpen className="h-7 w-7" weight="duotone" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-accent">
                Phần 03
              </p>
              <h2
                id="projects-heading"
                className="font-serif text-3xl tracking-tight text-ink md:text-4xl"
                style={{ fontSize: 'var(--text-3xl)' }}
              >
                Dự án
              </h2>
            </div>
          </div>
          <p className="max-w-md text-ink-muted">
            Lưới thẻ responsive: 1 → 2 → 3 cột.
          </p>
        </motion.div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.45 }}
            >
              <article className="group overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-[16/10] bg-gradient-to-br from-accent-soft to-surface" />
                <div className="p-5">
                  <h3 className="font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    Mô tả ngắn — placeholder
                  </p>
                  <motion.span
                    className="mt-4 inline-block text-sm font-medium text-accent"
                    whileHover={{ x: 4 }}
                  >
                    Chi tiết →
                  </motion.span>
                </div>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
