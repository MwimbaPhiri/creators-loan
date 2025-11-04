'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Shield, TrendingUp, Coins } from 'lucide-react'

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Approval',
    description: 'Get approved in minutes with AI-powered risk assessment',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure Collateral',
    description: 'Your creator coins are safely held in escrow smart contracts',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Low Interest Rates',
    description: 'Starting at 5% APR with flexible repayment terms',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: 'Keep Your Coins',
    description: 'Maintain ownership while accessing liquidity',
    color: 'from-purple-500 to-pink-500'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
            Features
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CreatorLoan</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Built for creators, by creators. Experience the future of decentralized lending.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm h-full group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
