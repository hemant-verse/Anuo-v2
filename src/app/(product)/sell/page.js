'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { createProductWithImage } from '@/features/products/api';

const CATEGORIES = ['Books', 'Electronics', 'Dorm', 'Fashion', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CONTACT_METHODS = [
  { label: 'WhatsApp-Number', value: 'whatsapp', placeholder: 'e.g. 9876****10' },
  { label: 'Telegram-UserName', value: 'telegram', placeholder: 'Use username (without @)' },
  { label: 'Instagram-UserName', value: 'instagram', placeholder: 'Use username (without @)' },
];

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNegotiable: false,
    category: '',
    condition: '',
    contactType: 'whatsapp', // Default selected contact option
    contactValue: '',        // Stores input value for selected option
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset contact value when user changes the contact type dropdown
    if (name === 'contactType') {
      setFormData((prev) => ({
        ...prev,
        contactType: value,
        contactValue: '',
      }));
      setFieldErrors((prev) => ({ ...prev, contactValue: undefined }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const processImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setError('');
    setCompressing(true);

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setSelectedFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Client-side image compression failed:', err);
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    setFieldErrors({});
    const errors = {};

    if (!selectedFile) setError('An image file is required.');
    if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
    if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
    if (!formData.price || parseFloat(formData.price) < 0) errors.price = 'Price must be 0 or greater.';
    if (!formData.category) errors.category = 'Please select a valid category.';
    if (!formData.condition) errors.condition = 'Please select a condition.';

    // Contact validation depending on selected method
    const contactVal = formData.contactValue.trim();
    if (!contactVal) {
      errors.contactValue = 'Please enter your contact details.';
    } else if (formData.contactType === 'whatsapp') {
      const digitsOnly = contactVal.replace(/\D/g, '');
      if (digitsOnly.length < 8) {
        errors.contactValue = 'Please enter a valid phone number.';
      }
    } else if (formData.contactType === 'telegram' || formData.contactType === 'instagram') {
      const cleanHandle = contactVal.replace(/^@/, '');
      const digitsOnly = contactVal.replace(/\D/g, '');
      const phoneRegex = /^(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;

      // Reject if input matches a phone number pattern or contains 7+ digits (likely a mobile number)
      if (phoneRegex.test(contactVal) || digitsOnly.length >= 7) {
        errors.contactValue = 'Use username instead of a mobile number.';
      } else if (cleanHandle.length < 2) {
        errors.contactValue = 'Please enter a valid handle/username.';
      }
    }

    if (Object.keys(errors).length > 0 || !selectedFile) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let sanitizedContact = formData.contactValue.trim();
      if (formData.contactType === 'telegram' || formData.contactType === 'instagram') {
        sanitizedContact = sanitizedContact.replace(/^@/, '');
      }

      await createProductWithImage({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price,
        isNegotiable: formData.isNegotiable,
        category: formData.category,
        condition: formData.condition,
        contacts: { [formData.contactType]: sanitizedContact },
      }, selectedFile);

      {
        router.push('/feed');
        router.refresh();
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (err.response?.status === 401) {
        const currentPath = encodeURIComponent(window.location.pathname);
        router.push(`/login?redirect=${currentPath}`);
      } else if (err.response?.status === 400 && responseData?.details) {
        setFieldErrors(responseData.details);
        setError('Validation failed. Please check the highlighted fields below.');
      } else {
        setError(responseData?.error || 'Failed to publish listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Find configuration for the current contact type
  const activeContactConfig = CONTACT_METHODS.find(
    (method) => method.value === formData.contactType
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16 relative overflow-hidden">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 space-y-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
          <Link href="/feed" className="w-8 h-8 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors">
            <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <Link href="/feed" className="hover:text-zinc-950 transition-colors">Home</Link>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-900 font-bold">Sell an Item</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT COLUMN: Image Upload */}
            <div className="lg:col-span-5 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 bg-zinc-50/50 text-center flex flex-col items-center justify-center min-h-[340px] relative transition-all ${
                  dragActive ? 'border-emerald-700 bg-emerald-50/30 scale-[1.01]' : 'border-emerald-800/20'
                }`}
              >
                {compressing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-emerald-800">Optimizing image...</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-200">
                    <Image src={imagePreview} alt="Product Preview" fill unoptimized sizes="100vw" className="object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      aria-label="Remove selected product image"
                      className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-emerald-800/10 rounded-full flex items-center justify-center text-emerald-800 mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    <h3 className="text-base font-extrabold text-zinc-900 mb-1">Drop product photo here</h3>
                    <p className="text-xs text-zinc-400 font-medium mb-4">or</p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer mb-4"
                    >
                      Select from media
                    </button>

                    <span className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                      JPG, PNG, WEBP (auto-compressed on select)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Form Inputs */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight">List Your Item</h1>
                <p className="text-xs font-medium text-zinc-500 mt-1">Fill in the details below to publish your item.</p>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-bold text-zinc-800">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Engineering Mathematics Vol 2"
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                />
                {fieldErrors.title && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5 relative">
                <label htmlFor="description" className="block text-xs font-bold text-zinc-800">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={1000}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe item condition, usage duration, etc..."
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl p-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none resize-none"
                />
                {fieldErrors.description && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.description}</p>}
              </div>

              {/* Price & Negotiable */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-xs font-bold text-zinc-800">
                  Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                />
                {fieldErrors.price && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.price}</p>}

                <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    name="isNegotiable"
                    checked={formData.isNegotiable}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-800 focus:ring-emerald-800 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-zinc-700">Price is negotiable</span>
                </label>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-xs font-bold text-zinc-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.category}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="condition" className="block text-xs font-bold text-zinc-800">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select condition</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                  {fieldErrors.condition && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.condition}</p>}
                </div>
              </div>

              {/* DYNAMIC CONTACT METHOD SECTION */}
              <div className="border-t border-zinc-200 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Platform Selection */}
                  <div className="space-y-1.5">
                    <label htmlFor="contactType" className="block text-xs font-bold text-zinc-800">
                      Preferred Contact Method <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="contactType"
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleChange}
                      className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none cursor-pointer"
                    >
                      {CONTACT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Respective Contact Value Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="contactValue" className="block text-xs font-bold text-zinc-800">
                      {activeContactConfig?.label} Contact Info <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contactValue"
                      type="text"
                      name="contactValue"
                      value={formData.contactValue}
                      onChange={handleChange}
                      placeholder={activeContactConfig?.placeholder}
                      className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                    />
                    {fieldErrors.contactValue && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.contactValue}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || compressing}
                  className="bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {compressing
                      ? 'Optimizing image...'
                      : loading
                      ? 'Submitting for review...'
                      : 'Submit for Approval'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="text-rose-600 font-extrabold focus:outline-none focus:ring-2 focus:ring-rose-700 rounded">
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}