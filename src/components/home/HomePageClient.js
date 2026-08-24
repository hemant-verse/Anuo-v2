// components/HomePageClient.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Hero from './Hero';
import VibeCarousel from './VibeCarousel';
import FeaturesGrid from './FeaturesGrid';

export default function HomePageClient() {
  return (
    <>
      <Navbar />
      
      <div className="flex-grow flex flex-col items-center justify-start px-4 pt-8 md:pt-16 pb-12 max-w-7xl mx-auto w-full text-zinc-900">
        <Hero />
        <FeaturesGrid />
      </div>
      
      <footer className="w-full py-4 text-center text-xs text-zinc-700/80 font-medium z-20">
        © {new Date().getFullYear()} Auno. The safe college marketplace.
      </footer>
    </>
  );
}