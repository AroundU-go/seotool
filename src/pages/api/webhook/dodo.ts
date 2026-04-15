import { NextApiRequest, NextApiResponse } from 'next';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';

// Disable standard body parser to receive raw body for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // fallback
                           
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const rawBody = await getRawBody(req);
        
        const client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
            environment: process.env.DODO_PAYMENTS_API_KEY?.startsWith('test_') ? 'test_mode' : 'live_mode',
            webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || '',
        });

        const webhookHeaders = {
            'webhook-id': req.headers['webhook-id'] as string,
            'webhook-signature': req.headers['webhook-signature'] as string,
            'webhook-timestamp': req.headers['webhook-timestamp'] as string,
        };

        // Unwrap checks signature and returns parsed JSON data payload
        const event = client.webhooks.unwrap(rawBody.toString('utf8'), { headers: webhookHeaders });

        const eventType = event.type;
        const metadata = (event.data as any)?.metadata;
        const userId = metadata?.user_id;

        if (!userId) {
            console.warn(`[Webhook] Ignored event ${eventType} - missing metadata.user_id`);
            return res.status(200).json({ received: true });
        }

        console.log(`[Webhook] Processing event ${eventType} for user ${userId}`);

        if (eventType === 'payment.succeeded' || eventType === 'subscription.active' || eventType === 'subscription.renewed') {
            const isSub = eventType === 'subscription.active' || eventType === 'subscription.renewed' || (event.data as any)?.subscription_id;
            
            const paymentType = isSub ? 'subscription' : 'one_time';
            
            // Update Supabase profile
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_pro: true,
                    pro_since: new Date().toISOString(),
                    payment_type: paymentType,
                    pro_audit_count: 0 // Reset audit counts upon re-sub or purchase
                })
                .eq('id', userId);

            if (profileError) {
                console.error(`[Webhook] Error updating profile for user ${userId}:`, profileError);
                return res.status(500).json({ error: 'Database error' });
            }

            console.log(`[Webhook] Successfully updated profile for user ${userId} to ${paymentType}`);
            return res.status(200).json({ received: true });
        }

        if (eventType === 'subscription.on_hold' || eventType === 'subscription.cancelled' || eventType === 'subscription.failed') {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_pro: false,
                    payment_type: null
                })
                .eq('id', userId);

            if (profileError) {
                console.error(`[Webhook] Error revoking profile for user ${userId}:`, profileError);
                return res.status(500).json({ error: 'Database error' });
            }

            console.log(`[Webhook] Successfully revoked profile for user ${userId} on ${eventType}`);
            return res.status(200).json({ received: true });
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] Error:', error.message || error);
        return res.status(401).json({ error: 'Webhook verification or processing failed' });
    }
}
