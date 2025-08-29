// app/api/initiate-payment/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import dayjs from "dayjs";

// The faulty import for 'Subscription' has been removed.

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Map your internal plan names to Razorpay Plan IDs from your .env file
const planIds: Record<string, string> = {
  monthly: process.env.RP_PLAN_MONTH_INR!,
  quarterly: process.env.RP_PLAN_QUARTER_INR!,
  yearly: process.env.RP_PLAN_YEAR_INR!,
};

const planTotalCounts: Record<string, number> = {
  monthly: 12, // 12 monthly payments for a 1-year subscription
  quarterly: 4, // 4 quarterly payments for a 1-year subscription
  yearly: 1, // 1 yearly payment for a 1-year subscription
};

export async function POST(request: Request) {
  console.log("--- New Payment Initiation Request ---");
  console.log(
    "Using Razorpay Key ID:",
    process.env.RAZORPAY_KEY_ID
      ? `rzp_...${process.env.RAZORPAY_KEY_ID.slice(-4)}`
      : "UNDEFINED"
  );
  console.log("Available Plan IDs:", planIds);

  try {
    const { clerk_id, plan } = await request.json();

    if (!clerk_id || !plan) {
      return NextResponse.json(
        { error: "Missing clerk_id or plan" },
        { status: 400 }
      );
    }

    const plan_id = planIds[plan];
    const total_count = planTotalCounts[plan];

    // ✅ STEP 2: LOG THE SELECTED PLAN
    console.log(
      `Request for plan: '${plan}'. Corresponding Plan ID: '${plan_id}'`
    );

    if (!plan_id) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // 1. Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, full_name, razorpay_customer_id")
      .eq("clerk_id", clerk_id)
      .single();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.razorpay_customer_id;

    // 2. Create a Razorpay Customer if they don't have one yet
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: user.full_name || "New User",
        email: user.email,
        contact: "",
      });
      customerId = customer.id;

      await supabase
        .from("users")
        .update({ razorpay_customer_id: customerId })
        .eq("clerk_id", clerk_id);
    }

    // 3. Create the Razorpay Subscription
    const subscription = razorpay.subscriptions.create({
      plan_id: plan_id,
      // @ts-ignore - Razorpay types might not include customer_id
      customer_id: customerId,
      total_count: total_count,
      quantity: 1,
      customer_notify: 1,
    }) as any;

    // Persist subscription info to Supabase immediately so UI reflects change
    try {
      const subscriptionStart =
        typeof subscription.current_start === "number"
          ? dayjs.unix(subscription.current_start).toISOString()
          : subscription.start_at || new Date().toISOString();
      const subscriptionEnd =
        typeof subscription.current_end === "number"
          ? dayjs.unix(subscription.current_end).toISOString()
          : null;

      await supabase
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_start: subscriptionStart,
          subscription_end: subscriptionEnd,
          razorpay_subscription_id: subscription.id,
          razorpay_customer_id: customerId,
        })
        .eq("clerk_id", clerk_id);
    } catch (err) {
      console.warn("Failed to persist subscription to Supabase:", err);
      // do not block the flow; webhook remains source of truth
    }

    // 4. Return the subscription ID and key to the frontend
    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error initiating Razorpay subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to initiate subscription", details: errorMessage },
      { status: 500 }
    );
  }
}
