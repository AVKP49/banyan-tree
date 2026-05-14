#!/usr/bin/env python3
"""
Create beautiful SVG artwork for episodes, converted to a usable format.
These serve as placeholder artwork until AI-generated images are ready.
"""

import os

ARTWORK = {
    "monkey-and-crocodile": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E07A1F;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#F7F2E7;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1E3A5F;stop-opacity:0.4"/>
      <stop offset="100%" style="stop-color:#2E5D4B;stop-opacity:0.6"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#sky)"/>
  <!-- Water -->
  <ellipse cx="512" cy="850" rx="600" ry="200" fill="url(#water)" opacity="0.5"/>
  <!-- Tree trunk -->
  <rect x="280" y="200" width="60" height="500" rx="15" fill="#5D4037"/>
  <rect x="300" y="200" width="20" height="500" rx="5" fill="#6D4C41" opacity="0.5"/>
  <!-- Tree canopy -->
  <circle cx="310" cy="200" r="180" fill="#2E5D4B" opacity="0.8"/>
  <circle cx="250" cy="230" r="120" fill="#3E7D5B" opacity="0.7"/>
  <circle cx="380" cy="250" r="100" fill="#4E8D6B" opacity="0.6"/>
  <circle cx="310" cy="160" r="130" fill="#2E6D4B" opacity="0.5"/>
  <!-- Hanging roots -->
  <line x1="240" y1="330" x2="230" y2="450" stroke="#5D4037" stroke-width="3" opacity="0.5"/>
  <line x1="280" y1="350" x2="275" y2="480" stroke="#5D4037" stroke-width="3" opacity="0.5"/>
  <line x1="370" y1="340" x2="380" y2="460" stroke="#5D4037" stroke-width="3" opacity="0.5"/>
  <!-- Fruits -->
  <circle cx="220" cy="250" r="8" fill="#6A1B9A"/>
  <circle cx="350" cy="200" r="8" fill="#6A1B9A"/>
  <circle cx="280" cy="170" r="8" fill="#7B1FA2"/>
  <circle cx="400" cy="280" r="8" fill="#6A1B9A"/>
  <circle cx="200" cy="300" r="8" fill="#7B1FA2"/>
  <!-- Monkey -->
  <circle cx="350" cy="300" r="30" fill="#D4A537"/>
  <circle cx="350" cy="275" r="22" fill="#D4A537"/>
  <circle cx="340" cy="270" r="4" fill="#2A1F17"/>
  <circle cx="360" cy="270" r="4" fill="#2A1F17"/>
  <ellipse cx="350" cy="282" rx="8" ry="5" fill="#C49427"/>
  <path d="M350 330 Q340 380 330 400" stroke="#D4A537" stroke-width="6" fill="none"/>
  <!-- Crocodile in water -->
  <ellipse cx="650" cy="780" rx="120" ry="30" fill="#4E7D5B"/>
  <ellipse cx="700" cy="770" rx="40" ry="15" fill="#5E8D6B"/>
  <circle cx="720" cy="762" r="5" fill="#D4A537"/>
  <circle cx="730" cy="762" r="5" fill="#D4A537"/>
  <circle cx="720" cy="760" r="2" fill="#2A1F17"/>
  <circle cx="730" cy="760" r="2" fill="#2A1F17"/>
  <!-- Sun -->
  <circle cx="800" cy="120" r="80" fill="#E07A1F" opacity="0.3"/>
  <circle cx="800" cy="120" r="50" fill="#D4A537" opacity="0.5"/>
  <!-- Title area -->
  <rect x="0" y="880" width="1024" height="144" fill="#2A1F17" opacity="0.7"/>
  <text x="512" y="940" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#F7F2E7" font-weight="bold">The Monkey and the Crocodile</text>
  <text x="512" y="985" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#D4A537">From the Panchatantra</text>
  <!-- Border -->
  <rect x="10" y="10" width="1004" height="1004" rx="20" fill="none" stroke="#B5532A" stroke-width="4" opacity="0.3"/>
  <rect x="20" y="20" width="984" height="984" rx="16" fill="none" stroke="#D4A537" stroke-width="1" opacity="0.3"/>
</svg>""",

    "birbal-khichdi": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="night" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1E3A5F;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#F7F2E7;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#night)"/>
  <!-- Stars -->
  <circle cx="100" cy="80" r="2" fill="#F7F2E7" opacity="0.7"/>
  <circle cx="250" cy="50" r="2" fill="#F7F2E7" opacity="0.5"/>
  <circle cx="400" cy="100" r="3" fill="#F7F2E7" opacity="0.6"/>
  <circle cx="600" cy="60" r="2" fill="#F7F2E7" opacity="0.8"/>
  <circle cx="750" cy="90" r="2" fill="#F7F2E7" opacity="0.5"/>
  <circle cx="900" cy="70" r="3" fill="#F7F2E7" opacity="0.6"/>
  <circle cx="150" cy="150" r="2" fill="#F7F2E7" opacity="0.4"/>
  <circle cx="500" cy="130" r="2" fill="#F7F2E7" opacity="0.7"/>
  <!-- Palace arches -->
  <rect x="100" y="400" width="824" height="300" fill="#B5532A" opacity="0.3" rx="10"/>
  <path d="M200 400 Q300 300 400 400" fill="#B5532A" opacity="0.4"/>
  <path d="M400 400 Q500 300 600 400" fill="#B5532A" opacity="0.4"/>
  <path d="M600 400 Q700 300 800 400" fill="#B5532A" opacity="0.4"/>
  <!-- Pillars -->
  <rect x="200" y="400" width="20" height="300" fill="#D4A537" opacity="0.5"/>
  <rect x="400" y="400" width="20" height="300" fill="#D4A537" opacity="0.5"/>
  <rect x="600" y="400" width="20" height="300" fill="#D4A537" opacity="0.5"/>
  <rect x="800" y="400" width="20" height="300" fill="#D4A537" opacity="0.5"/>
  <!-- Bamboo pole -->
  <rect x="508" y="200" width="8" height="500" fill="#6D8B4E" rx="4"/>
  <!-- Pot at top -->
  <ellipse cx="512" cy="200" rx="35" ry="25" fill="#5D4037"/>
  <ellipse cx="512" cy="195" rx="25" ry="10" fill="#6D4C41"/>
  <!-- Small fire at bottom -->
  <polygon points="500,700 512,670 524,700" fill="#E07A1F" opacity="0.8"/>
  <polygon points="505,700 512,680 519,700" fill="#D4A537" opacity="0.9"/>
  <circle cx="512" cy="705" r="15" fill="#E07A1F" opacity="0.2"/>
  <!-- Birbal figure (left) -->
  <circle cx="350" cy="550" r="25" fill="#D4A537"/>
  <rect x="335" y="575" width="30" height="80" rx="5" fill="#2E5D4B"/>
  <circle cx="343" cy="545" r="3" fill="#2A1F17"/>
  <circle cx="357" cy="545" r="3" fill="#2A1F17"/>
  <!-- Akbar figure (right) -->
  <circle cx="680" cy="540" r="30" fill="#D4A537"/>
  <rect x="660" y="570" width="40" height="90" rx="5" fill="#B5532A"/>
  <!-- Crown -->
  <polygon points="660,520 680,500 700,520" fill="#D4A537" opacity="0.8"/>
  <circle cx="680" cy="505" r="5" fill="#E07A1F"/>
  <circle cx="672" cy="535" r="3" fill="#2A1F17"/>
  <circle cx="688" cy="535" r="3" fill="#2A1F17"/>
  <!-- Ground -->
  <rect x="0" y="720" width="1024" height="304" fill="#2E5D4B" opacity="0.15"/>
  <!-- Title area -->
  <rect x="0" y="880" width="1024" height="144" fill="#2A1F17" opacity="0.7"/>
  <text x="512" y="940" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#F7F2E7" font-weight="bold">Birbal's Khichdi</text>
  <text x="512" y="985" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#D4A537">An Akbar-Birbal Tale</text>
  <!-- Border -->
  <rect x="10" y="10" width="1004" height="1004" rx="20" fill="none" stroke="#D4A537" stroke-width="4" opacity="0.3"/>
  <rect x="20" y="20" width="984" height="984" rx="16" fill="none" stroke="#B5532A" stroke-width="1" opacity="0.3"/>
</svg>""",
}

def main():
    artwork_dir = os.path.join("public", "artwork")
    os.makedirs(artwork_dir, exist_ok=True)

    for slug, svg_content in ARTWORK.items():
        svg_path = os.path.join(artwork_dir, f"{slug}.svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        print(f"Created {svg_path}")

    print("\nArtwork created! Update episodes.json to use .svg instead of .png")

if __name__ == "__main__":
    main()
