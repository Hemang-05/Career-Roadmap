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

import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { dodopayments } from "@/utils/dodopayment";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

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
        })
        .eq("email", email);

      console.log(`Activated ${plan} for ${email}, expires on ${expires_on}`);
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
