'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProduct } from '@/features/products/api';

export default function ProductDetailClient({ id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setProduct(await getProduct(id));
      } catch (err) {
        if (err.response?.status === 401) {
          router.push(`/login?redirect=/product/${id}`);
          return;
        }
        setError(err.response?.data?.error || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="h-4 w-32 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
            <div className="aspect-square w-full bg-zinc-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-zinc-100 rounded-full animate-pulse" />
              <div className="h-8 w-3/4 bg-zinc-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200/80 p-8 text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-950">Listing Unavailable</h2>
          <p className="text-xs text-zinc-500">{error || 'This product listing does not exist.'}</p>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-zinc-950 text-white font-bold text-xs rounded-full"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = `₹${product.price?.toLocaleString() || '0'}`;
  const statusUpper = product.availabilityStatus?.toUpperCase() || 'AVAILABLE';

  // Construct Links
  const waPhone = product.contacts?.whatsapp ? product.contacts?.whatsapp.replace(/\D/g, '') : null;
  const whatsappUrl = waPhone ? `https://wa.me/91${waPhone}` : null;

  const tgUser = product.contacts?.telegram ? product.contacts?.telegram.replace(/^@/, '').trim() : null;
  const telegramUrl = tgUser ? `https://t.me/${tgUser}` : null;

  const instaUser = product.contacts?.instagram ? product.contacts?.instagram.replace(/^@/, '').trim() : null;
  const instagramUrl = instaUser ? `https://instagram.com/${instaUser}` : null;

  const hasAnySocial = whatsappUrl || telegramUrl || instagramUrl;

  return (
    <div className="min-h-screen bg-white pb-16">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          ← Back to Marketplace
        </Link>

        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
            <Image src={product.images?.[0] || '/images/placeholder.png'} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                  {product.category}
                </span>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
                  {statusUpper}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">{product.title}</h1>
                <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">{formattedPrice}</p>
              </div>

              <div className="border-y border-zinc-100 py-3 text-xs text-zinc-600 font-medium">
                <div className="flex justify-between">
                  <span>Condition</span>
                  <span className="font-bold text-zinc-900">{product.condition}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Seller Contact Container */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Listed By</h4>
                <p className="font-bold text-zinc-950 text-sm">
                  {product.sellerId?.userName || 'Seller'}
                </p>
              </div>

              <div className="space-y-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Contact via WhatsApp
                  </a>
                )}

                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Contact via Telegram
                  </a>
                )}

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Contact via Instagram
                  </a>
                )}

                {!hasAnySocial && product.sellerId?.email && (
                  <a
                    href={`mailto:${product.sellerId.email}?subject=${encodeURIComponent(`Interested in ${product.title}`)}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Contact via Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}