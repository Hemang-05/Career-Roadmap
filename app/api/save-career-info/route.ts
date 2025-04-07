// /api/save-career-info/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export async function POST(request: Request) {
  try {
    // Parse the JSON payload
    const {
      clerk_id,
      desired_career,            // For known branch: desired career; for unknown: paragraph response
      residing_country,          // string
      spending_capacity,         // string (to be parsed as number)
      current_class,             // string
      move_abroad,               // boolean
      preferred_abroad_country,  // string (nullable)
      previous_experience,       // string (nullable)
      parent_email,               // string; (nullable)
      form_filled,               // boolean indicating if form is filled
      college_student,             //bool
      difficulty,                   //text 
      roadmap                    //null
    } = await request.json();

    // Validate required fields
    if (!clerk_id || !desired_career) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Look up the corresponding Supabase user record by clerk_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 500 });
    }

    const user_id = userRecord.id;

    // Build the object to upsert.
    const upsertObj = {
      user_id,
      desired_career, // from the client; same value goes to career_tag
      residing_country: residing_country || null,
      spending_capacity: spending_capacity ? parseFloat(spending_capacity) : null,
      current_class: current_class || null,
      move_abroad: typeof move_abroad === 'boolean' ? move_abroad : false,
      preferred_abroad_country: preferred_abroad_country || null,
      previous_experience: previous_experience || null,
      parent_email:parent_email || null,
      updated_at: new Date().toISOString(),
      college_student: typeof college_student === 'boolean' ? college_student : false,
      form_filled: typeof form_filled === 'boolean' ? form_filled : false,
      difficulty: difficulty || null,
      roadmap: null
    };

    // Upsert the career_info record into Supabase.
    // This will insert a new record or update the existing record based on the unique constraint on user_id.
    const { data, error } = await supabase
      .from('career_info')
      .upsert(upsertObj, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving career info:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/save-career-info:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message || err },
      { status: 500 }
    );
  }
}
