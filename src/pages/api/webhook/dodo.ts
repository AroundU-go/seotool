import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { PRODUCT_ONE_TIME, PRODUCT_SUBSCRIPTION } from '@/services/checkoutService';

// Disable body parsing — we need the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

async function getRawBody(req: NextApiRequest): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
    });
}

function base64Decode(str: string): Uint8Array {
    const binary = Buffer.from(str, 'base64');
    return new Uint8Array(binary);
}

function base64Encode(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64');
}

async function verifySignature(
    payload: string,
    signature: string,
    webhookId: string,
    timestamp: string
): Promise<boolean> {
    try {
        if (!webhookSecret) {
            console.warn('[Webhook] DODO_PAYMENTS_WEBHOOK_SECRET not set, skipping verification');
            return true;
        }

        const crypto = require('crypto');
        const secretBytes = base64Decode(webhookSecret.replace('whsec_', ''));
        const signedContent = `${webhookId}.${timestamp}.${payload}`;

        const hmac = crypto.createHmac('sha256', secretBytes);
        hmac.update(signedContent);
        const expectedSignature = hmac.digest('base64');

        // Signature header may contain multiple signatures
        const signatures = signature.split(' ');
        for (const sig of signatures) {
            const sigValue = sig.split(',').slice(1).join(',');
            if (sigValue === expectedSignature) {
                return true;
            }
        }

        console.error('[Webhook] Signature mismatch');
        return false;
    } catch (err) {
        console.error('[Webhook] Signature verification error:', err);
        return false;
    }
}

// Extract user_id and email from Dodo webhook payload
function extractPayloadFields(event: any) {
    const data = event.data || event.payload || event;
    
    // Dodo webhook structure: { type, data: { metadata: { user_id }, customer: { email }, ... } }
    const metadata = data.metadata || event.metadata || {};
    const customer = data.customer || event.customer || {};
    
    const userId = metadata.user_id || metadata.userId || '';
    const customerEmail = customer.email || data.customer_email || metadata.email || '';
    const customerId = customer.customer_id || data.customer_id || '';
    const subscriptionId = data.subscription_id || '';
    const productId = data.product_id || 
        (data.product_cart && data.product_cart[0]?.product_id) ||
        (data.items && data.items[0]?.product_id) || '';
    const payloadType = data.payload_type || '';

    console.log('[Webhook] Extracted fields:', { userId, customerEmail, customerId, subscriptionId, productId, payloadType });
    console.log('[Webhook] Raw metadata:', JSON.stringify(metadata));

    return { data, userId, customerEmail, customerId, subscriptionId, productId, payloadType, metadata };
}

// Mark user as Pro
async function markUserAsPro(
    userId: string,
    email: string,
    paymentType: 'one_time' | 'subscription',
    customerId?: string,
    subscriptionId?: string
): Promise<boolean> {
    console.log(`[Webhook] Marking user as Pro: userId=${userId}, email=${email}, paymentType=${paymentType}`);

    const updateData = {
        is_pro: true,
        payment_type: paymentType,
        dodo_customer_id: customerId || null,
        subscription_id: subscriptionId || null,
        pro_since: new Date().toISOString(),
        pro_audit_count: 0,
    };

    // Try by user_id first (most reliable)
    if (userId) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select();

        if (!error && data && data.length > 0) {
            console.log(`[Webhook] ✅ Marked user ${userId} as Pro via id`);
            return true;
        }
        console.warn(`[Webhook] Update by id failed: ${error?.message || 'No rows matched'}`);
    }

    // Fallback: try by email
    if (email) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('email', email)
            .select();

        if (!error && data && data.length > 0) {
            console.log(`[Webhook] ✅ Marked user ${email} as Pro via email`);
            return true;
        }
        console.warn(`[Webhook] Update by email failed: ${error?.message || 'No rows matched'}`);
    }

    console.error(`[Webhook] ❌ Could not find profile for userId=${userId}, email=${email}`);
    return false;
}

// Downgrade user (on subscription cancel/expire)
async function downgradeUser(userId: string, email: string): Promise<boolean> {
    console.log(`[Webhook] Downgrading user: userId=${userId}, email=${email}`);

    const updateData = {
        is_pro: false,
        payment_type: null,
        subscription_id: null,
    };

    if (userId) {
        const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
        if (!error) {
            console.log(`[Webhook] ✅ Downgraded user ${userId}`);
            return true;
        }
    }
    if (email) {
        const { error } = await supabase.from('profiles').update(updateData).eq('email', email);
        if (!error) {
            console.log(`[Webhook] ✅ Downgraded user ${email}`);
            return true;
        }
    }

    return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = await getRawBody(req);
        const webhookId = (req.headers['webhook-id'] as string) || '';
        const webhookSignature = (req.headers['webhook-signature'] as string) || '';
        const webhookTimestamp = (req.headers['webhook-timestamp'] as string) || '';

        // Verify signature
        const isValid = await verifySignature(body, webhookSignature, webhookId, webhookTimestamp);
        if (!isValid) {
            console.error('[Webhook] Invalid signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = JSON.parse(body);
        console.log('[Webhook] Event received:', JSON.stringify(event, null, 2));

        const eventType = (event.type || event.event_type || '').toLowerCase();
        console.log(`[Webhook] Event type: ${eventType}`);

        const { userId, customerEmail, customerId, subscriptionId, productId } = extractPayloadFields(event);

        // Determine payment type from product ID
        let paymentType: 'one_time' | 'subscription' = 'one_time';
        if (productId === PRODUCT_SUBSCRIPTION || subscriptionId) {
            paymentType = 'subscription';
        }

        // Handle different event types
        if (eventType === 'payment.succeeded' || eventType === 'payment.completed') {
            const success = await markUserAsPro(userId, customerEmail, paymentType, customerId, subscriptionId);
            return res.status(200).json({
                success,
                message: success
                    ? `User ${userId || customerEmail} marked as Pro (${paymentType})`
                    : `Profile not found for ${userId || customerEmail}`,
            });
        }

        if (eventType === 'subscription.active' || eventType === 'subscription.renewed') {
            const success = await markUserAsPro(userId, customerEmail, 'subscription', customerId, subscriptionId);
            return res.status(200).json({
                success,
                message: success
                    ? `User ${userId || customerEmail} subscription activated`
                    : `Profile not found for ${userId || customerEmail}`,
            });
        }

        if (
            eventType === 'subscription.cancelled' ||
            eventType === 'subscription.expired' ||
            eventType === 'subscription.failed'
        ) {
            const success = await downgradeUser(userId, customerEmail);
            return res.status(200).json({
                success,
                message: `User ${userId || customerEmail} downgraded due to ${eventType}`,
            });
        }

        // Unhandled event — acknowledge receipt
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
        return res.status(200).json({ success: true, message: `Event ${eventType} acknowledged` });

    } catch (error: any) {
        console.error('[Webhook] Handler error:', error);
        return res.status(500).json({
            error: error?.message || 'Internal server error',
        });
    }
}
