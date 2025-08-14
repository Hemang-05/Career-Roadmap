//app\api\proofs\add\route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerk_id, user_id, url, type, skill_name, roadmap_year_index, phase_index, milestone_index, task_index } = body || {};

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Resolve DB user id from clerk_id if provided
    let dbUserId = user_id ?? null;
    if (!dbUserId) {
      if (!clerk_id) return NextResponse.json({ error: 'Missing clerk_id or user_id' }, { status: 400 });

      const { data: u, error: ue } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerk_id)
        .single();

      if (ue || !u) {
        return NextResponse.json({ error: 'User record not found' }, { status: 404 });
      }
      dbUserId = u.id;
    }

    // Insert proof
    const insertObj: any = {
      user_id: dbUserId,
      url,
      type: type || null,
      skill_name: skill_name || null,
      roadmap_year_index: roadmap_year_index ?? null,
      phase_index: phase_index ?? null,
      milestone_index: milestone_index ?? null,
      task_index: task_index ?? null,
    };

    const { data, error } = await supabase.from('proofs').insert(insertObj).select().single();

    if (error) {
      // unique constraint violation
      const message = (error?.message || '').toLowerCase();
      if (message.includes('duplicate') || message.includes('unique')) {
        return NextResponse.json({ error: 'Duplicate URL for this user' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, proof: data });
  } catch (err: any) {
    console.error('Error /api/proofs/add:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message || err }, { status: 500 });
  }
}