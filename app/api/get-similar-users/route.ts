export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabase/supabaseClient'; // Adjust path as needed

// Define the structure for combined user and analytics data
interface CombinedUserData {
  id: string;
  clerk_id: string;
  full_name: string;
  overall_task_percentage: number;
  pace: number | string; // Adjust type based on your data
  events_attended: number;
  // Add other fields if needed later
}

// Define the structure for the final item format
interface TooltipItem {
  id: string;
  name: string;
  designation: string;
  image: string;
}

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch current user's details
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, career_tag')
      .eq('clerk_id', userId)
      .single();

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: currentUserId, career_tag } = currentUser;

    if (!career_tag) {
       console.log('Current user has no career tag.');
       return NextResponse.json([]); // No tag, no peers
    }

    // 2. Fetch user_ids with the same career tag
    const { data: careerTagData, error: careerTagError } = await supabase
      .from('career_tag')
      .select('user_ids')
      .eq('career_tag', career_tag)
      .single();

    // Allow case where tag exists but no users listed yet (or only the current user)
    if (careerTagError && careerTagError.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows" - allow this
       console.error('Error fetching career tag data:', careerTagError);
       return NextResponse.json({ error: 'Error fetching career tag data' }, { status: 500 });
    }

    const allUserIdsInTag = careerTagData?.user_ids || [];
    const peerUserIds = allUserIdsInTag.filter((id: string) => id !== currentUserId);

    if (peerUserIds.length === 0) {
      console.log('No peers found with the same career tag.');
      return NextResponse.json([]); // No other users with this tag
    }

    // 3. Fetch details for these peer user_ids
    const { data: similarUsers, error: similarUsersError } = await supabase
      .from('users')
      .select('id, clerk_id, full_name')
      .in('id', peerUserIds);

    if (similarUsersError) {
      console.error('Error fetching similar users:', similarUsersError);
      return NextResponse.json({ error: 'Error fetching similar users' }, { status: 500 });
    }
     if (!similarUsers || similarUsers.length === 0) {
       console.log('Similar users found by ID, but details could not be fetched.');
       return NextResponse.json([]); // Should ideally not happen if IDs were valid
     }


    // 4. Fetch analytics for these peer user_ids
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('user_id, overall_task_percentage, pace, events_attended')
      .in('user_id', peerUserIds);

    if (analyticsError) {
      console.error('Error fetching analytics data:', analyticsError);
      // Decide if you want to return an error or proceed with partial data
      // For now, let's return an error as analytics are crucial for sorting
      return NextResponse.json({ error: 'Error fetching peer analytics' }, { status: 500 });
    }

    // 5. Combine user details and analytics data
    const analyticsMap: { [key: string]: any } = {};
    (analyticsData || []).forEach((analytic: any) => {
      analyticsMap[analytic.user_id] = analytic;
    });

    const combinedPeersData: CombinedUserData[] = similarUsers.map((user: any) => {
      const analytics = analyticsMap[user.id] || {};
      return {
        id: user.id,
        clerk_id: user.clerk_id, // Keep if needed, otherwise remove
        full_name: user.full_name || 'Unknown User',
        overall_task_percentage: Number(analytics.overall_task_percentage || 0), // Ensure it's a number, default to 0
        pace: analytics.pace || 'N/A', // Default pace
        events_attended: Number(analytics.events_attended || 0), // Default events
      };
    });

    // 6. Sort and Select Users based on overall_task_percentage
    let selectedPeers: CombinedUserData[];

    if (combinedPeersData.length < 6) {
      // If less than 6 peers, return all of them (randomly or as fetched)
      // You could optionally still sort them here if preferred.
      // For true randomness, you might shuffle the array. For now, just return as is.
      selectedPeers = combinedPeersData;
       console.log(`Found ${combinedPeersData.length} peers (< 6), returning all.`);
    } else {
      // Sort by overall_task_percentage descending
      const sortedPeers = [...combinedPeersData].sort(
        (a, b) => b.overall_task_percentage - a.overall_task_percentage
      );

      const top3 = sortedPeers.slice(0, 3);
      const bottom3 = sortedPeers.slice(-3);

      // Combine top 3 and bottom 3. Use Set to avoid duplicates if top/bottom overlap (unlikely with >6 users but safe)
      const selectedIds = new Set([...top3.map(u => u.id), ...bottom3.map(u => u.id)]);
       selectedPeers = sortedPeers.filter(peer => selectedIds.has(peer.id));

      // It's possible the selection logic above could yield slightly fewer than 6 if the number of users is exactly 6
      // and sorting results in the same users being in top and potentially bottom (e.g., all have same percentage).
      // A simpler approach for exactly 6 or more:
      // selectedPeers = [...top3, ...bottom3];
       console.log(`Found ${combinedPeersData.length} peers (>= 6), selecting top 3 and bottom 3.`);

       // Make sure we don't have duplicates if top3 and bottom3 overlap significantly
       // Convert to a map to ensure uniqueness by ID, then back to array
        const uniquePeersMap = new Map<string, CombinedUserData>();
        [...top3, ...bottom3].forEach(peer => {
            uniquePeersMap.set(peer.id, peer);
        });
        selectedPeers = Array.from(uniquePeersMap.values());


    }

     // --- Defensive Check: Ensure selectedPeers doesn't exceed 6 ---
     if (selectedPeers.length > 6) {
        // This case might happen if the Set logic wasn't used and there was overlap
        // Re-apply the top 3 / bottom 3 selection on the *original* sorted list
        const sortedPeers = [...combinedPeersData].sort(
          (a, b) => b.overall_task_percentage - a.overall_task_percentage
        );
        selectedPeers = [...sortedPeers.slice(0, 3), ...sortedPeers.slice(-3)];
         const uniquePeersMap = new Map<string, CombinedUserData>();
        selectedPeers.forEach(peer => {
            uniquePeersMap.set(peer.id, peer);
        });
        selectedPeers = Array.from(uniquePeersMap.values());
     }
     // --- End Defensive Check ---

    // 7. Format the selected users for the AnimatedTooltip
    const imagePaths = [
      '/kid1.jpeg',
      '/kid2.jpeg',
      '/kid3.jpeg',
      '/kid4.jpeg',
      '/kid5.jpeg', // Add more if needed up to 6
      '/kid6.jpeg',
    ];

    const finalOutput: TooltipItem[] = selectedPeers.map((user, index) => {
       // Use modulo operator for cycling images, ensure index stays within bounds
      const imageIndex = index % imagePaths.length;
      const profileImageUrl = imagePaths[imageIndex];

      return {
        id: user.id,
        name: user.full_name,
        // Format designation string as before
        designation: `Tasks: ${user.overall_task_percentage.toFixed(1)}%, Pace: ${user.pace}, Events: ${user.events_attended}`,
        image: profileImageUrl,
      };
    });

     console.log(`Returning ${finalOutput.length} selected peers.`);
    return NextResponse.json(finalOutput);

  } catch (error) {
    console.error('Internal Server Error in API route:', error);
    // Log the specific error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}