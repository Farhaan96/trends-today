'use client'

import { useState } from 'react'
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface EnhancedNewsletterProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  variant?: 'inline' | 'popup' | 'sidebar' | 'footer'
  showBenefits?: boolean
  className?: string
}

const benefits = [
  '📱 Latest tech news & reviews',
  '🔥 Exclusive deals & discounts',  
  '⚡ Breaking tech announcements',
  '🎯 Personalized recommendations',
  '📊 Weekly tech trend analysis'
]

export default function EnhancedNewsletter({
  title = "Stay Ahead of Tech Trends",
  description = "Get the latest tech news, reviews, and exclusive deals delivered to your inbox.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe Now",
  variant = 'inline',
  showBenefits = true,
  className = ''
}: EnhancedNewsletterProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      // Replace with your newsletter service API endpoint
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: variant,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Successfully subscribed! Check your email for confirmation.')
        setEmail('')
        
        // Track successful signup
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: variant,
          })
        }
      } else {
        throw new Error('Subscription failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      console.error('Newsletter subscription error:', error)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'popup':
        return 'bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border border-gray-100'
      case 'sidebar':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'
      case 'footer':
        return 'bg-gray-900 text-white rounded-xl p-6'
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8'
    }
  }

  const textColor = variant === 'footer' ? 'text-white' : variant === 'inline' ? 'text-white' : 'text-gray-900'
  const inputBg = variant === 'footer' || variant === 'inline' ? 'bg-white/90' : 'bg-white'

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className={`
          p-3 rounded-full 
          ${variant === 'footer' || variant === 'inline' ? 'bg-white/10' : 'bg-blue-100'}
        `}>
          <EnvelopeIcon className={`
            w-6 h-6 
            ${variant === 'footer' || variant === 'inline' ? 'text-white' : 'text-blue-600'}
          `} />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${textColor}`}>
            {title}
          </h3>
          <p className={`
            ${textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}
            text-sm leading-relaxed
          `}>
            {description}
          </p>
        </div>
      </div>

      {showBenefits && (
        <div className="mb-6">
          <p className={`text-sm font-medium mb-3 ${textColor}`}>
            What you'll get:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className={`
                  w-4 h-4 
                  ${variant === 'footer' || variant === 'inline' ? 'text-green-300' : 'text-green-500'}
                `} />
                <span className={`
                  text-xs
                  ${textColor === 'text-white' ? 'text-white/70' : 'text-gray-600'}
                `}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={status === 'loading'}
            className={`
              flex-1 px-4 py-3 ${inputBg} border border-gray-200 rounded-lg
              text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm
            `}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className={`
              px-6 py-3 font-medium rounded-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variant === 'footer' || variant === 'inline'
                ? 'bg-white text-blue-600 hover:bg-gray-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
              hover:transform hover:scale-105 active:scale-95
              text-sm whitespace-nowrap
            `}
          >
            {status === 'loading' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Subscribing...
              </div>
            ) : (
              buttonText
            )}
          </button>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <p className={`
          text-xs 
          ${textColor === 'text-white' ? 'text-white/60' : 'text-gray-500'}
        `}>
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </form>
    </div>
  )
}