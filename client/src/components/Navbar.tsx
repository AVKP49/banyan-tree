import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X, TreePine } from 'lucide-react'

const links = [
  { href: '/library', label: 'Library' },
  { href: '/words', label: 'Words' },
  { href: '/parents', label: 'Parents' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [location] = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-parchment/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl text-monsoon">
          <TreePine className="h-6 w-6" />
          The Banyan Tree
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-sans text-sm font-medium transition-colors ${
                location === l.href ? 'text-saffron' : 'text-ink/70 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-lg p-2 text-ink/70 hover:bg-ink/5"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink/10 bg-parchment px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 font-sans text-base ${
                location === l.href ? 'text-saffron' : 'text-ink/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
