import { dodopayments } from "@/utils/dodopayment";
import { NextResponse } from "next/server";

// Map your subscription plans to the corresponding product IDs from your dodopayments dashboard.
const productIds: Record<string, string> = {
  monthly: process.env.PRODUCT_ID_MONTHLY || "pdt_monthly_default",
  quarterly: process.env.PRODUCT_ID_QUARTERLY || "pdt_quarterly_default",
  yearly: process.env.PRODUCT_ID_YEARLY || "pdt_yearly_default",
};

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();

    if (!email || !plan) {
      return NextResponse.json(
        { error: "Missing email or plan" },
        { status: 400 }
      );
    }

    const product_id = productIds[plan];
    if (!product_id) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    const response = await dodopayments.subscriptions.create({
      billing: {
        city: "",
        country: "IN", // Ensure you use a valid ISO country code
        state: "",
        street: "",
        zipcode: "",
      },
      customer: {
        email,
        name: "", // Optionally, pass the customer's name if available
      },
      payment_link: true,
      product_id,
      quantity: 1,
      return_url: process.env.NEXT_PUBLIC_ANALYSIS_URL, // Adjust as needed
    });

    return NextResponse.json({ subscriptionUrl: response.payment_link });
  } catch (error) {
    console.error("Error initiating subscription:", error);
    return NextResponse.json(
      { error: "Failed to initiate subscription" },
      { status: 500 }
    );
  }
}
