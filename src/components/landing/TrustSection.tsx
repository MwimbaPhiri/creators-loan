'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Shield, CheckCircle } from 'lucide-react'

const trustPoints = [
  'Non-custodial escrow system',
  'Automated collateral release',
  'Real-time on-chain verification',
  'Instant USDC disbursement'
]

export function TrustSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-slate-800 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <Lock className="w-3 h-3 mr-1" />
                  Secure & Transparent
                </Badge>
                <h2 className="text-4xl font-bold mb-6">
                  Built on <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Base</span>
                </h2>
                <p className="text-slate-400 text-lg mb-6">
                  All transactions are secured by Base blockchain technology. Your creator coins are held in audited smart contracts with full transparency.
                </p>
                <ul className="space-y-4">
                  {trustPoints.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-slate-700 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="w-24 h-24 mx-auto mb-4 text-blue-400" />
                      <div className="text-2xl font-bold text-white mb-2">100% Secure</div>
                      <div className="text-slate-400">Audited Smart Contracts</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl backdrop-blur-sm border border-purple-500/20"
                />
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl backdrop-blur-sm border border-blue-500/20"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
