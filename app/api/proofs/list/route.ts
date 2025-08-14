// //app\api\proofs\list\route.ts
// import { NextResponse } from 'next/server';
// import { supabase } from '@/utils/supabase/supabaseClient';

// export const runtime = 'nodejs';

// export async function GET(req: Request) {
//   try {
//     // Log clean endpoint without parameters
//     if (process.env.NODE_ENV === 'development') {
//       const url = new URL(req.url);
//       console.log(`GET ${url.pathname}`); // Only log the path, not parameters
//     }

//     const url = new URL(req.url);
//     const clerk_id = url.searchParams.get('clerk_id');
//     const user_id = url.searchParams.get('user_id');

//     let dbUserId = user_id ?? null;
//     if (!dbUserId) {
//       if (!clerk_id) return NextResponse.json({ error: 'Missing clerk_id or user_id' }, { status: 400 });
//       const { data: u, error: ue } = await supabase.from('users').select('id').eq('clerk_id', clerk_id).single();
//       if (ue || !u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
//       dbUserId = u.id;
//     }

//     // Optional filters
//     const yearIdx = url.searchParams.get('yearIndex');
//     const phaseIdx = url.searchParams.get('phaseIndex');

//     let query = supabase.from('proofs').select('*').eq('user_id', dbUserId).order('created_at', { ascending: false });

//     if (yearIdx !== null) query = query.eq('roadmap_year_index', parseInt(yearIdx));
//     if (phaseIdx !== null) query = query.eq('phase_index', parseInt(phaseIdx));

//     const { data, error } = await query;
//     if (error) return NextResponse.json({ error: error.message }, { status: 500 });

//     return NextResponse.json({ success: true, proofs: data });
//   } catch (err: any) {
//     console.error('Error /api/proofs/list:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


//app\api\proofs\list\route.ts
//app\api\proofs\list\route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { clerk_id, yearIndex, phaseIndex } = await request.json();
    
    if (!clerk_id) {
      return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 });
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

    // Build query for proofs belonging to this user
    let query = supabase
      .from('proofs')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    // Apply optional filters if provided
    if (yearIndex !== null && yearIndex !== undefined) {
      query = query.eq('roadmap_year_index', yearIndex);
    }
    
    if (phaseIndex !== null && phaseIndex !== undefined) {
      query = query.eq('phase_index', phaseIndex);
    }

    // Execute query to fetch proofs for the user with optional filters
    const { data: proofs, error } = await query;

    if (error) {
      console.error('Error fetching proofs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, proofs });
    
  } catch (err: any) {
    console.error('Error in POST /api/proofs/list:', err);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: err.message || err 
    }, { status: 500 });
  }
}