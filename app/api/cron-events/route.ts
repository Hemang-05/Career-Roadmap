
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";
import Bottleneck from "bottleneck";

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

// Number of users to process per run
const BATCH_SIZE = 12;

export async function GET(request: Request) {
  console.log("Starting user-specific event processing cron job (background)");

  // Authorization check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch stale subscribers via view
    const { data, error: fetchError } = await supabase
      .from("stale_subscribers")
      .select("user_id, clerk_id, desired_career, parent_email");
    if (fetchError) {
      console.error("Failed to fetch stale subscribers:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    const subscribers = (data as StaleSubscriber[]) || [];

    // Slice off only a batch for this run
    const toProcess = subscribers.slice(0, BATCH_SIZE);
    console.log(`Processing ${toProcess.length}/${subscribers.length} users this run`);

    // Rate limiter: 10 calls per minute, one at a time
    const limiter = new Bottleneck({
      reservoir: 10,
      reservoirRefreshAmount: 10,
      reservoirRefreshInterval: 60_000,
      maxConcurrent: 1,
    });

    // Schedule each user through the limiter
    const jobs = toProcess.map((userInfo) =>
      limiter.schedule(() => processUser(userInfo))
    );

    // Await batch completion
    const results = await Promise.all(jobs);

    return NextResponse.json({ success: true, processed: toProcess.length, results });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Per-user processing, always insert an events row (even if empty)
async function processUser(userInfo: StaleSubscriber) {
  try {
    // 1) Call the Gemini-powered endpoint (this handles all DB operations)
    const gemRes = await fetch(
      `${process.env.API_BASE_URL}/api/events-api-gemini`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userInfo.user_id }),
      }
    );
    const gemJson = await gemRes.json();

    // Determine events count
    let eventsCount = 0;
    if (!gemJson.success || gemJson.events_found === 0) {
      console.log(`No results for user`);
    } else {
      eventsCount = gemJson.events_found;
    }

    // 2) Send notification if real events were found
    if (eventsCount > 0) {
      await sendEmailNotification(userInfo.clerk_id, userInfo.parent_email);
      console.log(`Events sent for user`);
    }

    return { user_id: userInfo.user_id, status: "success", events_count: eventsCount };
  } catch (err: any) {
    console.error(`Error processing user :`, err);
    return { user_id: userInfo.user_id, status: "error", error: err.message };
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
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Career Events Update</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #1a1a1a;
              background-color: #f8f9fa;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
            }
            .container {
              max-width: 600px;
              width: 100%;
              margin: 0 auto;
              background-color: #FDFAF6;
              border-radius: 32px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
            }
            .header {
              padding: 28px 0;
              text-align: center;
              background: linear-gradient(70deg, #FF6500, #FCB454);
              color: white;
            }
            .logo {
              font-size: 32px;
              font-weight: 600;
              letter-spacing: 1.3px;
            }
            .content {
              padding: 40px 36px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
              margin: 0 0 24px 0;
              letter-spacing: -0.5px;
            }
            .text {
              font-size: 15px;
              color: #444;
              margin-bottom: 20px;
              font-weight: 400;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #FF6500, #FCB454);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 32px;
              font-weight: 500;
              font-size: 15px;
              box-shadow: 0 4px 12px rgba(102, 101, 221, 0.3);
            }
            .divider {
              height: 1px;
              background-color: #eaeaea;
              margin: 36px 0;
            }
            .event-title {
              font-size: 17px;
              font-weight: 600;
              margin: 0 0 8px 0;
            }
            .event-description {
              font-size: 14px;
              color: #666;
              margin: 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 24px;
              text-align: center;
              font-size: 13px;
              color: #888;
            }
            @media only screen and (max-width: 550px) {
              .content {
                padding: 30px 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Career Roadmap</div>
            </div>
            
            <div class="content">
              <h1 class="title">New Career Opportunities Available</h1>
              
              <p class="text">Hello ${userName},</p>
              
              <p class="text">We're pleased to inform you that new career events matching your professional profile have been added to our platform.</p>
              
              <div class="event-preview">
                <h3 class="event-title">Events Notification</h3>
                <p class="event-description">Check out the new events and improve your chances to reach your dream.</p>
              </div>
              
              <div class="button-container">
                <a href="https://www.careeroadmap.com/events" class="button">View All Events</a>
              </div>
              
              <div class="divider"></div>
              
              <p class="text">We carefully curate opportunities to help accelerate your career growth and connect you with ways to improve your portfolio.</p>
              
              <p class="text" style="margin-bottom: 0;">Best regards,<br>The Career Roadmap Team</p>
            </div>
            
            <div class="footer">
              <div>© 2025 Career Roadmap. All rights reserved.</div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${userName},
      
      We've curated new career events that align with your professional goals. These exclusive opportunities are now available in your personalized dashboard.
      
      FEATURED EVENT:
      Tech Industry Networking Summit - Connect with industry leaders and explore emerging career paths in technology.
      
      View all events: [APP_LINK]
      
      Your career growth matters to us. Our team has carefully selected these events based on your profile and interests.
      
      Best regards,
      The Career Roadmap Team
      
      © 2025 Career Roadmap. All rights reserved.
      `,
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


