/**
 * Upload produced assets to Cloudflare R2.
 * Usage: npx tsx scripts/uploadAssets.ts
 *
 * Requires wrangler CLI configured with R2 bucket access.
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const BUCKET = 'banyan-tree-assets'

const assets = [
  { local: 'output/monkey-and-crocodile/monkey-and-crocodile.mp3', remote: 'episodes/monkey-and-crocodile.mp3' },
  { local: 'output/birbal-khichdi/birbal-khichdi.mp3', remote: 'episodes/birbal-khichdi.mp3' },
  { local: 'content/artwork/monkey-and-crocodile.png', remote: 'artwork/monkey-and-crocodile.png' },
  { local: 'content/artwork/birbal-khichdi.png', remote: 'artwork/birbal-khichdi.png' },
  { local: 'output/monkey-and-crocodile/monkey-and-crocodile.txt', remote: 'scripts/monkey-and-crocodile.txt' },
  { local: 'output/birbal-khichdi/birbal-khichdi.txt', remote: 'scripts/birbal-khichdi.txt' },
  { local: 'content/suggested-questions/monkey-and-crocodile.json', remote: 'suggested-questions/monkey-and-crocodile.json' },
  { local: 'content/suggested-questions/birbal-khichdi.json', remote: 'suggested-questions/birbal-khichdi.json' },
]

for (const asset of assets) {
  const localPath = join(process.cwd(), asset.local)
  if (!existsSync(localPath)) {
    console.log(`⏭ Skipping ${asset.local} (not found)`)
    continue
  }

  console.log(`⬆ Uploading ${asset.local} → ${asset.remote}`)
  try {
    execSync(`wrangler r2 object put ${BUCKET}/${asset.remote} --file=${localPath}`, {
      stdio: 'inherit',
    })
  } catch (err) {
    console.error(`Failed to upload ${asset.local}:`, err)
  }
}

console.log('\nDone! Assets uploaded to R2.')
