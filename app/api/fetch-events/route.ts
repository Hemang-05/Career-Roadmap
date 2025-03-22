// app/api/fetch-events/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export async function POST(request: Request) {
  try {
    const { clerk_id, month } = await request.json();
    if (!clerk_id || !month) {
      return NextResponse.json({ error: 'Missing clerk_id or month' }, { status: 400 });
    }

    // Look up the Supabase user record using clerk_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();
    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 500 });
    }
    const user_id = userRecord.id;

    // Fetch events for the given month for that user
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user_id)
      .eq('event_month', month);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error('Error in POST /api/fetch-events:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}
