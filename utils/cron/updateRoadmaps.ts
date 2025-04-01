import cron from 'node-cron';
import { supabase } from '@/utils/supabase/supabaseClient';
import fetch from 'node-fetch';

// Helper function to check if 3 months have passed from a given date.
function threeMonthsPassed(dateString: string): boolean {
  const baseDate = new Date(dateString);
  const now = new Date();
  // Add 3 months to baseDate.
  const threeMonthsLater = new Date(baseDate);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return now >= threeMonthsLater;
}

async function processUpdates() {
  console.log("Cron job started: Checking for roadmap updates...");

  // Fetch all career_info records.
  const { data: records, error } = await supabase
    .from('career_info')
    .select('user_id, created_at, updated_at');
  if (error) {
    console.error("Error fetching career_info records:", error);
    return;
  }

  if (!records || records.length === 0) {
    console.log("No career_info records found.");
    return;
  }

  // Process each record.
  for (const record of records) {
    const { user_id, created_at, updated_at } = record;
    let lastUpdate = updated_at || created_at;
    if (threeMonthsPassed(lastUpdate)) {
      try {
        console.log(`Updating roadmap for user: ${user_id}`);
        // Call the update-user-roadmap endpoint for this user.
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-user-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id }),
        });
        const json = await res.json() as any;
        if (json.success) {
          console.log(`Successfully updated roadmap for user ${user_id}`);
        } else {
          console.error(`Error updating roadmap for user ${user_id}:`, json.error);
        }
      } catch (err) {
        console.error(`Exception updating roadmap for user ${user_id}:`, err);
      }
    } else {
      console.log(`User ${user_id} does not require update yet.`);
    }
  }

  console.log("Cron job finished: Roadmap update check complete.");
}

// Schedule the job to run daily at 1:00 AM (adjust cron expression as needed).
cron.schedule('0 1 * * *', () => {
  processUpdates();
});
