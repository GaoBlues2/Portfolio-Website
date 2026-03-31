import { UserCircle } from '@phosphor-icons/react'
import { motion } from 'motion/react'

const blocks = [
  { title: 'Cột 1', body: 'Nội dung giới thiệu / kỹ năng (placeholder).' },
  { title: 'Cột 2', body: 'Timeline hoặc highlight (placeholder).' },
  { title: 'Cột 3', body: 'Sở thích, ngôn ngữ, v.v. (placeholder).' },
]

export function AboutSection() {
  return (
    <section
      id="about"
      className="border-t border-border bg-surface-elevated px-section-x py-section-y"
      aria-labelledby="about-heading"
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
              <UserCircle className="h-7 w-7" weight="duotone" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-accent">
                Phần 02
              </p>
              <h2
                id="about-heading"
                className="font-serif text-3xl tracking-tight text-ink md:text-4xl"
                style={{ fontSize: 'var(--text-3xl)' }}
              >
                Giới thiệu
              </h2>
            </div>
          </div>
          <p className="max-w-md text-ink-muted">
            Grid 3 cột trên desktop, xếp chồng trên mobile.
          </p>
        </motion.div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b, i) => (
            <motion.li
              key={b.title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3 className="mb-2 font-semibold text-ink">{b.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{b.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
