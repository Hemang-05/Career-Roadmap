//app\api\proofs\delete\route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { clerk_id, user_id, proof_id } = await req.json();
    if (!proof_id) return NextResponse.json({ error: 'Missing proof_id' }, { status: 400 });

    let dbUserId = user_id ?? null;
    if (!dbUserId) {
      if (!clerk_id) return NextResponse.json({ error: 'Missing clerk_id or user_id' }, { status: 400 });
      const { data: u, error: ue } = await supabase.from('users').select('id').eq('clerk_id', clerk_id).single();
      if (ue || !u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      dbUserId = u.id;
    }

    // delete only if owner
    const { error } = await supabase.from('proofs').delete().eq('id', proof_id).eq('user_id', dbUserId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error /api/proofs/delete:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}