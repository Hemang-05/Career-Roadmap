// /api/save-career-info/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export async function POST(request: Request) {
  try {
    // Parse the JSON payload
    const {
      clerk_id,
      desired_career,
      residing_country,
      spending_capacity,
      move_abroad,
      preferred_abroad_country,
      parent_email,
      difficulty,
      // NEW FIELDS
      educational_stage,
      school_grade,
      school_stream,
      college_year,
      college_degree,
      practical_experience,
      academic_strengths,
      extracurricular_activities,
      industry_knowledge_level,
      preferred_learning_style,
      role_model_influences,
      cultural_family_expectations,
      mentorship_and_network_status,
      preferred_language,
      preferred_work_environment,
      long_term_aspirations,
      roadmap
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

    // Build the object to upsert (UPDATED FOR NEW FIELDS)
    const upsertObj = {
      user_id,
      desired_career,
      residing_country: residing_country || null,
      spending_capacity: spending_capacity ? parseFloat(spending_capacity) : null,
      move_abroad: typeof move_abroad === 'boolean' ? move_abroad : false,
      preferred_abroad_country: preferred_abroad_country || null,
      parent_email: parent_email || null,
      difficulty: difficulty || null,
      updated_at: new Date().toISOString(),
      // NEW FIELDS
      educational_stage: educational_stage || null,
      school_grade: school_grade || null,
      school_stream: school_stream || null,
      college_year: college_year || null,
      college_degree: college_degree || null,
      practical_experience: practical_experience || null,
      academic_strengths: academic_strengths || null,
      extracurricular_activities: extracurricular_activities || null,
      industry_knowledge_level: industry_knowledge_level || null,
      preferred_learning_style: preferred_learning_style || null,
      role_model_influences: role_model_influences || null,
      cultural_family_expectations: cultural_family_expectations || null,
      mentorship_and_network_status: mentorship_and_network_status || null,
      preferred_language: preferred_language || null,
      preferred_work_environment: preferred_work_environment || null,
      long_term_aspirations: long_term_aspirations || null,
      roadmap: null
    };

    // Upsert the career_info record into Supabase
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
