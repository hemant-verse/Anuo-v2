// components/ResponsiveBackground.jsx
import React from 'react';
import NoiseOverlay from './NoiseOverlay';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#D85C3E]">
      {/* High-Performance Canvas Noise Grain */}
      <NoiseOverlay opacity={0.12} />

      {/* ---------------------------------------------------- */}
      {/* MOBILE LAYOUT (< 768px)                              */}
      {/* ---------------------------------------------------- */}
      <svg
        className="block h-screen w-full object-cover md:hidden"
        viewBox="0 0 375 812"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Base Background: #D85C3E (Terracotta) */}
        
        {/* Top-Left Sand Circle Accent */}
        <circle cx="-10" cy="180" r="100" fill="#DEC263" />

        {/* Center Olive Green Shape */}
        <path
          d="M -50 180 C 100 220, 200 350, 180 500 C 160 620, -20 680, -80 680 Z"
          fill="#8B7D3A"
        />

        {/* Right Middle Golden Arc */}
        <path
          d="M 120 812 C 120 480, 280 300, 420 320 L 420 812 Z"
          fill="#C9A65D"
        />

        {/* Top Right Emerald Circle */}
        <circle cx="360" cy="280" r="130" fill="#4AA88F" />

        {/* Bottom Right Soft Teal Blob */}
        <path
          d="M 60 812 C 140 680, 260 550, 400 620 L 400 812 Z"
          fill="#7FC3AC"
        />
      </svg>

      {/* ---------------------------------------------------- */}
      {/* DESKTOP & TABLET LAYOUT (>= 768px)                   */}
      {/* ---------------------------------------------------- */}
      <svg
        className="hidden h-full w-full object-cover md:block"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Base Background: #D85C3E (Terracotta) */}

        {/* Top-Left Sun Circle */}
        <circle cx="220" cy="160" r="140" fill="#DEC263" />

        {/* Left/Center Olive Organic Shape */}
        <path
          d="M -100 220 C 250 120, 600 200, 650 520 C 680 720, 250 850, -100 750 Z"
          fill="#8B7D3A"
        />

        {/* Right Large Sand Wave */}
        <path
          d="M 700 900 C 700 450, 1050 200, 1500 300 L 1500 900 Z"
          fill="#C9A65D"
        />

        {/* Top-Right Emerald Circle */}
        <circle cx="1320" cy="280" r="260" fill="#4AA88F" />

        {/* Bottom-Right Soft Teal Wave */}
        <path
          d="M 680 900 C 820 680, 1000 520, 1250 560 C 1420 580, 1480 720, 1500 700 L 1500 900 Z"
          fill="#7FC3AC"
        />
      </svg>
    </div>
  );
}