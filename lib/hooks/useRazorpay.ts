import { useState, useCallback, useEffect } from 'react';

// Adds the Razorpay script to document safely
const useRazorpayScript = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        if (window.Razorpay) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
            setIsLoaded(true);
        };
        
        script.onerror = () => {
            console.error('Failed to load Razorpay script.');
            setIsLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return isLoaded;
};

interface RazorpayOptions {
    subscription_id: string;
    name: string;
    description: string;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    onSuccess: (response: any) => void;
    onError: (response: any) => void;
}

export function useRazorpay() {
    const isReady = useRazorpayScript();

    const openCheckout = useCallback((options: RazorpayOptions) => {
        if (!isReady || !window.Razorpay) {
            console.error('Razorpay SDK not loaded yet.');
            return;
        }

        const rzpOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            subscription_id: options.subscription_id,
            name: options.name,
            description: options.description,
            theme: {
                color: '#4f46e5' // Indigo-600 to match the platform
            },
            prefill: options.prefill,
            handler: function (response: any) {
                options.onSuccess(response);
            },
        };

        const rzp = new window.Razorpay(rzpOptions);
        
        rzp.on('payment.failed', function (response: any) {
             options.onError(response);
        });

        rzp.open();
    }, [isReady]);

    return {
        isReady,
        openCheckout
    };
}
