// app/api/razorpay-webhook/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dayjs from "dayjs";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

// Helper to map Razorpay Plan ID back to your internal plan names
const planIdToName: Record<string, string> = {
  [process.env.RP_PLAN_MONTH_INR!]: "monthly",
  [process.env.RP_PLAN_QUARTER_INR!]: "quarterly",
  [process.env.RP_PLAN_YEAR_INR!]: "yearly",
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = (await headers()).get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Razorpay signature" },
      { status: 400 }
    );
  }

  // 1. Verify the webhook signature
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (err) {
    console.error("Error during signature verification:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 500 }
    );
  }

  // 2. Process the webhook payload
  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const subscription = payload.payload.subscription.entity;

    const customerId = subscription.customer_id;
    const planName = planIdToName[subscription.plan_id] || "unknown";

    console.log(`Received Razorpay event: ${event} for customer ${customerId}`);

    switch (event) {
      case "subscription.activated":
      case "subscription.charged": // A recurring payment was successful
        await supabase
          .from("users")
          .update({
            subscription_status: true,
            subscription_plan: planName,
            subscription_start: dayjs
              .unix(subscription.current_start)
              .toISOString(),
            subscription_end: dayjs
              .unix(subscription.current_end)
              .toISOString(),
            razorpay_subscription_id: subscription.id,
            last_webhook_at: new Date().toISOString(),
          })
          .eq("razorpay_customer_id", customerId);

        console.log(
          `Subscription activated/charged for customer ${customerId}. Plan: ${planName}`
        );
        break;

      case "subscription.halted": // Subscription is paused due to payment failure
      case "subscription.cancelled": // User or you cancelled the subscription
        await supabase
          .from("users")
          .update({
            subscription_status: false,
            // You might keep the end date to show when access expired
            last_webhook_at: new Date().toISOString(),
          })
          .eq("razorpay_customer_id", customerId);

        console.log(
          `Subscription halted/cancelled for customer ${customerId}.`
        );
        break;

      default:
        console.log(`Unhandled Razorpay event type: ${event}`);
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (err) {
    console.error("Error processing Razorpay webhook:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Webhook processing failed", details: errorMessage },
      { status: 500 }
    );
  }
}
