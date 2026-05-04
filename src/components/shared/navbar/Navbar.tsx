'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

const navLinks = [
  { label: 'Browse', href: '/marketplace' },
  { label: 'Become a Seller', href: '/onboarding' },
  { label: 'Escrow', href: '/dashboard/orders' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/[0.07] bg-[#0a0a0b]/95 backdrop-blur">

      <Link href="/" className="text-lg font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
        Shill<span className="text-lime-400">Market</span>
      </Link>

      <div className="flex gap-7 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              pathname === link.href
                ? 'text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <AuthButton />

    </nav>
  )
}
