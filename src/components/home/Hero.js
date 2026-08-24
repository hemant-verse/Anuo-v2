// components/Hero.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CampusLiveTicker from './VibeCarousel';

export default function Hero() {
  return (
    <div className="text-center max-w-4xl mx-auto mt-4 mb-10 md:mb-14 px-2">
      <motion.h1 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-6"
      >
        Buy, Sell, Pass It On. <br className="hidden sm:inline" />
        <span className="text-red-500">
          Safe, Fast, and Easy.
        </span>
      </motion.h1>
      
      <CampusLiveTicker />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link href="/feed">
          <button className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-full text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mx-auto">
            Browse Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </Link>
        <Link href="/sell">
          <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 font-bold rounded-full text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mx-auto">
            Sell an Item
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}