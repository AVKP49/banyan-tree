import { motion } from 'framer-motion'

interface Props {
  message?: string
}

export function DiyaLoader({ message = 'Dadi is thinking…' }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <motion.div
        className="text-4xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🪔
      </motion.div>
      <p className="font-serif text-sm text-ink/60 italic">{message}</p>
    </div>
  )
}
