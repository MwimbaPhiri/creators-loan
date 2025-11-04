'use client'

import { useEffect } from 'react'

export function WalletConnectionMonitor() {
  useEffect(() => {
    // Monitor for CDP wallet connection events
    const checkConnection = () => {
      // Check if CDP modal is closed and wallet is connected
      const cdpModal = document.querySelector('[data-cdp-modal]')
      const isModalOpen = cdpModal && cdpModal.getAttribute('data-open') === 'true'
      
      if (!isModalOpen) {
        // Check if there's a wallet address in the DOM (CDP renders it)
        const walletElements = document.querySelectorAll('[data-testid="wallet-address"], .wallet-address, button[class*="wallet"]')
        
        if (walletElements.length > 0) {
          // Try to extract wallet address from the elements
          let walletAddress = ''
          walletElements.forEach(el => {
            const text = el.textContent || ''
            // Look for ethereum address pattern (0x followed by 40 hex chars)
            const addressMatch = text.match(/0x[a-fA-F0-9]{40}/)
            if (addressMatch) {
              walletAddress = addressMatch[0]
            }
            // Also check for shortened address pattern (0x...xxxx)
            const shortMatch = text.match(/0x[a-fA-F0-9]{4,6}\.\.\.[a-fA-F0-9]{4}/)
            if (shortMatch && !walletAddress) {
              // Store the shortened version if we can't find full address
              localStorage.setItem('wallet-address-short', shortMatch[0])
            }
          })
          
          // Wallet is connected, set flag
          localStorage.setItem('cdp-wallet-connected', 'true')
          
          // Store wallet address if found
          if (walletAddress) {
            localStorage.setItem('wallet-address', walletAddress)
          }
          
          // Dispatch custom event
          window.dispatchEvent(new Event('wallet-connected'))
        }
      }
    }

    // Check periodically
    const interval = setInterval(checkConnection, 500)

    // Also use MutationObserver to detect DOM changes
    const observer = new MutationObserver(checkConnection)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-open', 'class']
    })

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return null
}
