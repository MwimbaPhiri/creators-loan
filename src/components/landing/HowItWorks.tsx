'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Connect',
    description: 'Link your wallet'
  },
  {
    number: '02',
    title: 'Verify',
    description: 'Check eligibility'
  },
  {
    number: '03',
    title: 'Borrow',
    description: 'Get instant USDC'
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white/90 mb-4">
            How it works
          </h2>
          <p className="text-white/40 text-lg">
            Three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -translate-x-1/2 z-0" />
              )}
              
              <div className="relative z-10">
                <div className="text-7xl font-bold text-white/5 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-white/90">{step.title}</h3>
                <p className="text-white/40">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
