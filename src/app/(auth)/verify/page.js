import VerifyClient from '@/components/auth/VerifyClient';
import Background from '@/components/Background';

export const metadata = {
  title: 'Check Your Email | Auno',
  description: 'Verify your student email address to unlock your campus ecosystem.',
};

export default function VerifyPage() {
  return (
    <main className="relative min-h-screen w-full  flex items-center justify-center">
      <Background />
      <VerifyClient />
    </main>
  );
}