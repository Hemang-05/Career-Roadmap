// //app/api/initiate-subscription/route.ts

// import { dodopayments } from "@/utils/dodopayment";
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// // Ensure Supabase environment variables are provided.
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error(
//     "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
//   );
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// // Map your subscription plans to the corresponding product IDs from your dodopayments dashboard.
// const productIds: Record<string, string> = {
//   monthly: process.env.PRODUCT_ID_MONTHLY || "pdt_monthly_default",
//   quarterly: process.env.PRODUCT_ID_QUARTERLY || "pdt_quarterly_default",
//   yearly: process.env.PRODUCT_ID_YEARLY || "pdt_yearly_default",
//   month: process.env.PRODUCT_ID_MONTH || "pdt_monthly_default",
//   quarter: process.env.PRODUCT_ID_QUARTER || "pdt_quarterly_default",
//   year: process.env.PRODUCT_ID_YEAR || "pdt_yearly_default",
// };

// export async function POST(request: Request) {
//   try {
//     const { clerk_id, plan, discountCode, cunt } = await request.json();

//     if (!clerk_id || !plan) {
//       return NextResponse.json(
//         { error: "Missing clerk id or plan" },
//         { status: 400 }
//       );
//     }

//     const product_id = productIds[plan];
//     if (!product_id) {
//       return NextResponse.json(
//         { error: "Invalid subscription plan" },
//         { status: 400 }
//       );
//     }
//     // Fetch the user's email (and full_name) from Supabase using clerk_id
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("email, full_name")
//       .eq("clerk_id", clerk_id)
//       .single();

//     if (userError || !user?.email) {
//       console.error("Error fetching user email:", userError);
//       return NextResponse.json(
//         { error: "User email not found" },
//         { status: 400 }
//       );
//     }

//     const response = await dodopayments.subscriptions.create({
//       billing: {
//         city: "city",
//         country: cunt || "IN", // Ensure you use a valid ISO country code
//         state: "state",
//         street: "",
//         zipcode: "zipcode",
//       },
//       customer: {
//         email: user.email,
//         name: user.full_name || "",
//       },
//       payment_link: true,
//       product_id,
//       discount_code: discountCode || null,
//       quantity: 1,
//       return_url: process.env.NEXT_PUBLIC_RETURN_URL, // Adjust as needed
//     });

//     return NextResponse.json({ subscriptionUrl: response.payment_link });
//   } catch (error) {
//     console.error("Error initiating subscription:", error);
//     return NextResponse.json(
//       { error: "Failed to initiate subscription" },
//       { status: 500 }
//     );
//   }
// }

// app/api/initiate-subscription/route.ts

import { dodopayments } from "@/utils/dodopayment";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Ensure Supabase environment variables are provided.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map your subscription plans to the corresponding product IDs from your dodopayments dashboard.
const productIds: Record<string, string> = {
  monthly: process.env.PRODUCT_ID_MONTHLY || "pdt_monthly_default",
  quarterly: process.env.PRODUCT_ID_QUARTERLY || "pdt_quarterly_default",
  yearly: process.env.PRODUCT_ID_YEARLY || "pdt_yearly_default",
  month: process.env.PRODUCT_ID_MONTH || "pdt_monthly_default",
  quarter: process.env.PRODUCT_ID_QUARTER || "pdt_quarterly_default",
  year: process.env.PRODUCT_ID_YEAR || "pdt_yearly_default",
};

export async function POST(request: Request) {
  try {
    const { clerk_id, plan, discountCode, cunt } = await request.json();

    if (!clerk_id || !plan) {
      return NextResponse.json(
        { error: "Missing clerk id or plan" },
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
    // Fetch the user's email (and full_name) from Supabase using clerk_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("clerk_id", clerk_id)
      .single();

    if (userError || !user?.email) {
      console.error("Error fetching user email:", userError);
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const response = await dodopayments.subscriptions.create({
      billing: {
        city: "city",
        country: cunt || "IN", // Ensure you use a valid ISO country code
        state: "state",
        street: "",
        zipcode: "zipcode",
      },
      customer: {
        email: user.email,
        name: user.full_name || "",
      },
      payment_link: true,
      product_id,
      discount_code: discountCode || null,
      quantity: 1,
      return_url: process.env.NEXT_PUBLIC_RETURN_URL, // Adjust as needed
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
