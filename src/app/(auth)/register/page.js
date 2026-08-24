// app/register/page.js
import RegisterClient from '@/components/auth/RegisterClient';
import Background from '@/components/Background';

export const metadata = {
  title: 'Join the Community | Auno',
  description: 'Create your distraction-free college marketspace profile and match your vibe.',
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full  flex items-center justify-center">
      <Background />
      <RegisterClient />
    </main>
  );
}