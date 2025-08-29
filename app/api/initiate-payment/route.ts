// // app/api/initiate-payment/route.ts

// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import Razorpay from "razorpay";
// import dayjs from "dayjs";

// // The faulty import for 'Subscription' has been removed.

// // Initialize Supabase
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("Missing Supabase environment variables.");
// }
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// // Map your internal plan names to Razorpay Plan IDs from your .env file
// const planIds: Record<string, string> = {
//   monthly: process.env.RP_PLAN_MONTH_INR!,
//   quarterly: process.env.RP_PLAN_QUARTER_INR!,
//   yearly: process.env.RP_PLAN_YEAR_INR!,
// };

// const planTotalCounts: Record<string, number> = {
//   monthly: 12, // 12 monthly payments for a 1-year subscription
//   quarterly: 4, // 4 quarterly payments for a 1-year subscription
//   yearly: 1, // 1 yearly payment for a 1-year subscription
// };

// export async function POST(request: Request) {
//   console.log("--- New Payment Initiation Request ---");
//   console.log(
//     "Using Razorpay Key ID:",
//     process.env.RAZORPAY_KEY_ID
//       ? `rzp_...${process.env.RAZORPAY_KEY_ID.slice(-4)}`
//       : "UNDEFINED"
//   );
//   console.log("Available Plan IDs:", planIds);

//   try {
//     const { clerk_id, plan } = await request.json();

//     if (!clerk_id || !plan) {
//       return NextResponse.json(
//         { error: "Missing clerk_id or plan" },
//         { status: 400 }
//       );
//     }

//     const plan_id = planIds[plan];
//     const total_count = planTotalCounts[plan];

//     // ✅ STEP 2: LOG THE SELECTED PLAN
//     console.log(
//       `Request for plan: '${plan}'. Corresponding Plan ID: '${plan_id}'`
//     );

//     if (!plan_id) {
//       return NextResponse.json(
//         { error: "Invalid subscription plan" },
//         { status: 400 }
//       );
//     }

//     // 1. Fetch user from Supabase
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("email, full_name, razorpay_customer_id")
//       .eq("clerk_id", clerk_id)
//       .single();

//     if (userError || !user) {
//       console.error("Error fetching user:", userError);
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     let customerId = user.razorpay_customer_id;

//     // 2. Create a Razorpay Customer if they don't have one yet
//     if (!customerId) {
//       const customer = await razorpay.customers.create({
//         name: user.full_name || "New User",
//         email: user.email,
//         contact: "",
//       });
//       customerId = customer.id;

//       await supabase
//         .from("users")
//         .update({ razorpay_customer_id: customerId })
//         .eq("clerk_id", clerk_id);
//     }

//     // 3. Create the Razorpay Subscription
//     const subscription = razorpay.subscriptions.create({
//       plan_id: plan_id,
//       // @ts-ignore - Razorpay types might not include customer_id
//       customer_id: customerId,
//       total_count: total_count,
//       quantity: 1,
//       customer_notify: 1,
//     }) as any;

//     // Persist subscription info to Supabase immediately so UI reflects change
//     try {
//       const subscriptionStart =
//         typeof subscription.current_start === "number"
//           ? dayjs.unix(subscription.current_start).toISOString()
//           : subscription.start_at || new Date().toISOString();
//       const subscriptionEnd =
//         typeof subscription.current_end === "number"
//           ? dayjs.unix(subscription.current_end).toISOString()
//           : null;

//       await supabase
//         .from("users")
//         .update({
//           subscription_plan: plan,
//           subscription_start: subscriptionStart,
//           subscription_end: subscriptionEnd,
//           razorpay_subscription_id: subscription.id,
//           razorpay_customer_id: customerId,
//         })
//         .eq("clerk_id", clerk_id);
//     } catch (err) {
//       console.warn("Failed to persist subscription to Supabase:", err);
//       // do not block the flow; webhook remains source of truth
//     }

//     // 4. Return the subscription ID and key to the frontend
//     return NextResponse.json({
//       subscription_id: subscription.id,
//       key_id: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error("Error initiating Razorpay subscription:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "Failed to initiate subscription", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// app/api/initiate-payment/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import dayjs from "dayjs";

// --- Validate server envs (fail fast) ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set."
  );
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    "Missing Razorpay environment variables. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set."
  );
}

// Plan IDs from env
const planIds: Record<string, string> = {
  monthly: process.env.RP_PLAN_MONTH_INR || "",
  quarterly: process.env.RP_PLAN_QUARTER_INR || "",
  yearly: process.env.RP_PLAN_YEAR_INR || "",
};

// Validate plan envs early
for (const [k, v] of Object.entries(planIds)) {
  if (!v) {
    console.warn(
      `Warning: plan id for '${k}' is missing. Check RP_PLAN_${k.toUpperCase()}_INR env variable.`
    );
  }
}

