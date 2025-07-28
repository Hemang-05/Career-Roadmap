// //app/api/dodo-webhook/route.ts

// import { Webhook } from "standardwebhooks";
// import { headers } from "next/headers";
// import { dodopayments } from "@/utils/dodopayment";
// import { createClient } from "@supabase/supabase-js";

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

// export async function POST(request: Request) {
//   const headersList = await headers();
//   try {
//     const rawBody = await request.text();
//     const webhookHeaders = {
//       "webhook-id": headersList.get("webhook-id") || "",
//       "webhook-signature": headersList.get("webhook-signature") || "",
//       "webhook-timestamp": headersList.get("webhook-timestamp") || "",
//     };

//     await webhook.verify(rawBody, webhookHeaders);
//     const payload = JSON.parse(rawBody);

//     if (payload.data.payload_type === "Subscription") {
//       switch (payload.type) {
//         case "subscription.active":
//           const subscription = await dodopayments.subscriptions.retrieve(
//             payload.data.subscription_id
//           );

//           // Update user's subscription status in Supabase
//           await supabase
//             .from("users")
//             .update({
//               subscription_status: true,
//               subscription_end: subscription.next_billing_date,
//             })
//             .eq("email", subscription.customer.email);

//           console.log(
//             "Subscription updated in Supabase:",
//             subscription.customer.email
//           );
//           break;

//         case "subscription.cancelled":
//         case "subscription.expired":
//           await supabase
//             .from("users")
//             .update({
//               subscription_status: false,
//               subscription_end: null,
//             })
//             .eq("email", payload.data.customer.email);

//           console.log(
//             "Subscription cancelled/expired for:",
//             payload.data.customer.email
//           );
//           break;

//         case "subscription.failed":
//           await supabase
//             .from("users")
//             .update({
//               subscription_status: false,
//               subscription_end: null,
//             })
//             .eq("email", payload.data.customer.email);

//           console.log("Subscription failed for:", payload.data.customer.email);
//           break;

//         default:
//           break;
//       }
//     }

//     return Response.json(
//       { message: "Webhook processed successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Webhook verification failed:", error);
//     return Response.json(
//       { message: "Webhook verification failed" },
//       { status: 400 }
//     );
//   }
// }

// app/api/dodo-webhook/route.ts

// export const runtime = 'nodejs';

// import { Webhook } from "standardwebhooks";
// import { headers } from "next/headers";
// import { dodopayments } from "@/utils/dodopayment";
// import { createClient } from "@supabase/supabase-js";
// import dayjs from "dayjs";
// import { Subscript } from "lucide-react";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

// export async function GET() {
//   return new Response("OK from GET", { status: 200 });
// }

// export async function POST(request: Request) {
//   console.log("🧾 METHOD:", request.method);
//   const headersList = await headers();
//   const rawBody = await request.text();

//   try {
//     // Verify signature
//     await webhook.verify(rawBody, {
//       "webhook-id": headersList.get("webhook-id") || "",
//       "webhook-signature": headersList.get("webhook-signature") || "",
//       "webhook-timestamp": headersList.get("webhook-timestamp") || "",
//     });

//     const payload = JSON.parse(rawBody);

//     // Handle one-time payment success
//     if (payload.type === "payment.succeeded") {
//       const data = payload.data;
//       const {email} = data.customer.email;
//       const plan = data.metadata?.plan as "monthly" | "quarterly" | "yearly";
//       const durations = { monthly: 1, quarterly: 3, yearly: 12 };
//       const months = durations[plan] || 0;
//       const expires_on = dayjs().add(months, "month").toISOString();

//       // Update user in Supabase
//       const { data: updatedRows, error } = await supabase
//         .from("users")
//         .update({
//           subscription_status: true,
//           subscription_end: expires_on,
//           subscription_plan: plan,
//           subscription_start: new Date().toISOString().split("T")[0],
//         })
//         .eq("email", email);

//      if (error) {
//         console.error('Supabase update error:', error);
//       } else if (updatedRows.length === 0) {
//         console.warn(`No matching user for email=${email}`);
//       } else {
//         console.log(`Activated ${plan} for ${email}; rows updated: ${updatedRows.length}`);
//       }
//     }

//     return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
//   } catch (err) {
//     console.error("Webhook error:", err);
//     return new Response(
//       JSON.stringify({ message: "Webhook verification failed" }),
//       { status: 400 }
//     );
//   }
// }



// app/api/dodo-webhook/route.ts

import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";



type WebhookPayload = {
  type: string;
  data: {
    payload_type: string;
    customer: { email: string };
    metadata?: { plan?: string };
    status?: string;
    current_period_end?: string;
    subscription_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

// initialize Supabase with service‐role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// initialize Dodo webhook verifier
const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();
  const rawBody = await request.text();

  try {
    // 1) Verify Dodo webhook signature
    await webhook.verify(rawBody, {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    });

    // 2) Parse payload
    const payload = JSON.parse(rawBody) as WebhookPayload;
    const email = payload.data.customer.email;
    if (!email) throw new Error("Missing customer email in payload");

    // 3) Branch on type of webhook
    if (payload.data.payload_type === "Subscription") {
      // subscription events (created / updated / canceled / etc.)
      const plan = (payload.data.metadata?.plan as string) || "unknown";
      const status = payload.data.status;
      const periodEnd = payload.data.current_period_end; // ISO string

      if (status === "active") {
        // when a subscription becomes active
        await supabase
          .from("users")
          .update({
            subscription_status: true,
            subscription_plan: plan,
            subscription_start: dayjs().toISOString(),
            subscription_end: dayjs(periodEnd).toISOString(),
          })
          .eq("email", email);
      } else {
        // paused, canceled, expired, etc.
        await supabase
          .from("users")
          .update({
            subscription_status: false,
          })
          .eq("email", email);
      }

    } else if (
      payload.data.payload_type === "Payment" &&
      payload.type === "payment.succeeded" &&
      !payload.data.subscription_id
    ) {
      // one‑time payment succeeded
      const metadata = payload.data.metadata || {};
      const plan = metadata.plan as "monthly" | "quarterly" | "yearly";
      const durations = { monthly: 1, quarterly: 3, yearly: 12 };
      const months = durations[plan] || 0;
      const expiresOn = dayjs().add(months, "month").toISOString();

      await supabase
        .from("users")
        .update({
          subscription_status: true,
          subscription_plan: plan,
          subscription_start: dayjs().toISOString(),
          subscription_end: expiresOn,
        })
        .eq("email", email);
    }

    // 4) Respond with success
    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: error.message || "Unknown error",
      }),
      { status: 400 }
    );
  }
}