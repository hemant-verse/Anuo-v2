import { getPublicById } from '@/server/products/product.service';
import ProductDetailClient from './ProductDetailClient';

// ── 1. Dynamic Meta Tags for Link Sharing (WhatsApp, Twitter, LinkedIn) ──
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const product = await getPublicById(id);

    if (!product) {
      return {
        title: 'Product Not Found | Auno',
        description: 'This listing is no longer available.',
      };
    }

    const title = `${product.title} - $${product.price} | Auno`;
    const description = `${product.category} • Condition: ${product.condition}. ${product.description ? product.description.slice(0, 120) + '...' : 'Available on Auno.'}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: product.images?.[0],
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [product.images?.[0]],
      },
    };
  } catch (error) {
    return {
      title: 'Auno Listing',
    };
  }
}

// ── 2. Render Client Component UI ──
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  return <ProductDetailClient id={resolvedParams.id} />;
}