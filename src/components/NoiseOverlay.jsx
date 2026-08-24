// components/NoiseOverlay.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NoiseOverlay({ opacity = 0.08 }) {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState('none');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 256; // 256x256 tile buffer for optimal memory footprint
    
    canvas.width = size;
    canvas.height = size;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.floor(Math.random() * 255);
      data[i] = noise;     // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = 255;   // Alpha
    }

    ctx.putImageData(imgData, 0, 0);
    setBackgroundImage(`url(${canvas.toDataURL()})`);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full repeat bg-repeat"
      style={{
        opacity: opacity,
        backgroundImage,
        backgroundSize: '180px 180px',
      }}
    >
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}