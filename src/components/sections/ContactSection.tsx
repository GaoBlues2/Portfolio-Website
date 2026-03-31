import { EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react'
import { motion } from 'motion/react'

const fields = [
  { label: 'Họ tên', type: 'text' as const },
  { label: 'Email', type: 'email' as const },
]

export function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-border bg-surface-elevated px-section-x py-section-y"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <EnvelopeSimple className="h-7 w-7" weight="duotone" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-accent">
                Phần 04
              </p>
              <h2
                id="contact-heading"
                className="font-serif text-3xl tracking-tight text-ink md:text-4xl"
                style={{ fontSize: 'var(--text-3xl)' }}
              >
                Liên hệ
              </h2>
            </div>
          </div>
          <p className="mt-6 max-w-md text-ink-muted">
            Form và thông tin liên hệ — chỉ là bố cục, chưa gắn backend.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-ink-muted">
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" weight="duotone" />
              <span>Địa chỉ / múi giờ (placeholder)</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-accent" weight="duotone" />
              <span>Điện thoại (placeholder)</span>
            </li>
            <li className="flex items-center gap-3">
              <EnvelopeSimple
                className="h-5 w-5 shrink-0 text-accent"
                weight="duotone"
              />
              <span>email@example.com</span>
            </li>
          </ul>
        </motion.div>

        <motion.form
          className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          onSubmit={(e) => e.preventDefault()}
        >
          {fields.map((f) => (
            <label key={f.label} className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-ink">{f.label}</span>
              <input
                type={f.type}
                name={f.label}
                placeholder="—"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          ))}
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-ink">Tin nhắn</span>
            <textarea
              name="message"
              rows={4}
              placeholder="—"
              className="resize-y rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <motion.button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Gửi (demo)
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}
