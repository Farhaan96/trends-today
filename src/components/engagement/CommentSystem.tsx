'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, ArrowUturnLeftIcon as ReplyIcon, FlagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  isVerified?: boolean;
}

interface CommentSystemProps {
  articleId: string;
  articleTitle: string;
}

export default function CommentSystem({ articleId, articleTitle }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Mock comments data
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        author: 'TechEnthusiast',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content: 'Great review! Really helpful breakdown of the pros and cons. I was on the fence about this product but your detailed analysis helped me make a decision.',
        createdAt: '2024-01-15T10:30:00Z',
        likes: 12,
        isLiked: false,
        replies: [
          {
            id: '1-1',
            author: 'GadgetGuru',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            content: 'Totally agree! The camera comparison section was particularly insightful.',
            createdAt: '2024-01-15T11:15:00Z',
            likes: 5,
            isLiked: true,
            replies: [],
            isVerified: true
          }
        ]
      },
      {
        id: '2',
        author: 'MobileReviewer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=40&h=40&fit=crop&crop=face',
        content: 'I\'ve been using this product for 3 months now and can confirm everything mentioned in the review. Battery life is exceptional!',
        createdAt: '2024-01-14T15:45:00Z',
        likes: 8,
        isLiked: false,
        replies: []
      }
    ];
    setComments(mockComments);
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Anonymous User', // In real app, get from auth
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');

      // Track comment submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'comment_submit', {
          event_category: 'engagement',
          event_label: articleId,
          value: 1
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reply: Comment = {
        id: `${parentId}-${Date.now()}`,
        author: 'Anonymous User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
        content: replyContent,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      };

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, isReply = false, parentId?: string) => {
    try {
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                        isLiked: !reply.isLiked
                      }
                    : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              }
            : comment
        ));
      }

      // Track like
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'comment_like', {
          event_category: 'engagement',
          event_label: commentId,
          value: 1
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const CommentItem = ({ comment, isReply = false, parentId }: { 
    comment: Comment; 
    isReply?: boolean; 
    parentId?: string;
  }) => (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}`}>
      <div className="flex space-x-3">
        <img
          src={comment.avatar}
          alt={comment.author}
          className="w-8 h-8 rounded-full"
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {comment.author}
            </span>
            {comment.isVerified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-xs text-gray-700">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => handleLike(comment.id, isReply, parentId)}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors"
            >
              {comment.isLiked ? (
                <HeartSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.likes}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors"
              >
                <ReplyIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
            
            <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-700 transition-colors">
              <FlagIcon className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>

          {/* Reply Form */}
          {replyTo === comment.id && (
            <div className="mt-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-3 py-1 text-sm text-gray-800 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  isReply={true} 
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)})
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <form onSubmit={handleSubmitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this article..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-gray-700">
              Be respectful and constructive in your comments.
            </p>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-700 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-700">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}