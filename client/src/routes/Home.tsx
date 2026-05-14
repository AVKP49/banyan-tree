import { Link } from 'wouter'
import { Play, MessageCircle, BookOpen } from 'lucide-react'

export function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="py-12 text-center md:py-20">
        <h1 className="font-display text-5xl text-monsoon md:text-7xl">
          The Banyan Tree
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-serif text-xl leading-relaxed text-ink/80 italic md:text-2xl">
          Indian fables, beautifully told. And now — your child can ask Dadi why.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/library"
            className="flex items-center gap-2 rounded-[12px] bg-saffron px-8 py-4 font-sans text-lg font-semibold text-white shadow-lg transition-all hover:bg-saffron/90 hover:shadow-xl"
          >
            <Play className="h-5 w-5" />
            Listen Now
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 rounded-[12px] border-2 border-ink/20 px-8 py-4 font-sans text-lg font-semibold text-ink/70 transition-all hover:border-ink/40"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="grid w-full max-w-3xl gap-8 py-12 md:grid-cols-3">
        <FeatureCard
          icon={<BookOpen className="h-8 w-8 text-monsoon" />}
          title="Timeless Stories"
          description="Panchatantra, Akbar-Birbal, and folk tales from every region of India — told in Dadi's warm voice."
        />
        <FeatureCard
          icon={<MessageCircle className="h-8 w-8 text-saffron" />}
          title="Ask Dadi"
          description="Your child can pause any story and ask Dadi a question. She answers in her own voice, in seconds."
        />
        <FeatureCard
          icon={<span className="text-3xl">🪔</span>}
          title="Learn a Word"
          description="Every episode teaches one heritage-language word. Watch your child's vocabulary grow, story by story."
        />
      </section>

      <section className="w-full max-w-2xl rounded-[12px] bg-cream p-8 text-center shadow-sm">
        <p className="font-serif text-lg text-ink/70 italic">
          "Come, beta, sit with me under the banyan tree. I have a story for you — one my dadi told
          me when I was just your size."
        </p>
        <p className="mt-4 font-sans text-sm font-medium text-ink/50">— Dadi</p>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[12px] bg-cream p-6 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-ink/60">{description}</p>
    </div>
  )
}
