// app/api/initiate-payment/route.ts

import { dodopayments } from "@/utils/dodopayment";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// map plans → product_ids and durations
const plans: Record<string, { productId: string; months: number }> = {
  monthly: { productId: process.env.PRODUCT_ID_MONTHLY!, months: 1 },
  quarterly: { productId: process.env.PRODUCT_ID_QUARTERLY!, months: 3 },
  yearly: { productId: process.env.PRODUCT_ID_YEARLY!, months: 12 },
};

export async function POST(request: Request) {
  const { clerk_id, plan, discountCode } = await request.json();

  if (!clerk_id || !plan || !plans[plan]) {
    return NextResponse.json(
      { error: "Invalid clerk_id or plan" },
      { status: 400 }
    );
  }

  // fetch user email
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("clerk_id", clerk_id)
    .single();

  if (userError || !user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // build one-time payment
  const { productId } = plans[plan];
  const payment = await dodopayments.payments.create({
    billing: {
      city: "city",
      country: "IN",
      state: "state",
      street: "",
      zipcode: "zipcode",
    },
    billing_currency: "INR",
    customer: {
      email: user.email,
      name: user.full_name || "",
    },
    product_cart: [{ product_id: productId, quantity: 1 }],
    allowed_payment_method_types: [
      "upi_intent", // for QR‐code / UPI apps
      "upi_collect", // auto‐collect (if supported)
      "credit",
      "debit",
      "google_pay",
    ],
    payment_link: true,
    discount_code: discountCode || null,
    metadata: { plan },
    return_url: process.env.NEXT_PUBLIC_RETURN_URL,
  });

  return NextResponse.json({ paymentLink: payment.payment_link });
}
