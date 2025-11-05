'use client'

import { motion } from 'framer-motion'
import { Coins, Lock, Zap, TrendingUp, Shield, CheckCircle2 } from 'lucide-react'

const benefits = [
  {
    icon: <Coins className="w-5 h-5" />,
    title: 'Creator Coin Collateral',
    description: 'Use your Zora creator coins as collateral without selling them. Maintain ownership while accessing liquidity.'
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Instant Approval',
    description: 'AI-powered risk assessment provides instant loan decisions. Get approved in minutes, not days.'
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Smart Contract Escrow',
    description: 'Your collateral is held securely in audited smart contracts on Base. Fully transparent and non-custodial.'
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Flexible Terms',
    description: 'Choose repayment periods from 6 to 36 months. Pay off early with no penalties.'
  }
]

const howItWorks = [
  {
    step: '01',
    title: 'Connect Wallet',
    description: 'Link your Base wallet containing your Zora creator coins'
  },
  {
    step: '02',
    title: 'Verify Eligibility',
    description: 'Check if your creator coin meets the $10,000 minimum market cap requirement'
  },
  {
    step: '03',
    title: 'Apply for Loan',
    description: 'Borrow up to 10% of your coin\'s market cap with only 20% collateral required'
  },
  {
    step: '04',
    title: 'Receive USDC',
    description: 'Get instant USDC transferred directly to your wallet'
  }
]

const loanTerms = [
  {
    label: 'Loan-to-Value',
    value: '10%',
    description: 'Borrow up to 10% of market cap'
  },
  {
    label: 'Collateral Required',
    value: '20%',
    description: 'Only 20% of coin value needed'
  },
  {
    label: 'Interest Rate',
    value: '5% APR',
    description: 'Low base rate, risk-adjusted'
  },
  {
    label: 'Minimum Market Cap',
    value: '$10K',
    description: 'Eligibility requirement'
  }
]

export function DetailedInfo() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto space-y-32">
        
        {/* Benefits Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white/90 mb-4">
              Why CreatorLoan?
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              The first DeFi lending platform built specifically for creator economy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/70">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white/90">{benefit.title}</h3>
                <p className="text-white/50 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed How It Works */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white/90 mb-4">
              The Process
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              From application to funding in under 10 minutes
            </p>
          </motion.div>

          <div className="space-y-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/40">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-2 text-white/90">{item.title}</h3>
                  <p className="text-lg text-white/50">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Loan Terms Grid */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white/90 mb-4">
              Transparent Terms
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              No hidden fees. No surprises. Just fair lending.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanTerms.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="text-4xl font-bold text-white/90 mb-2">{term.value}</div>
                <div className="text-sm font-semibold text-white/70 mb-2">{term.label}</div>
                <div className="text-xs text-white/40">{term.description}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] p-12 md:p-16"
          >
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-8">
                <Shield className="w-8 h-8 text-white/70" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white/90">
                Bank-Grade Security
              </h2>
              
              <p className="text-xl text-white/50 mb-12">
                Your assets are protected by audited smart contracts on Base blockchain. 
                All transactions are transparent, verifiable, and non-custodial.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-white/90 mb-1">Audited Contracts</div>
                    <div className="text-sm text-white/50">Third-party security audits</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-white/90 mb-1">Non-Custodial</div>
                    <div className="text-sm text-white/50">You control your assets</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-white/90 mb-1">On-Chain</div>
                    <div className="text-sm text-white/50">Fully transparent</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          </motion.div>
        </div>

      </div>
    </section>
  )
}
