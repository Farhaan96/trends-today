'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import NewsletterSignup from './NewsletterSignup';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal this session
    const hasSeenModal = sessionStorage.getItem('newsletter-modal-shown');
    if (hasSeenModal || hasShown) return;

    // Show modal after 30 seconds of page activity
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
      sessionStorage.setItem('newsletter-modal-shown', 'true');
    }, 30000);

    // Show modal on exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('newsletter-modal-shown', 'true');
        clearTimeout(timer);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg hover:bg-gray-50"
        >
          <XMarkIcon className="w-5 h-5 text-gray-800" />
        </button>
        
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Wait! Don't Miss Out</h2>
            <p className="text-blue-200">Join 50,000+ tech enthusiasts getting our weekly insights</p>
          </div>
          
          <div className="p-6">
            <NewsletterSignup 
              variant="modal" 
              showLeadMagnet={true}
              leadMagnetTitle="Free: Ultimate Tech Buying Guide 2025"
              leadMagnetDescription="50+ pages of expert recommendations, deal alerts, and insider tips"
            />
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">50K+</div>
                <div className="text-gray-800">Subscribers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">Weekly</div>
                <div className="text-gray-800">Updates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">No</div>
                <div className="text-gray-800">Spam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}