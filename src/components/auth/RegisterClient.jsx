// components/auth/RegisterClient.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Declare pure animation variants completely decoupled from window layout checks to avoid hydration errors
const brandVariants = {
  hiddenMobile: { y: -60, x: 0, opacity: 0 },
  hiddenDesktop: { y: 0, x: -60, opacity: 0 },
  visible: { y: 0, x: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const formVariants = {
  hiddenMobile: { y: '60vh', x: 0, opacity: 0.5 },
  hiddenDesktop: { y: 0, x: '50vw', opacity: 0.5 },
  visible: { y: 0, x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 90 } }
};

export default function RegisterClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  // Natively extract all form values at once
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await axios.post('/api/auth/register', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setSuccess(response.data?.data?.message || 'Registration successful.');
    e.target.reset();

    // Pass the registered email to the verify page in query params
    const userEmail = data.email || response.data?.data?.email || '';
    router.replace(`/verify?email=${encodeURIComponent(userEmail)}`);
    } catch (err) {
      if (err.response) {
        const serverError = err.response.data;
        if (serverError?.error?.details || serverError?.details) {
          console.log('Zod Field Errors:', serverError.details);

          const errorsObj = {};
          (serverError?.error?.details || serverError.details).forEach((issue) => {
            const fieldName = issue.path && issue.path.length > 0 ? issue.path[0] : 'global';

            if (fieldName === 'global') {
              setError(issue.message);
            } else {
              errorsObj[fieldName] = issue.message;
            }
          });

          setFieldErrors(errorsObj);
        } else {
          // Prefer explicit server `message` then `error` for better UX
          setError(serverError?.error?.message || serverError?.message || serverError?.error || 'Something went wrong.');
        }
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="relative w-full min-h-screen md:min-h-[90vh] max-w-5xl md:mx-4 bg-transparent md:bg-white/80 md:backdrop-blur-xl md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">

      {/* ================= LEFT SIDE / TOP SIDE ================= */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 text-center md:text-left relative min-h-[25vh] md:min-h-full">
        {/* Mobile View Branding Content: Animates down from top only on mobile screen widths */}
        <motion.div
          className="z-20 max-w-sm flex flex-col items-center md:items-start md:hidden"
          variants={brandVariants}
          initial="hiddenMobile"
          animate="visible"
        >
          <BrandContent />
        </motion.div>

        {/* Desktop View Branding Content: Animates out from left side on desktop screen widths */}
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
      {/* Mobile Form Container: Slides up from bottom grid boundary */}
      <motion.div
        className="w-full bg-white rounded-t-[2.5rem] p-8 sm:p-10 flex flex-col justify-center shadow-[0_-15px_30px_rgba(0,0,0,0.05)] flex-grow z-20 md:hidden"
        variants={formVariants}
        initial="hiddenMobile"
        animate="visible"
      >
        <FormContent
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

      {/* Desktop Form Container: Slides in clean from the right axis */}
      <motion.div
        className="hidden md:flex w-1/2 bg-white md:rounded-l-[2.5rem] md:p-12 flex-col justify-center z-20"
        variants={formVariants}
        initial="hiddenDesktop"
        animate="visible"
      >
        <FormContent
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

/* ================= DESCRIPTIVE SUB-COMPONENTS FOR CLEAN HYDRATION SEPARATION ================= */

function BrandContent() {
  return (
    <>
      <span className="px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
        🚀 Claim Your Profile
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight mb-4 text-center md:text-left">
        Find Your Vibe, <br className="hidden md:inline" />
        Skip the <span className="bg-gradient-to-r from-emerald-800 to-amber-900 bg-clip-text text-transparent">Noise</span>
      </h1>
      <p className="text-sm md:text-base font-medium text-zinc-800/90 leading-relaxed text-center md:text-left hidden sm:block">
        From textbooks to dorm furniture, discover what you need instantly and sell your unused items in seconds.
      </p>
     
    </>
  );
}

function FormContent({ handleSubmit, showPassword, setShowPassword, agreeTerms, setAgreeTerms, error, success, loading }) {
  return (
    <div className="max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          Create Account
        </h2>
        <Link href="/login" className="text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors">
          Sign In Instead
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

      {/* Form Submission Framework */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="register-name" className="sr-only">Full name</label>
          <input
            id="register-name"
            name="userName"
            type="text"
            placeholder="Full Name"
            className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3 px-5 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="register-email" className="sr-only">College email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="College Email (.@indoreinstitute.com / campus email)"
            className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3 px-5 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            required
          />
        </div>

        <div className="relative flex items-center">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create Password"
            className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3 px-5 pr-12 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
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

        <div className="flex items-start gap-3 pt-1">
          <input
            name="agreeTerms"
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
            required
          />
          <label htmlFor="terms" className="text-xs font-medium text-zinc-500 leading-normal select-none cursor-pointer">
            I agree to the <Link href="/guidelines" className="text-zinc-950 underline font-bold">Guidelines</Link> and confirm that I am an active college student.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 text-white font-bold py-4 rounded-full text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.98] mt-4"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
              Creating account...
            </span>
          ) : 'Get Started'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs sm:text-sm font-medium text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-zinc-950 underline underline-offset-2 hover:text-zinc-800 transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}