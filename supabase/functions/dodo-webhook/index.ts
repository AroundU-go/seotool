import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, webhook-id, webhook-signature, webhook-timestamp",
};

// Initialize Supabase admin client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Webhook Signature Verification ---
async function verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookId: string,
    timestamp: string
): Promise<boolean> {
    try {
        if (!webhookSecret) {
            console.warn("DODO_WEBHOOK_SECRET not set, skipping verification");
            return true; // Allow in dev if secret not set
        }

        // Dodo uses standardwebhooks: base64(hmac-sha256(secret, "${webhook_id}.${timestamp}.${body}"))
        const secretBytes = base64Decode(webhookSecret.replace("whsec_", ""));
        const signedContent = `${webhookId}.${timestamp}.${payload}`;

        const key = await crypto.subtle.importKey(
            "raw",
            secretBytes,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signatureBytes = await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(signedContent)
        );

        const expectedSignature = base64Encode(new Uint8Array(signatureBytes));

        // signature header may contain multiple signatures separated by space (v1,xxx v1,yyy)
        const signatures = signature.split(" ");
        for (const sig of signatures) {
            const sigValue = sig.split(",").slice(1).join(","); // Remove "v1," prefix
            if (sigValue === expectedSignature) {
                return true;
            }
        }

        console.error("Signature mismatch");
        return false;
    } catch (err) {
        console.error("Signature verification error:", err);
        return false;
    }
}

function base64Decode(str: string): Uint8Array {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function base64Encode(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// --- Mark user as Pro in profiles table ---
async function markUserAsPro(email: string, customerId?: string, subscriptionId?: string) {
    console.log(`Marking user as Pro: ${email}`);

    const { data, error } = await supabase
        .from("profiles")
        .update({
            is_pro: true,
            dodo_customer_id: customerId || null,
            subscription_id: subscriptionId || null,
            pro_since: new Date().toISOString(),
        })
        .eq("email", email)
        .select();

    if (error) {
        console.error("Error updating profile:", error);
        return false;
    }

    if (!data || data.length === 0) {
        console.warn(`No profile found for email: ${email}`);
        return false;
    }

    console.log(`Successfully marked ${email} as Pro`);
    return true;
}

// --- Main handler ---
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    try {
        const body = await req.text();
        const webhookId = req.headers.get("webhook-id") ?? "";
        const webhookSignature = req.headers.get("webhook-signature") ?? "";
        const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";

        // Verify signature
        const isValid = await verifyWebhookSignature(
            body,
            webhookSignature,
            webhookId,
            webhookTimestamp
        );

        if (!isValid) {
            console.error("Invalid webhook signature");
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const event = JSON.parse(body);
        console.log("Webhook event received:", JSON.stringify(event, null, 2));

        const eventType = event.type || event.event_type || "";
        const payload = event.data || event.payload || event;

        // Extract customer email from various possible payload structures
        const customerEmail =
            payload.customer?.email ||
            payload.customer_email ||
            payload.billing?.email ||
            payload.metadata?.email ||
            "";

        const customerId =
            payload.customer?.customer_id ||
            payload.customer_id ||
            "";

        const subscriptionId =
            payload.subscription_id ||
            payload.subscription?.subscription_id ||
            "";

        console.log(`Event: ${eventType}, Email: ${customerEmail}, Customer: ${customerId}`);

        // Handle relevant events
        const successEvents = [
            "subscription.active",
            "subscription.created",
            "payment.succeeded",
            "payment.completed",
            "payment_succeeded",
            "payment_completed",
            "order.completed",
            "one_time_payment.completed",
        ];

        if (successEvents.includes(eventType) || eventType.includes("payment") || eventType.includes("subscription")) {
            if (customerEmail) {
                const success = await markUserAsPro(customerEmail, customerId, subscriptionId);
                if (success) {
                    return new Response(
                        JSON.stringify({ success: true, message: `User ${customerEmail} marked as Pro` }),
                        {
                            status: 200,
                            headers: { ...corsHeaders, "Content-Type": "application/json" },
                        }
                    );
                } else {
                    // Still return 200 to acknowledge receipt (avoid retries)
                    return new Response(
                        JSON.stringify({ success: false, message: `Profile not found for ${customerEmail}` }),
                        {
                            status: 200,
                            headers: { ...corsHeaders, "Content-Type": "application/json" },
                        }
                    );
                }
            } else {
                console.warn("No customer email found in webhook payload");
                return new Response(
                    JSON.stringify({ success: false, message: "No customer email in payload" }),
                    {
                        status: 200,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    }
                );
            }
        }

        // For unhandled event types, acknowledge receipt
        console.log(`Unhandled event type: ${eventType}`);
        return new Response(
            JSON.stringify({ success: true, message: `Event ${eventType} acknowledged` }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Webhook handler error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Internal server error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
