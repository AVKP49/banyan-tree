/**
 * Artwork generation prompts for episode cover art.
 * These prompts are designed for AI image generation (Stability AI, SDXL, etc.)
 *
 * Usage: npx tsx scripts/generateArtwork.ts
 */

const artworkPrompts = [
  {
    slug: 'monkey-and-crocodile',
    style: 'Madhubani folk art',
    prompt:
      'A Madhubani-style folk art illustration of a clever monkey sitting in a lush jambul tree by a river, with a crocodile in the water below. Rich colors: saffron, terracotta, deep green. Intricate line patterns filling every surface. Indian folk art style with double-line borders. Square composition, 1024x1024. No text.',
  },
  {
    slug: 'birbal-khichdi',
    style: 'Mughal miniature',
    prompt:
      'A Mughal miniature painting style illustration showing a clever man (Birbal) standing in a courtyard next to a very tall bamboo pole with a small pot hanging at the top, and a tiny fire far below on the ground. An amused king (Akbar) watching. Rich gold, indigo, and terracotta colors. Ornate border with floral patterns. Square composition, 1024x1024. No text.',
  },
]

console.log('Episode Artwork Generation Prompts')
console.log('==================================\n')

for (const art of artworkPrompts) {
  console.log(`Episode: ${art.slug}`)
  console.log(`Style: ${art.style}`)
  console.log(`Prompt:\n${art.prompt}\n`)
  console.log(`Save to: content/artwork/${art.slug}.png\n`)
  console.log('---\n')
}

console.log('Use these prompts with your preferred image generation tool.')
console.log('Save output as 1024x1024 PNG to content/artwork/<slug>.png')
