'use client'

import { useEffect } from 'react'

interface AdSlotProps {
  id: string
  className?: string
}

export default function AdSlot({ id, className = '' }: AdSlotProps) {
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  useEffect(() => {
    if (adsEnabled && adClient && typeof window !== 'undefined') {
      try {
        // Push ad refresh to AdSense
        const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []
        ;(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = adsbygoogle
        adsbygoogle.push({})
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }
  }, [adsEnabled, adClient])

  if (!adsEnabled) {
    // Show placeholder in development
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`ad-slot ${className}`}>
          <span>Ad Placeholder ({id})</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}