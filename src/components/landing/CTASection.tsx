'use client'

import { motion } from 'framer-motion'
import { AuthButton } from '@coinbase/cdp-react'

export function CTASection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white/90">
            Get started today
          </h2>
          
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="inline-block scale-110"
          >
            <AuthButton />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
