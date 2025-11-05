'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import Link from 'next/link'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-white/[0.05]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold text-white/90">
                CreatorLoan
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-sm">
            <a href="#features" className="text-white/50 hover:text-white/90 transition-colors">Features</a>
            <a href="#how-it-works" className="text-white/50 hover:text-white/90 transition-colors">How it works</a>
            <Link href="/dashboard" className="text-white/50 hover:text-white/90 transition-colors">
              Dashboard
            </Link>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <AuthButton />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}
