'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { AuthModal } from './AuthModal';
import { LogIn, LogOut, User } from 'lucide-react';

export function UserMenu() {
  const { user, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-sm">Sign In</span>
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-full transition-all hover:ring-2 hover:ring-green-500/30"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-9 h-9 rounded-full border-2 border-white/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl p-2 z-50 animate-fadeInUp">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-sm font-medium text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
