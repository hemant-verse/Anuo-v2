'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks';
import ProfileDropdown from '../ProfileDropdown';
import PwaInstallButton from '@/components/PwaInstallButton';


export default function Navbar() {

  const { user, checked } = useAuth();



  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-30"
    >
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <Image className="h-10 w-auto" src="https://ik.imagekit.io/algoping/campusmarket/public%20/Auno_text_logo.png.png" alt="Auno" width={120} height={40} priority />
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <PwaInstallButton />
        {checked && (
          <>
            {user ? (
            
              <>
                <div className="flex items-center gap-3">
                  <ProfileDropdown />
      
                  {user?.role === 'admin' && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 bg-black hover:bg-gray-200 hover:text-gray-900 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-50 rounded-xl"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </>
            ) : (
           
              <>
                <Link href="/login" className="px-4 py-2 hover:scale-105 text-sm font-semibold text-zinc-800 hover:text-zinc-950 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950 rounded">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-full shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">
                  Register
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </motion.nav>
  );
}