const planTotalCounts: Record<string, number> = {
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

// Initialize Supabase (use service key on server)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Helper: mask key for logs
function maskKey(key?: string) {
  if (!key) return "undefined";
  if (key.length <= 8) return key;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

async function createNewRazorpayCustomerAndPersist(
  clerk_id: string,
  user: any
) {
  const newCustomer = await razorpay.customers.create({
    name: user.full_name || "New User",
    email: user.email,
    contact: "",
  });

  const newCustomerId = newCustomer.id;
  console.log("Created new Razorpay customer:", newCustomerId);

  // Persist to Supabase
  try {
    await supabase
      .from("users")
      .update({ razorpay_customer_id: newCustomerId })
      .eq("clerk_id", clerk_id);
  } catch (err) {
    console.warn(
      "Failed to persist new Razorpay customer id to Supabase:",
      err
    );
  }

  return newCustomerId;
}

async function razorpayCustomerExists(customerId: string) {
  try {
    // Try fetching the customer — will 404 if not present in this env
    const customer = await razorpay.customers.fetch(customerId);
    return !!customer;
  } catch (err) {
    return false;
  }
}

export async function POST(request: Request) {
  console.log("--- New Payment Initiation Request ---");
  console.log("Razorpay Key ID:", maskKey(RAZORPAY_KEY_ID));
  console.log("Available Plan IDs:", planIds);

  try {
    const body = await request.json();
    const { clerk_id, plan } = body || {};

    if (!clerk_id || !plan) {
      return NextResponse.json(
        { error: "Missing clerk_id or plan" },
        { status: 400 }
      );
    }

    const plan_id = planIds[plan];
    const total_count = planTotalCounts[plan];

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
      console.error("Error fetching user from Supabase:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId: string | null = user.razorpay_customer_id || null;

    // If customerId exists, verify it exists in this Razorpay environment
    if (customerId) {
      const exists = await razorpayCustomerExists(customerId);
      if (!exists) {
        console.warn(
          `Stored razorpay_customer_id '${customerId}' does not exist in this Razorpay environment. Will create a new customer.`
        );
        customerId = null;
      }
    }

    // Create customer if necessary
    if (!customerId) {
      customerId = await createNewRazorpayCustomerAndPersist(clerk_id, user);
    }

    // 2. Create the subscription (with retry if customer id / plan id mismatch)
    console.log(
      "Creating subscription with plan_id:",
      plan_id,
      "customer_id:",
      customerId
    );

    let subscription: any = null;

    try {
      subscription = await razorpay.subscriptions.create({
        plan_id: plan_id,
        // @ts-ignore - sometimes types don't include customer_id
        customer_id: customerId,
        total_count: total_count,
        quantity: 1,
        customer_notify: 1,
      });
    } catch (err: any) {
      console.warn("Initial subscription create failed:", err);

      // Inspect Razorpay error text
      const razorErrorDescription =
        err && err.error && (err.error.description || err.error.message)
          ? err.error.description || err.error.message
          : err.message || String(err);

      // If it's an 'id does not exist' (likely customer), create a new customer and retry once
      if (
        razorErrorDescription &&
        /does not exist|not found|not present|No such/.test(
          String(razorErrorDescription)
        )
      ) {
        try {
          console.log(
            "Detected missing id error from Razorpay. Creating a fresh customer and retrying subscription..."
          );

          const newCustomerId = await createNewRazorpayCustomerAndPersist(
            clerk_id,
            user
          );

          subscription = await razorpay.subscriptions.create({
            plan_id: plan_id,
            // @ts-ignore
            customer_id: newCustomerId,
            total_count: total_count,
            quantity: 1,
            customer_notify: 1,
          });

          customerId = newCustomerId;
        } catch (retryErr: any) {
          console.error("Retry after creating new customer failed:", retryErr);
          // Return Razorpay error to client
          const descr =
            retryErr &&
            retryErr.error &&
            (retryErr.error.description || retryErr.error.message)
              ? retryErr.error.description || retryErr.error.message
              : retryErr.message || String(retryErr);
          return NextResponse.json(
            {
              error: "Failed to create subscription after retry",
              details: descr,
            },
            { status: 400 }
          );
        }
      } else {
        // Some other error — bubble up
        const descr = razorErrorDescription || "Unknown Razorpay error";
        return NextResponse.json(
          { error: "Failed to create subscription", details: descr },
          { status: 400 }
        );
      }
    }

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "Failed to create subscription - no subscription object returned",
        },
        { status: 500 }
      );
    }

    // 3. Persist subscription info to Supabase (best-effort)
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
      console.warn(
        "Failed to persist subscription to Supabase (non-fatal):",
        err
      );
    }

    // 4. Return the subscription ID and key to the frontend
    return NextResponse.json(
      {
        subscription_id: subscription.id,
        key_id: RAZORPAY_KEY_ID,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error initiating Razorpay subscription:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to initiate subscription", details: errorMessage },
      { status: 500 }
    );
  }
}
