#!/usr/bin/env python3
"""Upgrade all episode artwork to richer decorative style."""
import os

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%%" y1="0%%" x2="100%%" y2="100%%">
      <stop offset="0%%" stop-color="#F7F2E7"/>
      <stop offset="100%%" stop-color="#EDE4D0"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <g opacity="0.08" fill="%(accent)s">
    <circle cx="80" cy="80" r="60"/><circle cx="80" cy="80" r="45" fill="#F7F2E7"/><circle cx="80" cy="80" r="30"/><circle cx="80" cy="80" r="15" fill="#F7F2E7"/>
    <circle cx="944" cy="80" r="60"/><circle cx="944" cy="80" r="45" fill="#F7F2E7"/><circle cx="944" cy="80" r="30"/><circle cx="944" cy="80" r="15" fill="#F7F2E7"/>
    <circle cx="80" cy="944" r="60"/><circle cx="80" cy="944" r="45" fill="#F7F2E7"/><circle cx="80" cy="944" r="30"/><circle cx="80" cy="944" r="15" fill="#F7F2E7"/>
    <circle cx="944" cy="944" r="60"/><circle cx="944" cy="944" r="45" fill="#F7F2E7"/><circle cx="944" cy="944" r="30"/><circle cx="944" cy="944" r="15" fill="#F7F2E7"/>
  </g>
  <rect x="36" y="36" width="952" height="952" rx="16" fill="none" stroke="%(accent)s" stroke-width="1" opacity="0.15"/>
  <rect x="48" y="48" width="928" height="928" rx="12" fill="none" stroke="%(border)s" stroke-width="2" opacity="0.25"/>
  %(silhouette)s
  %(title_block)s
  <line x1="350" y1="%(div_y)s" x2="465" y2="%(div_y)s" stroke="#D4A537" stroke-width="1" opacity="0.5"/>
  <circle cx="512" cy="%(div_y)s" r="4" fill="#D4A537" opacity="0.4"/>
  <line x1="559" y1="%(div_y)s" x2="674" y2="%(div_y)s" stroke="#D4A537" stroke-width="1" opacity="0.5"/>
  <text x="512" y="%(trad_y)s" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#B5532A" letter-spacing="5" opacity="0.6">%(tradition)s</text>
  <text x="512" y="%(region_y)s" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#2A1F17" opacity="0.3">%(region)s</text>
  <g transform="translate(512, 880)" opacity="0.12">
    <ellipse cx="0" cy="0" rx="18" ry="8" fill="#B5532A"/>
    <polygon points="-3,-8 0,-22 3,-8" fill="#E07A1F"/>
    <circle cx="0" cy="-18" r="4" fill="#D4A537" opacity="0.6"/>
  </g>
