// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";


// // Set maximum duration for serverless function (Vercel's limit)
// export const runtime = "nodejs";
// export const maxDuration = 300; // 5 minutes

// export async function GET(request: Request) {
//   console.log("Starting user-specific event processing cron job");

//   // Optional: Add authorization check
//   const authHeader = request.headers.get("authorization");
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response("Unauthorized", {
//       status: 401,
//     });
//   }

//   try {
//     const currentDate = new Date();

//     // First, get all users with active subscription
//     const { data: subscribedUsers, error: usersError } = await supabase
//       .from("users")
//       .select("id, clerk_id, subscription_status")
//       .eq("subscription_status", true);

//     if (usersError) {
//       console.error("Error fetching subscribed users:", usersError);
//       return NextResponse.json(
//         { error: "Failed to fetch subscribed users" },
//         { status: 500 }
//       );
//     }

//     console.log(
//       `Found ${subscribedUsers?.length || 0} users with active subscriptions`
//     );

//     // Get all users who need updates
//     const usersNeedingUpdates = [];
//     const results = [];

//     // Process each subscribed user to determine if they need an events update
//     for (const user of subscribedUsers || []) {
//       try {
//         // Get career info for user
//         const { data: careerInfo, error: careerError } = await supabase
//           .from("career_info")
//           .select("desired_career, parent_email, created_at")
//           .eq("user_id", user.id)
//           .single();

//         if (careerError || !careerInfo?.desired_career) {
//           console.log(`Skipping user ${user.id}: No career info or error`);
//           continue;
//         }

//         // Get most recent event entry for this user
//         const { data: mostRecentEvent, error: eventError } = await supabase
//           .from("events")
//           .select("created_at")
//           .eq("user_id", user.id)
//           .order("created_at", { ascending: false })
//           .limit(1)
//           .single();

//         // Determine if this user needs an update
//         const needsUpdate =
//           // First time user (no events yet)
//           !mostRecentEvent ||
//           // Or last update was more than 15 days ago
//           new Date(mostRecentEvent.created_at).getTime() <
//             new Date(
//               currentDate.getTime() - 15 * 24 * 60 * 60 * 1000
//             ).getTime();

//         if (needsUpdate) {
//           usersNeedingUpdates.push({
//             user_id: user.id,
//             clerk_id: user.clerk_id,
//             desired_career: careerInfo.desired_career,
//             parent_email: careerInfo.parent_email,
//           });
//         }
//       } catch (err) {
//         console.error(`Error checking update status for user ${user.id}:`, err);
//       }
//     }

//     console.log(
//       `Processing events for ${usersNeedingUpdates.length} subscribed users who need updates`
//     );

//     // Process each user who needs an update
    
//     for (const userInfo of usersNeedingUpdates) {
//       try {
//         // 1) Trigger your Gemini‑powered endpoint (which itself inserts into Supabase)
//         const gemRes = await fetch(
//           `${process.env.API_BASE_URL}/api/events-api-gemini`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user_id: userInfo.user_id }),
//           }
//         );
//         const gemJson = await gemRes.json();

//         // 2) Skip if Gemini failed or returned zero events
//         if (!gemJson.success || gemJson.events_found === 0) {
//           console.log(
//             `No results for user ${userInfo.user_id}:`,
//             gemJson.error || "0 events"
//           );
//           continue;
//         }

//         // 3) (Optional) replicate your date/month logic
//         const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
//         const currentMonth = currentDate.toLocaleString("default", {
//           month: "long",
//         });

//         // 4) Send email notification exactly as before
//         await sendEmailNotification(
//           userInfo.clerk_id,
//           userInfo.parent_email
//         );

//         // 5) Push a matching result object
//         results.push({
//           user_id: userInfo.user_id,
//           status: "success",
//           events_count: gemJson.events_found,
//         });

//         console.log(
//           `Successfully processed events for user ${userInfo.user_id}`
//         );
//       } catch (err: any) {
//         console.error(`Error processing user ${userInfo.user_id}:`, err);
//         results.push({
//           user_id: userInfo.user_id,
//           status: "error",
//           error: err.message || String(err),
//         });
//       }
//     }


//     return NextResponse.json({
//       success: true,
//       processed: usersNeedingUpdates.length,
//       results,
//     });
//   } catch (error: any) {
//     console.error("Cron job error:", error);
//     return NextResponse.json(
//       {
//         error: "Internal server error",
//         details: error.message || String(error),
//       },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to send email notifications
// async function sendEmailNotification(
//   clerk_id: string,
//   parent_email: string | null
// ) {
//   try {
//     // Get user details from Clerk (you might need to fetch this differently)
//     const userResponse = await fetch(
//       `${process.env.API_BASE_URL}/api/get-user-by-clerk-id`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ clerk_id }),
//       }
//     );

//     const userData = await userResponse.json();
//     if (!userData.success) {
//       throw new Error("Failed to get user details");
//     }

//     const userEmail = userData.email;
//     const userName = userData.name || "there";

//     // Build recipient list
//     const recipients = [userEmail];
//     if (parent_email) {
//       recipients.push(parent_email);
//     }

//     // Email payload - copied from your existing code
//     const emailPayload = {
//       to: recipients,
//       subject: "New Career Events Available",
//       html: `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Career Events Update</title>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            
//             body {
//               font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
//               line-height: 1.5;
//               color: #1a1a1a;
//               background-color: #f8f9fa;
//               margin: 0;
//               padding: 20px;
//               display: flex;
//               justify-content: center;
//             }
//             .container {
//               max-width: 600px;
//               width: 100%;
//               margin: 0 auto;
//               background-color: #FDFAF6;
//               border-radius: 32px;
//               overflow: hidden;
//               box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
//             }
//             .header {
//               padding: 28px 0;
//               text-align: center;
//               background: linear-gradient(70deg, #FF6500, #FCB454);
//               color: white;
//             }
//             .logo {
//               font-size: 32px;
//               font-weight: 600;
//               letter-spacing: 1.3px;
//             }
//             .content {
//               padding: 40px 36px;
//             }
//             .title {
//               font-size: 24px;
//               font-weight: 600;
//               color: #1a1a1a;
//               margin: 0 0 24px 0;
//               letter-spacing: -0.5px;
//             }
//             .text {
//               font-size: 15px;
//               color: #444;
//               margin-bottom: 20px;
//               font-weight: 400;
//             }
//             .button-container {
//               text-align: center;
//               margin: 32px 0;
//             }
//             .button {
//               display: inline-block;
//               background: linear-gradient(135deg, #FF6500, #FCB454);
//               color: white;
//               text-decoration: none;
//               padding: 14px 32px;
//               border-radius: 32px;
//               font-weight: 500;
//               font-size: 15px;
//               box-shadow: 0 4px 12px rgba(102, 101, 221, 0.3);
//             }
//             .divider {
//               height: 1px;
//               background-color: #eaeaea;
//               margin: 36px 0;
//             }
//             .event-title {
//               font-size: 17px;
//               font-weight: 600;
//               margin: 0 0 8px 0;
//             }
//             .event-description {
//               font-size: 14px;
//               color: #666;
//               margin: 0;
//             }
//             .footer {
//               background-color: #f8f9fa;
//               padding: 24px;
//               text-align: center;
//               font-size: 13px;
//               color: #888;
//             }
//             @media only screen and (max-width: 550px) {
//               .content {
//                 padding: 30px 24px;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <div class="logo">Career Roadmap</div>
//             </div>
            
//             <div class="content">
//               <h1 class="title">New Career Opportunities Available</h1>
              
//               <p class="text">Hello ${userName},</p>
              
//               <p class="text">We're pleased to inform you that new career events matching your professional profile have been added to our platform.</p>
              
//               <div class="event-preview">
//                 <h3 class="event-title">Events Notification</h3>
//                 <p class="event-description">Check out the new events and improve your chances to reach your dream.</p>
//               </div>
              
//               <div class="button-container">
//                 <a href="https://www.careeroadmap.com/events" class="button">View All Events</a>
//               </div>
              
//               <div class="divider"></div>
              
//               <p class="text">We carefully curate opportunities to help accelerate your career growth and connect you with ways to improve your portfolio.</p>
              
//               <p class="text" style="margin-bottom: 0;">Best regards,<br>The Career Roadmap Team</p>
//             </div>
            
//             <div class="footer">
//               <div>© 2025 Career Roadmap. All rights reserved.</div>
//             </div>
//           </div>
//         </body>
//         </html>
//       `,
//       text: `Hello ${userName},
      
//       We've curated new career events that align with your professional goals. These exclusive opportunities are now available in your personalized dashboard.
      
//       FEATURED EVENT:
//       Tech Industry Networking Summit - Connect with industry leaders and explore emerging career paths in technology.
      
//       View all events: [APP_LINK]
      
//       Your career growth matters to us. Our team has carefully selected these events based on your profile and interests.
      
//       Best regards,
//       The Career Roadmap Team
      
//       © 2025 Career Roadmap. All rights reserved.
//       `,
//     };

//     // Send the email
//     const res = await fetch(`${process.env.API_BASE_URL}/api/send-email`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(emailPayload),
//     });

//     const data = await res.json();
//     console.log("Email notification sent:", data);
//     return data;
//   } catch (err: any) {
//     console.error("Error sending email notification:", err);
//     throw err;
//   }
// }


import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";
import pLimit from "p-limit";

// Define the expected shape of the view row
type StaleSubscriber = {
  user_id: string;
  clerk_id: string;
  desired_career: string;
  parent_email: string | null;
};

// Enable background execution up to 15 minutes
export const config = {
  runtime: "nodejs",
  maxDuration: 900,
  background: true,
};

export async function GET(request: Request) {
  console.log("Starting user-specific event processing cron job (background)");

  // Authorization check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch only users who need updates via a dedicated view
    const { data, error: fetchError } = await supabase
      .from("stale_subscribers")
      .select("user_id, clerk_id, desired_career, parent_email");
    if (fetchError) {
      console.error("Failed to fetch stale subscribers:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    const subscribers = (data as StaleSubscriber[]) || [];

    console.log(`Found ${subscribers.length} users needing updates`);

    // Throttle concurrency to 10 parallel jobs
    const limit = pLimit(10);
    const jobs = subscribers.map((userInfo: StaleSubscriber) =>
      limit(async () => {
        try {
          // 1) Call the Gemini-powered endpoint
          const gemRes = await fetch(
            `${process.env.API_BASE_URL}/api/events-api-gemini`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userInfo.user_id }),
            }
          );
          const gemJson = await gemRes.json();

          if (!gemJson.success || gemJson.events_found === 0) {
            console.log(
              `No results for user ${userInfo.user_id}:`,
              gemJson.error || "0 events"
            );
            return { user_id: userInfo.user_id, status: "skipped", events_count: 0 };
          }

          // 2) Send email notification
          await sendEmailNotification(
            userInfo.clerk_id,
            userInfo.parent_email
          );

          console.log(
            `Successfully processed events for user ${userInfo.user_id}`
          );
          return {
            user_id: userInfo.user_id,
            status: "success",
            events_count: gemJson.events_found,
          };
        } catch (err: any) {
          console.error(`Error processing user ${userInfo.user_id}:`, err);
          return {
            user_id: userInfo.user_id,
            status: "error",
            error: err.message || String(err),
          };
        }
      })
    );

    // Await all parallel jobs
    const results = await Promise.all(jobs);

    return NextResponse.json({
      success: true,
      processed: subscribers.length,
      results,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to send email notifications
async function sendEmailNotification(
  clerk_id: string,
  parent_email: string | null
) {
  try {
    // Fetch user details
    const userResponse = await fetch(
      `${process.env.API_BASE_URL}/api/get-user-by-clerk-id`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id }),
      }
    );
    const userData = await userResponse.json();
    if (!userData.success) {
      throw new Error("Failed to get user details");
    }

    const userEmail = userData.email;
    const userName = userData.name || "there";

    // Build and send email
    const recipients = [userEmail];
    if (parent_email) recipients.push(parent_email);

    const emailPayload = {
      to: recipients,
      subject: "New Career Events Available",
      html: `<html>...event email HTML...</html>`,
      text: "New events are available in your dashboard.",
    };
    await fetch(`${process.env.API_BASE_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });
  } catch (err: any) {
    console.error("Error sending email notification:", err);
    throw err;
  }
}
