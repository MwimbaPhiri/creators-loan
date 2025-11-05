'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export function TrustSection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] p-16">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-8"
              >
                <Shield className="w-8 h-8 text-white/70" />
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white/90">
                Built on Base
              </h2>
              
              <p className="text-xl text-white/50 mb-8">
                Audited smart contracts. Non-custodial escrow. Full transparency.
              </p>
              
              <div className="flex justify-center gap-12 text-sm text-white/40">
                <div>Secure</div>
                <div className="w-px bg-white/10" />
                <div>Transparent</div>
                <div className="w-px bg-white/10" />
                <div>Decentralized</div>
              </div>
            </div>
            
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
