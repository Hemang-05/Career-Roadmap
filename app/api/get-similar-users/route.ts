import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabase/supabaseClient'; // Adjust path as needed

export async function GET(request: NextRequest) {
    console.log("API: get-similar-users called");
    
    const { userId } = getAuth(request);
    console.log("API: clerk userId:", userId);
    
    if (!userId) {
      console.log("API: No userId from Clerk, returning 401");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      console.log("API: Fetching current user from Supabase");
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('id, career_tag')
        .eq('clerk_id', userId)
        .single();
  
      console.log("API: Current user data:", currentUser, "Error:", userError);
  
      if (userError || !currentUser) {
        console.log("API: User not found, returning 404");
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      const { id: currentUserId, career_tag } = currentUser;
      console.log("API: Current user ID:", currentUserId, "Career tag:", career_tag);

    // Fetch user_ids from career_tag table
    const { data: careerTagData, error: careerTagError } = await supabase
      .from('career_tag')
      .select('user_ids')
      .eq('career_tag', career_tag)
      .single();

    if (careerTagError || !careerTagData) {
      return NextResponse.json({ error: 'Career tag not found' }, { status: 404 });
    }

    const userIds = careerTagData.user_ids.filter((id: string) => id !== currentUserId);
    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch clerk_ids and full_name for these user_ids
    const { data: similarUsers, error: similarUsersError } = await supabase
      .from('users')
      .select('id, clerk_id, full_name')
      .in('id', userIds);

    if (similarUsersError) {
      return NextResponse.json({ error: 'Error fetching similar users' }, { status: 500 });
    }

    // Fetch analytics for these user_ids
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('user_id, overall_task_percentage, pace, events_attended')
      .in('user_id', userIds);

    if (analyticsError) {
      return NextResponse.json({ error: 'Error fetching analytics' }, { status: 500 });
    }

    // Create a map of analytics by user_id
    const analyticsMap: { [key: string]: any } = {};
    analyticsData.forEach((analytic: any) => {
      analyticsMap[analytic.user_id] = analytic;
    });

    // Define the image paths for kid1.jpeg to kid4.jpeg
    const imagePaths = [
      '/kid1.jpeg',
      '/kid2.jpeg',
      '/kid3.jpeg',
      '/kid4.jpeg',
    ];

    // Map similar users to the AnimatedTooltip items format with cycling images
    const similarUsersWithData = similarUsers.map((user: any, index: number) => {
      const analytics = analyticsMap[user.id] || {};
      const profileImageUrl = imagePaths[index % imagePaths.length]; // Cycle through images

      return {
        id: user.id,
        name: user.full_name || 'Unknown User',
        designation: `Tasks: ${(analytics.overall_task_percentage || 0).toFixed(1)}%, Pace: ${analytics.pace || 0}, Events: ${analytics.events_attended || 0}`,
        image: profileImageUrl,
      };
    });

    console.log("API: Returning similar users:", similarUsersWithData);
    return NextResponse.json(similarUsersWithData);
  } catch (error) {
    console.error('Error in get-similar-users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}