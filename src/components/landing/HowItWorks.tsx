'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, BarChart3, Sparkles } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Sign in with your Base wallet using our embedded wallet integration',
    icon: <Wallet className="w-8 h-8" />
  },
  {
    number: '02',
    title: 'Verify Your Coin',
    description: 'Check if your Zora creator coin meets our eligibility criteria',
    icon: <CheckCircle className="w-8 h-8" />
  },
  {
    number: '03',
    title: 'Apply for Loan',
    description: 'Get up to 10% of your coin\'s market cap as USDC instantly',
    icon: <BarChart3 className="w-8 h-8" />
  },
  {
    number: '04',
    title: 'Receive Funds',
    description: 'USDC deposited directly to your wallet within minutes',
    icon: <Sparkles className="w-8 h-8" />
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
            Simple Process
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Get Your Loan in <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">4 Easy Steps</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From application to funding in under 10 minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent -translate-x-1/2 z-0" />
              )}
              
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm relative z-10 group hover:scale-105">
                <div className="text-6xl font-bold text-slate-800 mb-4 group-hover:text-slate-700 transition-colors">
                  {step.number}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
