import { useState, useCallback, useEffect } from 'react';

// Loads Razorpay checkout script once
const useRazorpayScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) { setIsLoaded(true); return; }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => { console.error('Failed to load Razorpay script.'); setIsLoaded(false); };
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, []);

  return isLoaded;
};

/* ─── Shared ─── */
interface BaseOptions {
  name: string;
  description: string;
  prefill: { name: string; email: string; contact?: string };
  onSuccess: (response: any) => void;
  onError: (response: any) => void;
}

/* ─── Subscription ─── */
interface SubscriptionOptions extends BaseOptions {
  type: 'subscription';
  subscriptionId: string;
}

/* ─── One-time Order ─── */
interface OrderOptions extends BaseOptions {
  type: 'order';
  orderId: string;
  amount: number; // in paise
  currency?: string;
}

type RazorpayOptions = SubscriptionOptions | OrderOptions;

export function useRazorpay() {
  const isReady = useRazorpayScript();

  const openCheckout = useCallback((options: RazorpayOptions) => {
    if (!isReady || !window.Razorpay) {
      console.error('Razorpay SDK not loaded yet.');
      return;
    }

    const baseConfig = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      name: options.name,
      description: options.description,
      theme: { color: '#4f46e5' },
      prefill: options.prefill,
      handler: (response: any) => options.onSuccess(response),
    };

    let rzpOptions: any;

    if (options.type === 'subscription') {
      rzpOptions = {
        ...baseConfig,
        subscription_id: options.subscriptionId,
      };
    } else {
      rzpOptions = {
        ...baseConfig,
        order_id: options.orderId,
        amount: options.amount,
        currency: options.currency || 'INR',
      };
    }

    const rzp = new window.Razorpay(rzpOptions);
    rzp.on('payment.failed', (response: any) => options.onError(response));
    rzp.open();
  }, [isReady]);

  return { isReady, openCheckout };
}
