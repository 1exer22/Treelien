import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PRODUCTS } from '@/src/stripe-config';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

// Stripe client-side instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Get product by ID
export const getProductById = (id: string) => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

// Get product by price ID
export const getProductByPriceId = (priceId: string) => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

// Create checkout session
export const createCheckoutSession = async (priceId: string, token: string) => {
  const product = getProductByPriceId(priceId);
  if (!product) {
    throw new Error('Product not found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_id: priceId,
      mode: product.mode,
      success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
};