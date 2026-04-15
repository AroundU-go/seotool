import { NextApiRequest, NextApiResponse } from 'next';
import DodoPayments from 'dodopayments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { product_id, user_id, email, name, return_url } = req.body;

        if (!product_id || !user_id) {
            return res.status(400).json({ error: 'product_id and user_id are required' });
        }

        // Use test_mode ONLY if explicitly configured, otherwise live_mode.
        const isTestMode = process.env.DODO_PAYMENTS_API_KEY?.startsWith('test_');
        
        const client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
            environment: isTestMode ? 'test_mode' : 'live_mode',
        });

        const redirectUrl = return_url || `https://seozapp.com/analyze?payment=success`;

        const customerObj: any = {};
        if (email) customerObj.email = email;
        if (name) customerObj.name = name;

        const sessionPayload: any = {
            product_cart: [{ product_id, quantity: 1 }],
            metadata: { user_id },
            return_url: redirectUrl,
        };
        if (Object.keys(customerObj).length > 0) {
            sessionPayload.customer = customerObj;
        }

        const session = await client.checkoutSessions.create(sessionPayload);

        return res.status(200).json({
            checkout_url: (session as any).checkout_url,
            session_id: (session as any).session_id,
        });
    } catch (error: any) {
        console.error('[/api/checkout] Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
        });
    }
}
