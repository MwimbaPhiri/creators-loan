'use client'

import { motion } from 'framer-motion'
import { AuthButton } from '@coinbase/cdp-react'

export function Hero() {
  return (
    <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="block text-white/90">Liquidity for</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Creator Coins
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/50 max-w-2xl mx-auto font-light">
              Instant USDC loans. No credit checks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="scale-110"
            >
              <AuthButton />
            </motion.div>
          </motion.div>

          {/* Minimal Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex justify-center gap-16 mt-24 text-sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90 mb-1">$2.5M+</div>
              <div className="text-white/40">Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90 mb-1">500+</div>
              <div className="text-white/40">Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90 mb-1">5%</div>
              <div className="text-white/40">APR</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
