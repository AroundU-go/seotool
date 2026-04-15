export const PRODUCT_ONE_TIME = 'pdt_0NYskaXuWvqB7pOJJAWHR';
export const PRODUCT_SUBSCRIPTION = 'pdt_0NYsnZquqsrqDi9SW9pHT';

export interface CheckoutRequest {
    productId: string;
    userId: string;
    email?: string;
    name?: string;
    returnUrl?: string;
}

export interface CheckoutResponse {
    checkout_url: string;
    session_id?: string;
}

export async function createCheckout(params: CheckoutRequest): Promise<CheckoutResponse> {
    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: params.productId,
            user_id: params.userId,
            email: params.email || '',
            name: params.name || '',
            return_url: params.returnUrl || `${window.location.origin}/analyze?payment=success`,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Checkout failed (${res.status})`);
    }

    return res.json();
}

export async function redirectToCheckout(
    productId: string,
    userId: string,
    email?: string,
    name?: string,
): Promise<void> {
    try {
        const result = await createCheckout({
            productId,
            userId,
            email,
            name,
        });

        if (result.checkout_url) {
            window.location.href = result.checkout_url;
            return;
        }
    } catch (err) {
        console.error('[Checkout] Dynamic checkout failed', err);
        throw err;
    }
}
