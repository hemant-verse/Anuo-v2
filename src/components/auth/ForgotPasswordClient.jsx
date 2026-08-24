'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordReset, resetPassword } from '@/features/auth/api';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

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

export default function ForgotPasswordClient() {
  return (
    <div className="relative w-full min-h-screen md:min-h-[75vh] max-w-4xl md:mx-4 bg-transparent md:bg-white/80 md:backdrop-blur-xl md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
      
      {/* LEFT SIDE / TOP SIDE: BRAND ANCHOR */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 text-center md:text-left relative min-h-[25vh] md:min-h-full">
        <motion.div 
          className="z-20 max-w-xs flex flex-col items-center md:items-start md:hidden"
          variants={brandVariants}
          initial="hiddenMobile"
          animate="visible"
        >
          <BrandContent />
        </motion.div>

        <motion.div 
          className="z-20 max-w-xs flex flex-col items-center md:items-start hidden md:flex"
          variants={brandVariants}
          initial="hiddenDesktop"
          animate="visible"
        >
          <BrandContent />
        </motion.div>
      </div>

      {/* RIGHT SIDE / BOTTOM SIDE: INTERACTIVE FORM */}
      <motion.div 
        className="w-full bg-white rounded-t-[2.5rem] p-8 sm:p-10 flex flex-col justify-center shadow-[0_-15px_30px_rgba(0,0,0,0.05)] flex-grow z-20 md:hidden"
        variants={cardVariants}
        initial="hiddenMobile"
        animate="visible"
      >
        <CardContent />
      </motion.div>

      <motion.div 
        className="hidden md:flex w-1/2 bg-white md:rounded-l-[2.5rem] md:p-14 flex-col justify-center z-20"
        variants={cardVariants}
        initial="hiddenDesktop"
        animate="visible"
      >
        <CardContent />
      </motion.div>
    </div>
  );
}

function BrandContent() {
  return (
    <>
      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-zinc-950 tracking-tight leading-tight mb-3">
        Account <br />
        <span className="bg-gradient-to-r from-amber-800 to-emerald-900 bg-clip-text text-transparent">Recovery</span>
      </h1>
      <p className="text-xs md:text-sm font-medium text-zinc-800/80 leading-relaxed hidden sm:block">
        Verify your identity via email OTP to set a new password and regain full access to your campus network.
      </p>
    </>
  );
}

function CardContent() {
  const router = useRouter();
  
  // Step 1: 'EMAIL_STEP' | Step 2: 'OTP_AND_PASSWORD_STEP'
  const [step, setStep] = useState('EMAIL_STEP');
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const inputRefs = useRef([]);

  // Auto focus first OTP box on step transition
  useEffect(() => {
    if (step === 'OTP_AND_PASSWORD_STEP' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await requestPasswordReset(email);
      setMessage({ type: 'success', text: 'Reset code sent. Check your inbox.' });
      setStep('OTP_AND_PASSWORD_STEP');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the complete 6-digit OTP code.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await resetPassword({ email, otp: fullOtp, newPassword });
      setMessage({ type: 'success', text: 'Password reset successfully.' });
      setTimeout(() => { router.push('/login'); }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Password reset failed. Please check your OTP code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setMessage({ type: '', text: '' });

    try {
      await requestPasswordReset(email);
      setMessage({ type: 'success', text: 'Reset code resent. Check your inbox.' });
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to resend reset code.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto text-center md:text-left">
      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 mb-2">
        {step === 'EMAIL_STEP' ? 'Forgot Password?' : 'Enter OTP & New Password'}
      </h2>
      
      <p className="text-xs md:text-sm font-medium text-zinc-600 mb-6 leading-relaxed">
        {step === 'EMAIL_STEP'
          ? 'Enter your registered college email address to receive a 6-digit reset code.'
          : `Enter the code sent to ${email} and your new password below.`}
      </p>

      {step === 'OTP_AND_PASSWORD_STEP' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-left">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m0 3h.008M10.29 3.86l-7.2 12.48A1.5 1.5 0 004.39 18.6h15.22a1.5 1.5 0 001.3-2.26l-7.2-12.48a1.5 1.5 0 00-2.6 0z" />
          </svg>
          <p className="text-[11px] font-semibold leading-relaxed text-amber-900">
            Can&apos;t find the code in your primary inbox? Check your Spam, Junk, or Promotions folder and search for &quot;Zuno&quot; or &quot;OTP&quot;.
          </p>
        </div>
      )}

      {message.text && <Alert variant={message.type === 'success' ? 'success' : 'error'} message={message.text} id="forgot-message" className="mb-6" />}

      {/* STEP 1: REQUEST OTP */}
      {step === 'EMAIL_STEP' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="sr-only">Campus email address</label>
            <input
              id="reset-email"
              type="email"
              placeholder="Campus email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3.5 px-5 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" loading={loading} loadingLabel="Sending Code…" disabled={!email} fullWidth>
            Send Reset OTP Code
          </Button>
        </form>
      )}

      {/* STEP 2: ENTER OTP & NEW PASSWORD */}
      {step === 'OTP_AND_PASSWORD_STEP' && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* OTP Grid */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              6-Digit Reset Code
            </label>
            <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={`Reset code digit ${index + 1}`}
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black border-2 border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-950 focus:border-zinc-950 focus:bg-white focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* New Password Field */}
          <div className="relative flex items-center">
            <label htmlFor="reset-new-password" className="sr-only">New password</label>
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-zinc-50 border-0 focus:ring-2 focus:ring-zinc-950 rounded-2xl py-3.5 px-5 pr-12 text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide new password' : 'Show new password'}
              className="absolute right-4 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950 rounded"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} loadingLabel="Resetting Password…" disabled={otp.join('').length !== 6 || !newPassword} fullWidth>
            Reset Password &amp; Save
          </Button>
        </form>
      )}

      {/* FOOTER ACTIONS */}
      <div className="mt-6 text-center text-xs text-zinc-500 font-medium space-y-2">
        {step === 'OTP_AND_PASSWORD_STEP' && (
          <p>
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="font-bold text-zinc-950 underline hover:text-emerald-700 cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
        )}
        <p>
          <Link href="/login" className="text-zinc-400 hover:text-zinc-950 underline underline-offset-4 transition-colors font-bold">
            Back to Login screen
          </Link>
        </p>
      </div>
    </div>
  );
}