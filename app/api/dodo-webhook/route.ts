// app/api/dodo-webhook/route.ts

import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { dodopayments } from "@/utils/dodopayment";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import { Subscript } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();
  const rawBody = await request.text();

  try {
    // Verify signature
    await webhook.verify(rawBody, {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    });

    const payload = JSON.parse(rawBody);

    // Handle one-time payment success
    if (payload.type === "payment.succeeded") {
      const data = payload.data;
      const email = data.customer.email;
      const plan = data.metadata?.plan as "monthly" | "quarterly" | "yearly";
      const durations = { monthly: 1, quarterly: 3, yearly: 12 };
      const months = durations[plan] || 0;
      const expires_on = dayjs().add(months, "month").toISOString();

      // Update user in Supabase
      await supabase
        .from("users")
        .update({
          subscription_status: true,
          subscription_end: expires_on,
          subscription_plan: plan,
          subscription_start: new Date().toISOString().split("T")[0],
        })
        .eq("email", email);

      console.log(`Activated ${plan} for ${email}, expires on ${expires_on}`);
    }

    // Handle subscription-related webhooks coming from dodopayments
    // Keep one-time payment logic above unchanged.
    // Support events like: subscription.active, subscription.cancelled, subscription.expired, subscription.failed
    try {
      const isSubscriptionEvent =
        payload.data?.payload_type === "Subscription" ||
        (typeof payload.type === "string" &&
          payload.type.startsWith("subscription."));

      if (isSubscriptionEvent) {
        const eventType: string = payload.type;

        // Try to resolve subscription id and customer email from payload
        const subscriptionId =
          payload.data?.subscription_id ||
          payload.data?.subscription?.id ||
          null;
        const customerEmail =
          payload.data?.customer?.email ||
          payload.data?.subscription?.customer?.email ||
          null;

        // Attempt to retrieve full subscription object for details
        let subscription: any = null;
        if (subscriptionId) {
          try {
            subscription = await dodopayments.subscriptions.retrieve(
              subscriptionId
            );
          } catch (err) {
            console.warn("Could not retrieve subscription details:", err);
          }
        }

        // Helper to map product_id -> plan name (best-effort using env vars)
        const productId =
          subscription?.product_id || payload.data?.product_id || null;
        const productToPlanMap: Record<string, string> = {
          [process.env.PRODUCT_ID_MONTH || ""]: "monthly",
          [process.env.PRODUCT_ID_QUARTER || ""]: "quarterly",
          [process.env.PRODUCT_ID_YEAR || ""]: "yearly",
          [process.env.PRODUCT_ID_MONTHLY || ""]: "monthly",
          [process.env.PRODUCT_ID_QUARTERLY || ""]: "quarterly",
          [process.env.PRODUCT_ID_YEARLY || ""]: "yearly",
          [process.env.PRODUCT_ID_MONTH || ""]: "monthly",
          [process.env.PRODUCT_ID_QUARTER || ""]: "quarterly",
          [process.env.PRODUCT_ID_YEAR || ""]: "yearly",
        };

        const detectedPlan = productId
          ? productToPlanMap[productId] || null
          : null;

        // Determine dates
        const nextBilling =
          subscription?.next_billing_date ||
          subscription?.current_period_end ||
          null;
        const startDate =
          subscription?.start_date || new Date().toISOString().split("T")[0];

        switch (eventType) {
          case "subscription.active":
          case "subscription.created":
            // Activate subscription for the user
            if (customerEmail) {
              await supabase
                .from("users")
                .update({
                  subscription_status: true,
                  subscription_end: nextBilling,
                  subscription_plan: detectedPlan,
                  subscription_start: startDate,
                })
                .eq("email", customerEmail);

              console.log(
                `Subscription activated for ${customerEmail}, plan=${detectedPlan}, next_billing=${nextBilling}`
              );
            }
            break;

          case "subscription.cancelled":
          case "subscription.expired":
            if (customerEmail) {
              await supabase
                .from("users")
                .update({
                  subscription_status: false,
                  subscription_end: null,
                })
                .eq("email", customerEmail);

              console.log(
                `Subscription cancelled/expired for: ${customerEmail}`
              );
            }
            break;

          case "subscription.failed":
            if (customerEmail) {
              await supabase
                .from("users")
                .update({
                  subscription_status: false,
                })
                .eq("email", customerEmail);

              console.log(`Subscription payment failed for: ${customerEmail}`);
            }
            break;

          default:
            // other subscription events can be logged for visibility
            console.log("Unhandled subscription event:", eventType);
            break;
        }
      }
    } catch (subErr) {
      console.warn("Error handling subscription webhook:", subErr);
      // don't throw; allow the webhook to return OK for other handlers
    }

    return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ message: "Webhook verification failed" }),
      { status: 400 }
    );
  }
}