</svg>"""

EPISODES = [
    {
        "slug": "blue-jackal",
        "title1": "The Blue",
        "title2": "Jackal",
        "tradition": "PANCHATANTRA",
        "region": "Pan-Indian",
        "accent": "#1E3A5F",
        "border": "#1E3A5F",
        "silhouette": '<g opacity="0.07" transform="translate(512, 290)"><ellipse cx="0" cy="0" rx="40" ry="25" fill="#1E3A5F"/><ellipse cx="-15" cy="-15" rx="12" ry="8" fill="#1E3A5F" transform="rotate(-20)"/><path d="M25,0 Q45,-5 40,10" stroke="#1E3A5F" stroke-width="3" fill="none"/></g>',
    },
    {
        "slug": "thirsty-crow",
        "title1": "The Thirsty",
        "title2": "Crow",
        "tradition": "PANCHATANTRA",
        "region": "Pan-Indian",
        "accent": "#2A1F17",
        "border": "#E07A1F",
        "silhouette": '<g opacity="0.07" transform="translate(512, 280)"><circle cx="0" cy="20" r="30" fill="#2A1F17"/><circle cx="0" cy="0" r="15" fill="#2A1F17"/><path d="M-20,20 Q-50,10 -40,25" stroke="#2A1F17" stroke-width="3" fill="none"/><path d="M20,20 Q50,10 40,25" stroke="#2A1F17" stroke-width="3" fill="none"/><ellipse cx="0" cy="60" rx="20" ry="35" fill="#2A1F17" opacity="0.5"/></g>',
    },
    {
        "slug": "tenali-rama-brinjals",
        "title1": "Tenali Rama",
        "title2": "the Brinjals",
        "tradition": "TENALI RAMA",
        "region": "South India",
        "accent": "#2E5D4B",
        "border": "#2E5D4B",
        "silhouette": '<g opacity="0.07" transform="translate(512, 290)"><ellipse cx="0" cy="0" rx="25" ry="35" fill="#2E5D4B"/><rect x="-2" y="-40" width="4" height="15" rx="2" fill="#2E5D4B"/></g>',
        "and": True,
    },
    {
        "slug": "cap-seller-monkeys",
        "title1": "The Cap Seller",
        "title2": "the Monkeys",
        "tradition": "INDIAN FOLK TALE",
        "region": "Pan-Indian",
        "accent": "#B5532A",
        "border": "#E07A1F",
        "silhouette": '<g opacity="0.07" transform="translate(512, 280)"><rect x="-30" y="-5" width="60" height="20" rx="10" fill="#B5532A"/><rect x="-20" y="-15" width="40" height="15" rx="5" fill="#B5532A"/></g>',
        "and": True,
    },
    {
        "slug": "lion-and-rabbit",
        "title1": "The Lion",
        "title2": "the Rabbit",
        "tradition": "PANCHATANTRA",
        "region": "Pan-Indian",
        "accent": "#D4A537",
        "border": "#D4A537",
        "silhouette": '<g opacity="0.07" transform="translate(512, 280)"><circle cx="0" cy="0" r="35" fill="#D4A537"/><path d="M-15,-30 Q-10,-60 -5,-30" fill="#D4A537"/><path d="M5,-30 Q10,-60 15,-30" fill="#D4A537"/></g>',
        "and": True,
    },
    {
        "slug": "golden-swan",
        "title1": "The Golden",
        "title2": "Swan",
        "tradition": "JATAKA TALES",
        "region": "East India",
        "accent": "#D4A537",
        "border": "#D4A537",
        "silhouette": '<g opacity="0.08" transform="translate(512, 280)"><path d="M0,30 Q-10,10 -5,-10 Q0,-30 10,-15 Q15,0 5,15 Q0,25 0,30Z" fill="#D4A537"/><path d="M-5,-10 Q-20,-25 -15,-35" stroke="#D4A537" stroke-width="3" fill="none"/></g>',
    },
    {
        "slug": "talking-cave",
        "title1": "The Talking",
        "title2": "Cave",
        "tradition": "PANCHATANTRA",
        "region": "Pan-Indian",
        "accent": "#5D4037",
        "border": "#B5532A",
        "silhouette": '<g opacity="0.07" transform="translate(512, 290)"><path d="M-60,30 Q-40,-30 0,-40 Q40,-30 60,30Z" fill="#5D4037"/><ellipse cx="0" cy="10" rx="25" ry="20" fill="#F7F2E7"/></g>',
    },
    {
        "slug": "elephant-and-blind-men",
        "title1": "The Elephant",
        "title2": "the Blind Men",
        "tradition": "JAIN · BUDDHIST",
        "region": "Pan-Indian",
        "accent": "#2E5D4B",
        "border": "#2E5D4B",
        "silhouette": '<g opacity="0.07" transform="translate(512, 280)"><ellipse cx="0" cy="0" rx="50" ry="35" fill="#2E5D4B"/><rect x="-45" y="20" width="12" height="30" rx="6" fill="#2E5D4B"/><rect x="33" y="20" width="12" height="30" rx="6" fill="#2E5D4B"/><path d="M45,-5 Q65,5 55,20" stroke="#2E5D4B" stroke-width="5" fill="none"/></g>',
        "and": True,
    },
]

for ep in EPISODES:
    has_and = ep.get("and", False)
    if has_and:
        title_block = (
            f'<text x="512" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#2A1F17" font-weight="bold" letter-spacing="-1">{ep["title1"]}</text>'
            f'\n  <text x="512" y="495" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#2E5D4B" opacity="0.5" font-style="italic">and</text>'
            f'\n  <text x="512" y="565" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#2A1F17" font-weight="bold" letter-spacing="-1">{ep["title2"]}</text>'
        )
        div_y = 605
    else:
        title_block = (
            f'<text x="512" y="460" text-anchor="middle" font-family="Georgia, serif" font-size="58" fill="#2A1F17" font-weight="bold" letter-spacing="-1">{ep["title1"]}</text>'
            f'\n  <text x="512" y="545" text-anchor="middle" font-family="Georgia, serif" font-size="58" fill="#2A1F17" font-weight="bold" letter-spacing="-1">{ep["title2"]}</text>'
        )
        div_y = 585

    svg = TEMPLATE % {
        "accent": ep["accent"],
        "border": ep["border"],
        "silhouette": ep["silhouette"],
        "title_block": title_block,
        "div_y": div_y,
        "trad_y": div_y + 50,
        "region_y": div_y + 85,
        "tradition": ep["tradition"],
        "region": ep["region"],
    }

    path = os.path.join("public", "artwork", f"{ep['slug']}.svg")
    with open(path, "w") as f:
        f.write(svg)
    print(f"  {ep['slug']}.svg")

print("\nAll artwork upgraded!")
