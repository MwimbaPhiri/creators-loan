'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Sparkles } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'

const stats = [
  { value: '$2.5M+', label: 'Total Loans Funded' },
  { value: '500+', label: 'Active Borrowers' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' }
]

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Base & Zora
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Unlock Liquidity
              </span>
              <br />
              <span className="text-white">
                From Your Creator Coins
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Get instant USDC loans backed by your Zora creator coins. 
              No credit checks, no lengthy applications. Just fast, secure funding for creators.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div className="scale-125">
              <AuthButton />
            </div>
            
            <a 
              href="#features"
              className="inline-flex items-center justify-center border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white text-lg px-8 py-3 rounded-lg border transition-colors"
            >
              Learn More
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Cards Animation */}
      <div className="absolute top-1/2 left-10 hidden lg:block">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/20"
        />
      </div>
      <div className="absolute top-1/3 right-10 hidden lg:block">
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/20"
        />
      </div>
    </section>
  )
}
