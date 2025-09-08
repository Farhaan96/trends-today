'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BookmarkIcon, 
  HeartIcon, 
  ShareIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  BookmarkIcon as BookmarkSolidIcon, 
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid'
import { trackEvent } from '@/components/analytics/Analytics'

interface UserEngagementProps {
  articleId: string
  articleTitle: string
  category: string
  readingTime: number
  className?: string
}

// Reading progress bar component
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(scrollPercent, 100))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Set initial value

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Floating action buttons component
const FloatingActions = ({ 
  articleId, 
  articleTitle, 
  isBookmarked, 
  isLiked, 
  onBookmark, 
  onLike, 
  onShare 
}: {
  articleId: string
  articleTitle: string
  isBookmarked: boolean
  isLiked: boolean
  onBookmark: () => void
  onLike: () => void
  onShare: () => void
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsVisible(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const actions = [
    {
      icon: isBookmarked ? BookmarkSolidIcon : BookmarkIcon,
      label: 'Bookmark',
      onClick: onBookmark,
      active: isBookmarked,
      color: 'text-yellow-600'
    },
    {
      icon: isLiked ? HeartSolidIcon : HeartIcon,
      label: 'Like',
      onClick: onLike,
      active: isLiked,
      color: 'text-red-500'
    },
    {
      icon: ShareIcon,
      label: 'Share',
      onClick: onShare,
      active: false,
      color: 'text-blue-500'
    }
  ]

  if (!isVisible) return null

  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            group relative p-3 bg-white rounded-full shadow-lg border border-gray-200
            transition-all duration-200 hover:scale-110 hover:shadow-xl
            ${action.active ? action.color : 'text-gray-600 hover:' + action.color}
          `}
          title={action.label}
        >
          <action.icon className="w-5 h-5" />
          
          {/* Tooltip */}
          <span className="
            absolute right-full mr-3 top-1/2 -translate-y-1/2
            px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            whitespace-nowrap pointer-events-none
          ">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// Article statistics component
const ArticleStats = ({ 
  views, 
  likes, 
  bookmarks, 
  readingTime 
}: {
  views: number
  likes: number
  bookmarks: number
  readingTime: number
}) => {
  return (
    <div className="flex items-center gap-6 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <EyeIcon className="w-4 h-4" />
        <span>{views.toLocaleString()} views</span>
      </div>
      
      <div className="flex items-center gap-1">
        <HeartIcon className="w-4 h-4" />
        <span>{likes.toLocaleString()} likes</span>
      </div>
      
      <div className="flex items-center gap-1">
        <BookmarkIcon className="w-4 h-4" />
        <span>{bookmarks.toLocaleString()} saved</span>
      </div>
      
      <div className="flex items-center gap-1">
        <ClockIcon className="w-4 h-4" />
        <span>{readingTime} min read</span>
      </div>
    </div>
  )
}

// Time spent tracking
const TimeSpentTracker = ({ articleId, articleTitle }: { articleId: string, articleTitle: string }) => {
  const startTimeRef = useRef<number>(Date.now())
  const lastActiveRef = useRef<number>(Date.now())
  const totalTimeRef = useRef<number>(0)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - stop counting time
        totalTimeRef.current += Date.now() - lastActiveRef.current
      } else {
        // Tab became visible - resume counting
        lastActiveRef.current = Date.now()
      }
    }

    const handleActivity = () => {
      lastActiveRef.current = Date.now()
    }

    // Track user activity
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('scroll', handleActivity, { passive: true })
    document.addEventListener('mousedown', handleActivity)
    document.addEventListener('keydown', handleActivity)

    // Send time spent data when user leaves
    const handleBeforeUnload = () => {
      const finalTime = totalTimeRef.current + (Date.now() - lastActiveRef.current)
      const timeInSeconds = Math.round(finalTime / 1000)
      
      if (timeInSeconds > 5) { // Only track if more than 5 seconds
        trackEvent('article_time_spent', {
          article_id: articleId,
          article_title: articleTitle,
          time_seconds: timeInSeconds,
          timestamp: new Date().toISOString(),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('scroll', handleActivity)
      document.removeEventListener('mousedown', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [articleId, articleTitle])

  return null // This is a tracking component, no UI
}

export default function UserEngagement({
  articleId,
  articleTitle,
  category,
  readingTime,
  className = ''
}: UserEngagementProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    bookmarks: 0,
  })

  // Load user engagement state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookmarked = localStorage.getItem(`bookmark_${articleId}`) === 'true'
      const liked = localStorage.getItem(`like_${articleId}`) === 'true'
      
      setIsBookmarked(bookmarked)
      setIsLiked(liked)

      // Load article stats (in production, fetch from API)
      setStats({
        views: Math.floor(Math.random() * 10000) + 100, // Mock data
        likes: Math.floor(Math.random() * 500) + 10,
        bookmarks: Math.floor(Math.random() * 200) + 5,
      })
    }
  }, [articleId])

  // Track page view
  useEffect(() => {
    trackEvent('article_view', {
      article_id: articleId,
      article_title: articleTitle,
      category,
      timestamp: new Date().toISOString(),
    })
  }, [articleId, articleTitle, category])

  const handleBookmark = () => {
    const newBookmarked = !isBookmarked
    setIsBookmarked(newBookmarked)
    localStorage.setItem(`bookmark_${articleId}`, String(newBookmarked))
    
    trackEvent('article_bookmark', {
      article_id: articleId,
      article_title: articleTitle,
      action: newBookmarked ? 'add' : 'remove',
    })

    setStats(prev => ({
      ...prev,
      bookmarks: prev.bookmarks + (newBookmarked ? 1 : -1)
    }))
  }

  const handleLike = () => {
    const newLiked = !isLiked
    setIsLiked(newLiked)
    localStorage.setItem(`like_${articleId}`, String(newLiked))
    
    trackEvent('article_like', {
      article_id: articleId,
      article_title: articleTitle,
      action: newLiked ? 'add' : 'remove',
    })

    setStats(prev => ({
      ...prev,
      likes: prev.likes + (newLiked ? 1 : -1)
    }))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: articleTitle,
        url: window.location.href,
      }).catch(console.error)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }

    trackEvent('article_share', {
      article_id: articleId,
      article_title: articleTitle,
      method: navigator.share ? 'native' : 'clipboard',
    })
  }

  return (
    <div className={className}>
      {/* Reading progress bar */}
      <ReadingProgressBar />
      
      {/* Article statistics */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <ArticleStats 
          views={stats.views}
          likes={stats.likes}
          bookmarks={stats.bookmarks}
          readingTime={readingTime}
        />
      </div>

      {/* Floating action buttons */}
      <FloatingActions
        articleId={articleId}
        articleTitle={articleTitle}
        isBookmarked={isBookmarked}
        isLiked={isLiked}
        onBookmark={handleBookmark}
        onLike={handleLike}
        onShare={handleShare}
      />

      {/* Time spent tracker */}
      <TimeSpentTracker articleId={articleId} articleTitle={articleTitle} />
    </div>
  )
}