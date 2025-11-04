'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function WalletRedirect() {
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Check if user just connected (CDP stores connection state)
    const checkConnection = () => {
      // Check for CDP wallet connection in localStorage or sessionStorage
      const cdpConnection = localStorage.getItem('cdp-wallet-connected')
      
      if (cdpConnection && !hasChecked) {
        setHasChecked(true)
        // Small delay to ensure wallet is fully connected
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    }

    // Check immediately
    checkConnection()

    // Also listen for storage events (in case connection happens in another tab)
    window.addEventListener('storage', checkConnection)
    
    // Poll for connection state changes
    const interval = setInterval(checkConnection, 1000)

    return () => {
      window.removeEventListener('storage', checkConnection)
      clearInterval(interval)
    }
  }, [router, hasChecked])

  return null // This component doesn't render anything
}
