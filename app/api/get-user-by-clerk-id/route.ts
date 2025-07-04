import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { clerk_id } = await request.json();
    
    if (!clerk_id) {
      return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 });
    }
    
    const client = await clerkClient();
    const user   = await client.users.getUser(clerk_id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      email: user.emailAddresses[0]?.emailAddress,
      name: user.firstName || null
    });
  } catch (error: any) {
    console.error('Error fetching user by clerk_id:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch user'
    }, { status: 500 });
  }
}
