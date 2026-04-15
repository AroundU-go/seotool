import type { NextApiRequest, NextApiResponse } from 'next';
import DodoPayments from 'dodopayments';

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY || '';
const DODO_ENV = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';

import { PRODUCT_ONE_TIME, PRODUCT_SUBSCRIPTION } from '@/services/checkoutService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { product_id, user_id, email, name, return_url } = req.body;

        if (!product_id || !user_id) {
            return res.status(400).json({ error: 'Missing required fields: product_id, user_id' });
        }

        if (!DODO_API_KEY) {
            return res.status(500).json({ error: 'DODO_PAYMENTS_API_KEY not configured' });
        }

        const client = new DodoPayments({
            bearerToken: DODO_API_KEY,
            environment: DODO_ENV as any,
        });

        const isSubscription = product_id === PRODUCT_SUBSCRIPTION;
        const redirectUrl = return_url || 'https://seozapp.com/analyze?payment=success';

        // Prepare customer object only if we have details
        const customerObj = (email || name) ? {
            ...(email ? { email } : {}),
            ...(name ? { name } : {})
        } : undefined;

        if (isSubscription) {
            // Create subscription via Dodo API
            const subscriptionPayload: any = {
                product_id,
                metadata: { user_id },
                return_url: redirectUrl,
                quantity: 1,
            };
            if (customerObj) subscriptionPayload.customer = customerObj;

            const subscription = await client.subscriptions.create(subscriptionPayload);

            return res.status(200).json({
                checkout_url: (subscription as any).payment_link || (subscription as any).checkout_url,
                subscription_id: (subscription as any).subscription_id,
            });
        } else {
            // Create one-time payment via Dodo API
            const paymentPayload: any = {
                product_cart: [{ product_id, quantity: 1 }],
                metadata: { user_id },
                payment_link: true,
                return_url: redirectUrl,
            };
            if (customerObj) paymentPayload.customer = customerObj;

            const payment = await client.payments.create(paymentPayload);

            return res.status(200).json({
                checkout_url: (payment as any).payment_link || (payment as any).checkout_url,
                payment_id: (payment as any).payment_id,
            });
        }
    } catch (error: any) {
        console.error('[/api/checkout] Error:', error);
        return res.status(500).json({
            error: error?.message || 'Failed to create checkout',
            details: error?.response?.data || undefined,
        });
    }
}
