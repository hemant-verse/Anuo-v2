'use client';

import React from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    title: 'Verified & Moderated',
    desc: 'Every listing is reviewed for safety before going live. Buy and sell with verified students from your own campus.',
    badge: 'Safe & Curated',
    color: 'from-emerald-500/20 to-emerald-500/0',
    iconColor: 'text-emerald-700 bg-emerald-100',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Zero Fees, Direct Cash',
    desc: 'Auno takes zero commission on your sales. Keep 100% of your earnings with direct peer-to-peer transactions.',
    badge: '0% Commission',
    color: 'from-amber-500/20 to-amber-500/0',
    iconColor: 'text-amber-700 bg-amber-100',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Fast Campus Deals',
    desc: 'Once approved, connect instantly with interested campus buyers through direct WhatsApp or email outreach.',
    badge: 'Instant Connect',
    color: 'from-blue-500/20 to-blue-500/0',
    iconColor: 'text-blue-700 bg-blue-100',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

// Motion Variants for Staggered Parent & Children Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function FeaturesGrid() {
  return (
    <section className="w-full mt-12 md:mt-20 border-t border-zinc-200/80 pt-12 pb-6 px-4">
      {/* Container Wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto"
      >
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative group bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Subtle Gradient Light Glow */}
            <div
              className={`aria-hidden:true absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${feat.color} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}
            />

            <div>
              {/* Header Info: Icon + Pill Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ${feat.iconColor} shadow-inner`}>
                  {feat.icon}
                </div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                  {feat.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-zinc-950 mb-2.5 tracking-tight group-hover:text-emerald-700 transition-colors">
                {feat.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                {feat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}