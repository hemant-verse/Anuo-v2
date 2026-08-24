'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks';
import ProductCard from '@/components/product/ProductCard';
import { listProducts } from '@/features/products/api';
import { listCategories } from '@/features/categories/api';
import { addFavorite, listFavorites, removeFavorite } from '@/features/favorites/api';
import ProfileDropdown from '@/components/ProfileDropdown';

const PAGE_SIZE = 20;

export default function FeedPage() {
  // Feed & Product States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Loader States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  // 1. Fetch the authenticated user's favorites from the canonical auth state.
  const { user, checked: authChecked } = useAuth();
  const isAuthenticated = authChecked && Boolean(user);

  useEffect(() => {
    let isActive = true;
    if (!authChecked) return undefined;
    if (!user) return undefined;

    const fetchFavorites = async () => {
      try {
        const result = await listFavorites();
        if (!isActive) return;
        const favMap = (result.favoriteIds || []).reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        setFavorites(favMap);
      } catch {
        if (isActive) setFavorites({});
      }
    };

    void fetchFavorites();
    return () => { isActive = false; };
  }, [authChecked, user]);

  // 2. Fetch Categories Dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategories(await listCategories());
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // 3. Fetch Products with Pagination Support
  const fetchProducts = useCallback(async (category = 'ALL', search = '', pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await listProducts({ category, search, page: pageNum, limit: PAGE_SIZE });
      const fetchedProducts = result.items || [];

      if (append) {
        setProducts((prev) => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      setHasMore(Boolean(result.pagination?.hasNextPage));
    } catch (err) {
      console.error('Failed to load marketplace feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Trigger Re-fetch on Filter Change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(selectedCategory, searchQuery, 1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, fetchProducts]);

  // Load Next Page Function
  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(selectedCategory, searchQuery, nextPage, true);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setPage(1);
  };

  // Toggle Favorites
  const toggleFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const isFav = !!favorites[productId];
    setFavorites((prev) => ({ ...prev, [productId]: !isFav }));

    try {
      if (isFav) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    } catch (err) {
      setFavorites((prev) => ({ ...prev, [productId]: isFav }));

      if (err.response?.status === 401) {
        const currentPath = encodeURIComponent(window.location.pathname);
        window.location.assign(`/login?redirect=${currentPath}`);
      } else {
        console.error('Failed to toggle favorite:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/feed" onClick={handleResetFilters} className="text-xl font-black tracking-tight text-zinc-950 flex items-center gap-0.5">
            A<span className="text-emerald-700">uno</span>
          </Link>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xl hidden sm:block">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="marketplace-search" className="sr-only">Search marketplace</label>
            <input
              id="marketplace-search"
              type="search"
              placeholder="Search for books, gadgets, furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100/80 border-0 focus:ring-2 focus:ring-zinc-950 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
            />
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated === true ? (
              <>
                <Link
                  href="/"
                  aria-label="home"
                  className="p-2 text-zinc-600 hover:text-gray-700 hover:bg-zinc-100 rounded-full transition-colors relative"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>

                </Link>
                <Link
                  href="/favorites"
                  aria-label="Favorites"
                  className="p-2 text-zinc-600 hover:text-rose-600 hover:bg-zinc-100 rounded-full transition-colors relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {Object.keys(favorites).filter((key) => favorites[key]).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </Link>
                <ProfileDropdown />
              </>
            ) : isAuthenticated === false ? (
              <Link href="/login" className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                Login
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-100 animate-pulse" />
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <div className="block sm:hidden">
          <label htmlFor="mobile-marketplace-search" className="sr-only">Search marketplace mobile</label>
          <input
            id="mobile-marketplace-search"
            type="search"
            placeholder="Search for books, gadgets, furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 border-0 focus:ring-2 focus:ring-zinc-950 rounded-full py-2.5 px-4 text-xs font-medium placeholder-zinc-400 text-zinc-900 transition-all outline-none"
          />
        </div>

        {/* HERO PROMO BANNER */}
        <section className="relative rounded-4xl overflow-hidden bg-cover md:bg-center bg-bottom-left bg-no-repeat bg-[url('https://ik.imagekit.io/algoping/campusmarket/public%20/mobile_bg.png')] md:bg-[url('https://ik.imagekit.io/algoping/campusmarket/public%20/desktop_bg.png')] flex items-center justify-center shadow-sm p-8 sm:p-12 md:p-16">
          <div className="relative z-10 max-w-xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              Buy, Sell & Connect <br />
              <span className="text-emerald-700">Across Campus</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-medium text-zinc-700 leading-relaxed max-w-md">
              Your trusted campus marketplace for everything you need. From books to bikes, find it all here!
            </p>
            <div className="pt-2">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-xl transition-all transform active:scale-[0.98]"
              >
                List Your Item
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORIES FILTER */}
        {categories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-950 tracking-tight">Categories</h2>
              {(selectedCategory !== 'ALL' || searchQuery !== '') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${selectedCategory === 'ALL'
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300'
                  }`}
              >
                All Items
              </button>

              {categories.map((cat) => {
                const categoryName = typeof cat === 'string' ? cat : cat.name;
                const itemCount = cat.count !== undefined ? `${cat.count} items` : null;
                const isSelected = selectedCategory === categoryName;

                return (
                  <button
                    key={cat._id || categoryName}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? 'ALL' : categoryName)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer whitespace-nowrap ${isSelected
                        ? 'bg-zinc-950 border-zinc-950 text-white shadow-md'
                        : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-md text-zinc-900'
                      }`}
                  >
                    <span className="text-xs font-bold">{categoryName}</span>
                    {itemCount && (
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        ({itemCount})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* LATEST LISTINGS */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight text-zinc-950">
              {selectedCategory !== 'ALL' ? `${selectedCategory} Listings` : 'Latest Listings'}
            </h2>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
            >
              View All
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-zinc-200/80 p-3 space-y-3 animate-pulse">
                  <div className="aspect-square bg-zinc-100 rounded-xl" />
                  <div className="h-4 bg-zinc-100 rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200/80">
              <p className="text-base font-bold text-zinc-900 mb-1">No active listings found</p>
              <p className="text-xs text-zinc-500">There are currently no items matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {products.map((item) => (
                  <ProductCard
                    key={item._id}
                    product={item}
                    isFavorite={!!favorites[item._id]}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              {hasMore && (
                <div className="pt-8 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? 'Loading More Items...' : 'Load More Products'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}