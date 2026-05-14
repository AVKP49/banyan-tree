import { Shield, Heart, TreePine } from 'lucide-react'

export function About() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="py-6 font-serif text-3xl font-bold text-ink">About The Banyan Tree</h1>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-3">
            <TreePine className="h-6 w-6 text-monsoon" />
            <h2 className="font-serif text-xl font-semibold text-ink">Our Story</h2>
          </div>
          <p className="font-serif text-base leading-relaxed text-ink/70">
            The Banyan Tree is the trusted home of Indian storytelling for diaspora children. We
            bring Panchatantra, Akbar-Birbal, and folk tales from every corner of India to life with
            beautiful audio narration — and a grandmother, Dadi, who answers your child's questions
            in her own warm voice.
          </p>
          <p className="mt-4 font-serif text-base leading-relaxed text-ink/70">
            We built this for the parent in New Jersey, Toronto, or London who wants their child to
            hear the same stories they grew up with — told beautifully, in English, with the warmth
            and wisdom intact.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-6 w-6 text-terracotta" />
            <h2 className="font-serif text-xl font-semibold text-ink">Meet Dadi</h2>
          </div>
          <p className="font-serif text-base leading-relaxed text-ink/70">
            Dadi is a grandmother in her late sixties who grew up in a small town in India. She's
            warm, patient, slightly playful, and never lectures. She teaches by question more often
            than by answer. She mentions her village's banyan tree, the smell of cardamom in chai,
            the monsoon rains, and her own dadi who told her these stories when she was small.
          </p>
          <p className="mt-4 font-serif text-base leading-relaxed text-ink/70">
            When your child asks Dadi a question during a story, she responds in her own voice
            within seconds — grounded in the story, always warm, always safe.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-indigo" />
            <h2 className="font-serif text-xl font-semibold text-ink">Safety & Privacy</h2>
          </div>
          <p className="font-serif text-base leading-relaxed text-ink/70">
            The Banyan Tree is designed from the ground up for children's safety. We use a five-layer
            safety model that screens every question and every response. Dadi will only discuss
            stories, Indian culture, food, animals, geography, plants, and simple morals. She gently
            redirects anything else.
          </p>
          <ul className="mt-4 space-y-2 font-serif text-base text-ink/70">
            <li>• No audio recordings of children are ever stored</li>
            <li>• No personal data is collected from children</li>
            <li>• No third-party trackers or advertising</li>
            <li>• Parents can review every question and response</li>
            <li>• COPPA and CCPA compliant by design</li>
          </ul>
        </section>

        <section className="rounded-[12px] bg-cream p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-sans text-sm font-semibold text-ink">What age is this for?</p>
              <p className="mt-1 font-serif text-sm text-ink/70">
                Children ages 4 to 9. The stories and Dadi's language are calibrated for this range.
              </p>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-ink">Is it free?</p>
              <p className="mt-1 font-serif text-sm text-ink/70">
                Yes. The v1 library is completely free. Subscriptions for the full library may come later.
              </p>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-ink">What languages does Dadi speak?</p>
              <p className="mt-1 font-serif text-sm text-ink/70">
                Dadi speaks English and sprinkles in Hindi and other heritage-language words, explaining each one.
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-12 border-t border-ink/10 py-6 text-center">
        <p className="font-sans text-xs text-ink/40">
          <a href="/legal/privacy-policy" className="hover:text-ink/60">Privacy Policy</a>
          {' · '}
          <a href="/legal/terms-of-service" className="hover:text-ink/60">Terms of Service</a>
        </p>
      </footer>
    </div>
  )
}
