'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { listProducts } from '@/features/products/api';

export default function CampusLiveTicker() {
  const [drops, setDrops] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live product data from MongoDB
  useEffect(() => {
    let isMounted = true;

    const fetchLiveDrops = async () => {
      try {
        const result = await listProducts({ page: 1, limit: 5 });
        const fetchedProducts = result.items || [];

        if (isMounted && fetchedProducts.length > 0) {
          setDrops(fetchedProducts);
        }
      } catch (err) {
        console.error('Failed to load live campus drops:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveDrops();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-rotate through live items
  useEffect(() => {
    if (drops.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % drops.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [drops.length]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto my-6 px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 h-40 animate-pulse border border-zinc-200/80 shadow-lg flex flex-col justify-between">
          <div className="h-4 bg-zinc-200 rounded w-1/4" />
          <div className="h-6 bg-zinc-200 rounded w-1/2" />
          <div className="h-4 bg-zinc-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (drops.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto my-6 px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-zinc-200/80 shadow-lg text-zinc-900">
          <h3 className="text-lg font-bold mb-2">Offline mode</h3>
          <p className="text-sm text-zinc-600">
            Live campus drops are unavailable offline, but Auno’s home page shell is still accessible.
          </p>
        </div>
      </div>
    );
  }

  const currentDrop = drops[activeIdx];
  const sellerUsername = currentDrop.sellerId?.userName 
    ? `@${currentDrop.sellerId.userName}` 
    : '@campus_seller';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto my-6 px-4"
    >
      <div className="bg-white/80 backdrop-blur-md text-zinc-950 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-zinc-200/80">
        {/* Background Decorative Blob Overlay */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, #FDE68A 0%, transparent 40%),
              radial-gradient(circle at 90% 10%, #A7F3D0 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, #FCA5A5 0%, transparent 50%),
              radial-gradient(circle at 85% 75%, #6EE7B7 0%, transparent 45%)
            `
          }}
        />

        {/* Content Wrapper */}
        <div className="relative z-10">
          {/* Top Header Ticker Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                Live Campus Drops
              </span>
            </div>

            <div className="bg-white/90 border border-zinc-200 rounded-full px-3 py-1 text-[11px] font-medium text-zinc-600 shadow-sm flex items-center gap-1.5">
              <span>⚡ Fresh items listed right now on campus</span>
            </div>
          </div>

          {/* Dynamic DB Product Display */}
          <div className="pt-4 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDrop._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="p-4 rounded-2xl bg-white/70 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden"
              >
                {/* Text Content Block */}
                <div className="space-y-1 w-full min-w-0 sm:max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentDrop.category && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-zinc-950 text-white shadow-xs">
                        {currentDrop.category}
                      </span>
                    )}
                    <span className="text-xs text-zinc-600 font-medium truncate max-w-[120px] sm:max-w-none">
                      {sellerUsername}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0">
                      • {currentDrop.createdAt ? new Date(currentDrop.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>

                  {/* Scaled & Clamped Title */}
                  <h4 className="text-sm sm:text-lg font-black text-zinc-950 tracking-tight line-clamp-2 break-words">
                    {currentDrop.title}
                  </h4>
                </div>

                {/* Pricing & CTA Block */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <span className="text-lg sm:text-2xl font-black text-emerald-800">
                    ₹{currentDrop.price?.toLocaleString() || '0'}
                  </span>

                  <Link
                    href={`/product/${currentDrop._id}`}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-transform active:scale-95 shadow-md flex items-center gap-1 shrink-0"
                  >
                    View Listing
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          {drops.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-2">
              {drops.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIdx ? 'w-6 bg-zinc-950' : 'w-1.5 bg-zinc-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}