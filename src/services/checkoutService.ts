// Product IDs
const PRODUCT_ONE_TIME = 'pdt_0NaHBvNNtTNxDUEQ1BblK';
const PRODUCT_SUBSCRIPTION = 'pdt_0NYlhH0CqhFDHJIr5v82N';

export interface CheckoutRequest {
    productId: string;
    userId: string;
    email?: string;
    name?: string;
    returnUrl?: string;
}

export interface CheckoutResponse {
    checkout_url: string;
    payment_id?: string;
    subscription_id?: string;
}

/**
 * Create a dynamic checkout via /api/checkout.
 * This properly passes user_id in the metadata so the webhook
 * can match the payment to the correct user profile.
 */
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

/**
 * Redirect to checkout for a given product.
 * Falls back to direct Dodo URL if the API route fails.
 */
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
        console.error('[Checkout] Dynamic checkout failed, using fallback:', err);
    }

    // Fallback: direct Dodo URL with metadata_ query params (legacy approach)
    const redirectUrl = encodeURIComponent(`${window.location.origin}/analyze?payment=success`);
    const baseUrl = `https://checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${redirectUrl}&metadata_user_id=${userId}`;
    window.location.href = baseUrl;
}

export { PRODUCT_ONE_TIME, PRODUCT_SUBSCRIPTION };
