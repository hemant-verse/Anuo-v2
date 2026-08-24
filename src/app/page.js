
import Background from '@/components/Background';
import HomePageClient from '@/components/home/HomePageClient';

export const metadata = {
  title: 'Auno',
  description: 'College marketplace for students to buy and sell items',
};



export default async function HomePage() {

  return (
    <main className="relative min-h-screen w-full ">
      <Background />
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        <HomePageClient />
      </div>
    </main>
  );
}