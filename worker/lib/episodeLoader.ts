interface Env {
  CACHE: KVNamespace
}

const EPISODE_SCRIPTS: Record<string, string> = {
  'monkey-and-crocodile': `Come, beta, sit with me. Tonight I want to tell you a story about a tree — a jambul tree, full of the sweetest purple fruit you can imagine — and about two friends who met beside a river. One was a monkey, and one was a crocodile.

Once upon a time, by the banks of a wide, shimmering river, there stood a magnificent jambul tree. Its branches were heavy with ripe purple fruit — so sweet, so juicy, that the smell would drift all the way across the water. And in that tree lived a monkey. He was a clever fellow — quick and bright, with kind eyes and a generous heart.

One day, a crocodile came swimming up the river. He was tired and hungry. The monkey tossed down a handful of ripe jambul, and the crocodile ate them gratefully. And so, day after day, the monkey and the crocodile met by the river. They became friends — real friends.

One evening, the crocodile brought some jambul fruit home to his wife. She ate the fruit and said: "These are very sweet. If the monkey eats such sweet fruit every day, imagine how sweet his heart must be." She wanted the monkey's heart.

The crocodile invited the monkey for a meal across the river. Halfway across, the crocodile began to sink. "I'm sorry, friend. My wife wants your heart."

But the monkey was clever. "Oh, my friend! Why didn't you tell me earlier? We monkeys don't carry our hearts inside us. We keep them safe in the hollow of our tree. Take me back and I'll fetch it!"

The crocodile believed him and swam back. The monkey leaped up into the highest branch. "No creature keeps its heart outside its body. A true friend would never have asked for it."

The monkey looked down with sad eyes — not angry, but sad. Because he had lost a friend. The crocodile hung his head and swam away.

What is a true friend, beta? A true friend shares with you. A true friend is honest. And a true friend would never ask for something that would hurt you.`,

  'birbal-khichdi': `Beta, tonight I want to tell you about Emperor Akbar and his clever minister Birbal. Akbar ruled over a great empire in India, and he loved riddles and clever answers. The cleverest person in his court was Birbal.

One cold winter day, Akbar asked: "Is there anyone brave enough to stand in the freezing Yamuna river all night?" A poor man stepped forward. "I will do it for a thousand gold coins."

That night, the poor man stood in the bitterly cold river. He survived by staring at a distant lamp burning in a palace window — it gave him something to hold onto.

When he came to collect his gold, a courtier said: "He cheated! The lamp's warmth helped him!" Akbar refused to pay. The poor man went to Birbal for help.

The next day, Birbal did not come to court. He said he was busy cooking khichdi. The curious Emperor went to see. In Birbal's courtyard, a pot hung on a very tall bamboo pole, with a tiny fire far below on the ground.

"Birbal! How can the fire cook a pot so far away?" asked Akbar.

"Your Majesty," said Birbal with a gentle smile, "the same way a man can warm himself with a lamp burning across a river."

Akbar laughed — a big, honest laugh. He understood. "Birbal, you are right. I was unfair." The poor man got his thousand gold coins.

Have you ever had to be patient when something wasn't fair, beta? Sometimes the bravest thing is to be clever — to show the truth so clearly that even the person who was wrong can smile.`,
}

export async function loadEpisodeScript(slug: string, env: Env): Promise<string | null> {
  const cacheKey = `script:${slug}`
  const cached = await env.CACHE.get(cacheKey)
  if (cached) return cached

  const script = EPISODE_SCRIPTS[slug]
  if (!script) return null

  await env.CACHE.put(cacheKey, script, { expirationTtl: 86400 })
  return script
}

export function getStoryContext(fullScript: string, positionSeconds: number): string {
  const wordsPerSecond = 2.5
  const wordsToInclude = Math.floor(positionSeconds * wordsPerSecond)
  const words = fullScript.split(/\s+/)

  if (wordsToInclude >= words.length) return fullScript

  const told = words.slice(0, wordsToInclude).join(' ')
  const remaining = words.slice(wordsToInclude)
  const summary = remaining.slice(0, 50).join(' ') + '...'

  return `${told}\n\n[The rest of the story continues: ${summary}]`
}
