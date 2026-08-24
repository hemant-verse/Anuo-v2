'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product, isFavorite = false, onToggleFavorite, showFavorite = true }) {
  const productId = product?._id;
  if (!productId) return null;

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite?.(event, productId, isFavorite);
  };

  return (
    <Link href={`/product/${productId}`} className="group block h-full">
      <article className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer relative">
        <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
          <Image
            src={product.images?.[0] || '/images/placeholder.png'}
            alt={product.title || 'Product listing'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.category && (
            <span className="absolute top-2.5 left-2.5 bg-zinc-900/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          )}
          {showFavorite && onToggleFavorite && (
            <button
              type="button"
              onClick={handleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-pressed={isFavorite}
              className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 transition-transform cursor-pointer"
            >
              <svg
                className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
        <div className="p-3.5 flex flex-col flex-grow justify-between space-y-2">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-950 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight mb-1">
              {product.title}
            </h3>
            <p className="font-black text-emerald-800 text-sm sm:text-base">
              ₹{product.price?.toLocaleString?.() || '0'}
            </p>
          </div>
          <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-100">
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Recently'}
          </p>
        </div>
      </article>
    </Link>
  );
}
