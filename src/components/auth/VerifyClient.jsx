'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

// Pure, SSR-friendly animation definitions
const brandVariants = {
  hiddenMobile: { y: -60, x: 0, opacity: 0 },
  hiddenDesktop: { y: 0, x: -60, opacity: 0 },
  visible: { y: 0, x: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const cardVariants = {
  hiddenMobile: { y: '60vh', x: 0, opacity: 0.5 },
  hiddenDesktop: { y: 0, x: '50vw', opacity: 0.5 },
  visible: { y: 0, x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 90 } }
};

export default function VerifyClient() {
  return (
    <div className="relative w-full min-h-screen md:min-h-[75vh] max-w-4xl md:mx-4 bg-transparent md:bg-white/80 md:backdrop-blur-xl md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
      
      {/* ================= LEFT SIDE / TOP SIDE: BRAND ANCHOR ================= */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 text-center md:text-left relative min-h-[25vh] md:min-h-full">
        {/* Mobile Left Side */}
        <motion.div 
          className="z-20 max-w-xs flex flex-col items-center md:items-start md:hidden"
          variants={brandVariants}
          initial="hiddenMobile"
          animate="visible"
        >
          <BrandContent />
        </motion.div>

        {/* Desktop Left Side */}
        <motion.div 
          className="z-20 max-w-xs flex flex-col items-center md:items-start hidden md:flex"
          variants={brandVariants}
          initial="hiddenDesktop"
          animate="visible"
        >
          <BrandContent />
        </motion.div>
      </div>

      {/* ================= RIGHT SIDE / BOTTOM SIDE: INTERACTIVE STATUS CARD ================= */}
      {/* Mobile Card Layout */}
      <motion.div 
        className="w-full bg-white rounded-t-[2.5rem] p-8 sm:p-10 flex flex-col justify-center shadow-[0_-15px_30px_rgba(0,0,0,0.05)] flex-grow z-20 md:hidden"
        variants={cardVariants}
        initial="hiddenMobile"
        animate="visible"
      >
        <Suspense fallback={<div className="text-center py-10 text-xs text-zinc-400 font-bold">Loading...</div>}>
          <CardContent />
        </Suspense>
      </motion.div>

      {/* Desktop Card Layout */}
      <motion.div 
        className="hidden md:flex w-1/2 bg-white md:rounded-l-[2.5rem] md:p-14 flex-col justify-center z-20"
        variants={cardVariants}
        initial="hiddenDesktop"
        animate="visible"
      >
        <Suspense fallback={<div className="text-center py-10 text-xs text-zinc-400 font-bold">Loading...</div>}>
          <CardContent />
        </Suspense>
      </motion.div>
    </div>
  );
}

{/* ================= SUB-COMPONENTS ================= */}

function BrandContent() {
  return (
    <>
      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-zinc-950 tracking-tight leading-tight mb-3">
        One Last Step to <br />
        <span className="bg-gradient-to-r from-emerald-800 to-amber-900 bg-clip-text text-transparent">Get Verified</span>
      </h1>
      <p className="text-xs md:text-sm font-medium text-zinc-800/80 leading-relaxed hidden sm:block">
        We gatekeep our community intentionally to keep it safe, authentic, and entirely free of outside distraction.
      </p>
    </>
  );
}

function CardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const inputRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && inputRefs.current[0]) {
      // Avoid auto-focusing on small screens to prevent keyboard pushing the
      // verification card off-screen. Only autofocus on desktop/tablet widths.
      if (window.innerWidth >= 768) {
        inputRefs.current[0].focus();
      }
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the complete 6-digit code.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp: fullOtp });
      setMessage({ type: 'success', text: res.data.message });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Verification failed. Please check your code and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email parameter missing. Please re-register.' });
      return;
    }

    setResending(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/api/auth/resend-otp', { email });
      setMessage({ type: 'success', text: res.data.message });
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to resend code.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto text-center md:text-left">
      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 mb-2">
        Check your email
      </h2>
      
      <p className="text-xs md:text-sm font-medium text-zinc-600 mb-6 leading-relaxed">
        We sent a 6-digit verification OTP code to <br />
        <strong className="text-zinc-950 font-bold">{email || 'your campus email'}</strong>
      </p>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-left">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m0 3h.008M10.29 3.86l-7.2 12.48A1.5 1.5 0 004.39 18.6h15.22a1.5 1.5 0 001.3-2.26l-7.2-12.48a1.5 1.5 0 00-2.6 0z" />
        </svg>
        <p className="text-[11px] font-semibold leading-relaxed text-amber-900">
          Can&apos;t find the code in your primary inbox? Check your Spam, Junk, or Promotions folder and search for &quot;Zuno&quot; or &quot;OTP&quot;.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold mb-6 text-center border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
              : 'bg-red-500/10 text-red-800 border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Input Grid */}
        <div role="group" aria-label="6-digit verification code" className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={`Verification code digit ${index + 1}`}
              maxLength={1}
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black border-2 border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-950 focus:border-zinc-950 focus:bg-white focus:outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        <button 
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-4 rounded-full text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Verifying Code...' : 'Verify Email & Enter'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500 font-medium space-y-2">
        <p>
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-bold text-zinc-950 underline hover:text-emerald-700 cursor-pointer disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
        </p>
        <p>
          <Link href="/login" className="text-zinc-400 hover:text-zinc-950 underline underline-offset-4 transition-colors font-bold">
            Back to Login screen
          </Link>
        </p>
      </div>
    </div>
  );
}