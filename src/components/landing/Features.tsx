'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, Coins } from 'lucide-react'

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Instant',
    description: 'Minutes, not days'
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Secure',
    description: 'Smart contract escrow'
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Low Rates',
    description: 'Starting at 5% APR'
  },
  {
    icon: <Coins className="w-5 h-5" />,
    title: 'Keep Coins',
    description: 'Maintain ownership'
  }
]

export function Features() {
  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white/90 mb-4">
            Simple. Fast. Secure.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 h-full group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/70 group-hover:bg-white/10 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white/90">{feature.title}</h3>
                <p className="text-white/40 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
