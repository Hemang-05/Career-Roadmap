// app/api/clerk-webhook/route.ts
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabase } from '@/utils/supabase/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const rawBody = await request.arrayBuffer();
  const rawBodyBuffer = Buffer.from(rawBody);

  let body;
  try {
    body = JSON.parse(rawBodyBuffer.toString());
  } catch (err) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const svixId = request.headers.get('svix-id') || '';
  const svixTimestamp = request.headers.get('svix-timestamp') || '';
  const svixSignature = request.headers.get('svix-signature') || '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ message: 'Missing Svix headers' }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  const wh = new Webhook(webhookSecret);

  try {
    wh.verify(rawBodyBuffer, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = body;

  if (type === 'user.created' || type === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name } = data;
    const primaryEmail = email_addresses[0]?.email_address;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    const { data: userData, error } = await supabase
      .from('users')
      .upsert({
        clerk_id: clerkId, // use clerk_id column to store the id
        email: primaryEmail,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User synced to Supabase', userData });
  }

  return NextResponse.json({ message: 'Webhook received' });
}
