// app/login/page.js
import LoginClient from '@/components/auth/LoginClient';
import Background from '@/components/Background';

export const metadata = {
  title: 'Welcome Back | Auno',
  description: 'Log back into your distraction-free college marketspace space.',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full  flex items-center justify-center">
      <Background />
      <LoginClient />
    </main>
  );
}