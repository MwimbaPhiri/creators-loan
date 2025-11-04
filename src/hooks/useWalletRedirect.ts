'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useWalletRedirect() {
  const router = useRouter()
  const previousConnectionState = useRef<boolean>(false)

  useEffect(() => {
    const checkWalletConnection = () => {
      // Check multiple possible CDP connection indicators
      const cdpConnected = 
        localStorage.getItem('cdp-wallet-connected') === 'true' ||
        localStorage.getItem('wagmi.connected') === 'true' ||
        sessionStorage.getItem('cdp-wallet-connected') === 'true'

      // If wallet just connected (state changed from false to true)
      if (cdpConnected && !previousConnectionState.current) {
        previousConnectionState.current = true
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 800)
      } else if (!cdpConnected) {
        previousConnectionState.current = false
      }
    }

    // Check on mount
    checkWalletConnection()

    // Set up interval to check connection state
    const interval = setInterval(checkWalletConnection, 500)

    // Listen for storage events
    const handleStorageChange = () => {
      checkWalletConnection()
    }
    
    window.addEventListener('storage', handleStorageChange)

    // Listen for custom events that CDP might emit
    const handleWalletConnect = () => {
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    }

    window.addEventListener('wallet-connected', handleWalletConnect)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wallet-connected', handleWalletConnect)
    }
  }, [router])
}
