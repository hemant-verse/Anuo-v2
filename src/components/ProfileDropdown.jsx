'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';
import { notifyAuthChanged } from '@/lib/axios';

export default function ProfileDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();

  // 2. Click-Outside & Escape Key Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 3. Logout Handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      notifyAuthChanged();
      setIsOpen(false);
      router.replace('/login');
    }
  };

  const getInitials = (identifier) => {
    if (!identifier) return 'ME';
    return identifier.slice(0, 2).toUpperCase();
  };

  const displayName = user?.userName || 'Student Account';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {getInitials(displayName)}
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Details Header */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-xs font-black text-zinc-900 truncate">
              {displayName}
            </p>
            <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">
              {user?.email || 'authenticated'}
            </p>
          </div>

          {/* Navigation Items */}
          <div className="py-1">
            <Link
              href="/sell"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Sell an Item
            </Link>

            <Link
              href="/my-listings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Listings
            </Link>

            <Link
              href="/guidelines"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Guidelines & Terms
            </Link>
          </div>

          {/* Logout Action */}
          <div className="pt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}