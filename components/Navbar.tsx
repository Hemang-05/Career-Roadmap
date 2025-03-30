// components/FloatingNavbar.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
}

interface FloatingNavbarProps {
  navLinks?: NavLink[];
  className?: string; 
}

export default function FloatingNavbar({ navLinks }: FloatingNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn } = useUser()

  // Default links if none are provided
  const defaultLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" }
  ]

  const links = navLinks || defaultLinks

  return (
    <>
      {/* Floating Glassy Navbar */}
      <header className="fixed top-4 md:top-8 z-50 bg-[#F7F7F7]/70 backdrop-blur-md border border-white/20 shadow-lg 
        h-14 md:h-16 w-[65%] md:w-[70%] left-1/2 -translate-x-1/2 rounded-full 
        flex items-center justify-between md:justify-around px-4">
        <div className="flex items-center">
          <div className="text-xl md:text-2xl font-bold">
            <span className="text-[#FF6500]">Career</span>
            <span className="text-black">Roadmap</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {links.map((link) => (
              <li key={link.href}>
                {link.href === "/dashboard" ? (
                  isSignedIn ? (
                    <Link 
                      href={link.href} 
                      onClick={link.onClick}
                      className="text-gray-700 hover:text-[#FF6500] font-medium"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                      <button className="text-gray-700 hover:text-[#FF6500] font-medium">
                        {link.label}
                      </button>
                    </SignInButton>
                  )
                ) : (
                  <Link 
                    href={link.href} 
                    onClick={link.onClick}
                    className="text-gray-700 hover:text-[#FF6500] font-medium"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="hidden md:flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-white py-4 px-4 shadow-lg">
          <ul className="flex flex-col space-y-4">
            {links.map((link) => (
              <li key={link.href}>
                {link.href === "/dashboard" ? (
                  isSignedIn ? (
                    <Link 
                      href={link.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                      <button 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
                      >
                        {link.label}
                      </button>
                    </SignInButton>
                  )
                ) : (
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-[#FF6500] font-medium block py-2"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
