// components/auth/LoginClient.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api, { notifyAuthChanged, setAccessToken } from '@/lib/axios';
import { useRouter,useSearchParams } from 'next/navigation';


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

export default function LoginClient() {

    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Natively extract all form values at once
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await api.post('/api/auth/login', data);

      setAccessToken(response.data?.data?.accessToken); // Store the new access token in memory
      notifyAuthChanged();
      setSuccess(response.data?.data?.message || 'Login successful.');
      e.target.reset();
      
      const redirectUrl = searchParams.get('redirect') || '/feed';
      router.push(redirectUrl);
      router.refresh();

    } catch (err) {
      if (err.response) {
        const serverError = err.response.data;
        if (serverError?.error?.details || serverError?.details) {
          console.log('Zod Field Errors:', serverError.details);

          const errorsObj = {};
          (serverError?.error?.details || serverError.details).forEach((issue) => {
            // Safe check: If path exists and has an element, use it; otherwise, fallback to global or custom key
            const fieldName = issue.path && issue.path.length > 0 ? issue.path[0] : 'global';

            if (fieldName === 'global') {
              // If it's an object-level constraint issue, bubble it to the global alert bar
              setError(issue.message);
            } else {
              // Assign the specific error message to the field matching the 'name' attribute
              errorsObj[fieldName] = issue.message;
            }
          });

          setFieldErrors(errorsObj);

        } else {
          setError(serverError.error || 'Something went wrong.');
        }
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen md:min-h-[85vh] max-w-5xl md:mx-4 bg-transparent md:bg-white/80 md:backdrop-blur-xl md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
      
      {/* ================= LEFT SIDE / TOP SIDE ================= */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 text-center md:text-left relative min-h-[30vh] md:min-h-full">
        {/* Mobile Left Side */}
        <motion.div 
          className="z-20 max-w-sm flex flex-col items-center md:items-start md:hidden"
          variants={brandVariants}
          initial="hiddenMobile"
          animate="visible"
        >
          <BrandContent />
        </motion.div>

        {/* Desktop Left Side */}
        <motion.div 
          className="z-20 max-w-sm flex flex-col items-center md:items-start hidden md:flex"
          variants={brandVariants}
          initial="hiddenDesktop"
          animate="visible"
        >
          <BrandContent />
        </motion.div>
      </div>

      {/* ================= RIGHT SIDE / BOTTOM SIDE ================= */}
      {/* Keep one form in the DOM so labels/controls remain unique and browser
          automation always targets the visible responsive layout. */}
      <motion.div
        className="w-full md:w-1/2 bg-white rounded-t-[2.5rem] md:rounded-l-[2.5rem] p-8 sm:p-10 md:p-14 flex flex-col justify-center shadow-[0_-15px_30px_rgba(0,0,0,0.05)] flex-grow md:flex-grow-0 z-20"
        variants={cardVariants}
        initial="visible"
        animate="visible"
      >
        <CardContent
          handleSubmit={handleSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
          error={error}
          success={success}
          loading={loading}
        />
      </motion.div>
    </div>
  );
}



function BrandContent() {
  return (
    <>
      <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-xs font-bold tracking-wider uppercase mb-4">
        🔒 Exclusive College Marketplace
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight mb-4 text-center md:text-left">
        Lock in with <br className="hidden md:inline" />
        your <span className="bg-gradient-to-r from-emerald-800 to-amber-900 bg-clip-text text-transparent">Campus Circle</span>
      </h1>
      <p className="text-sm md:text-base font-medium text-zinc-800/90 leading-relaxed text-center md:text-left hidden sm:block">
        No algorithms. No clout-chasing vanity metrics. Just real vibes and direct coordination with your fellow college peers.
      </p>
     
    </>
  );
}

function CardContent({ handleSubmit, showPassword, setShowPassword, agreeTerms, setAgreeTerms, error, success, loading }) {
  return (
    <div className="max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          Welcome back
        </h2>
        <Link href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors hidden sm:block">
          Need help?
        </Link>
      </div>

       {/* System Alerts & Messages */}
      {error && (
        <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold tracking-wide">
          {error}
        </div>
      )}
      {success && (
        <div role="status" aria-live="polite" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold tracking-wide">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">College email address</label>
          <input 
            id="login-email"
            type="email" 
            placeholder="College Email Address" 
            name="email"
            className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3.5 px-5 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            required
          />
        </div>

        <div className="relative flex items-center">
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input 
            id="login-password"
            type={showPassword ? 'text' : 'password'} 
            name="password"
            placeholder="Password" 
            className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3.5 px-5 pr-12 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 text-zinc-400 hover:text-zinc-700 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-zinc-950 rounded"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-bold text-zinc-500 hover:text-zinc-950 underline underline-offset-2 transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 text-white font-bold py-4 rounded-full text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.98] mt-2"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
              Signing in...
            </span>
          ) : 'Enter Dashboard'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs sm:text-sm font-medium text-zinc-500">
          New here?{' '}
          <Link href="/register" className="font-bold text-zinc-950 underline underline-offset-2 hover:text-zinc-800 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}