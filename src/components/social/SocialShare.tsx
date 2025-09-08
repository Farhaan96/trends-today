'use client'

import { useState } from 'react'
import { 
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon,
  RedditIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton
} from 'react-share'
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  showLabels?: boolean
  vertical?: boolean
}

export default function SocialShare({
  url,
  title,
  description = '',
  image = '',
  className = '',
  size = 'medium',
  showLabels = false,
  vertical = false
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  
  const iconSize = size === 'small' ? 32 : size === 'large' ? 48 : 40
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const shareButtons = [
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      label: 'Twitter',
      props: { url, title, via: 'TrendsToday' }
    },
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      label: 'Facebook',
      props: { url, quote: title }
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      label: 'LinkedIn',
      props: { url, title, summary: description, source: 'TrendsToday' }
    },
    {
      Component: RedditShareButton,
      Icon: RedditIcon,
      label: 'Reddit',
      props: { url, title }
    },
    {
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      label: 'WhatsApp',
      props: { url, title, separator: ' - ' }
    },
    {
      Component: TelegramShareButton,
      Icon: TelegramIcon,
      label: 'Telegram',
      props: { url, title }
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      label: 'Email',
      props: { url, subject: title, body: description }
    }
  ]

  return (
    <div className={`${className} ${vertical ? 'space-y-3' : 'flex flex-wrap gap-3'}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <span>Share this article:</span>
      </div>
      
      <div className={`${vertical ? 'space-y-2' : 'flex flex-wrap gap-2'}`}>
        {shareButtons.map(({ Component, Icon, label, props }) => (
          <div key={label} className={vertical ? '' : 'inline-block'}>
            <Component {...props}>
              <div className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200 hover:scale-105 cursor-pointer
                ${showLabels ? 'bg-gray-50 hover:bg-gray-100' : ''}
              `}>
                <Icon size={iconSize} round />
                {showLabels && (
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {label}
                  </span>
                )}
              </div>
            </Component>
          </div>
        ))}
        
        {/* Copy link button */}
        <button
          onClick={copyToClipboard}
          className={`
            group flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200 hover:scale-105 cursor-pointer
            ${showLabels ? 'bg-gray-50 hover:bg-gray-100' : ''}
          `}
          title="Copy link"
        >
          <div className={`
            w-[${iconSize}px] h-[${iconSize}px] rounded-full bg-gray-600 hover:bg-gray-700
            flex items-center justify-center transition-colors
          `}>
            {copied ? (
              <CheckIcon className="w-5 h-5 text-white" />
            ) : (
              <ClipboardIcon className="w-5 h-5 text-white" />
            )}
          </div>
          {showLabels && (
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}