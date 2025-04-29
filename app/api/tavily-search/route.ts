// app/api/tavily-search/route.ts


import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';
import { supabase } from '@/utils/supabase/supabaseClient';

export async function POST(request: Request) {
  console.log('Received POST request to /api/tavily-search');
  try {
    const { query, clerk_id } = await request.json();
    console.log('Parsed query and clerk_id:', query, clerk_id);
    
    if (!query) {
      console.error('Missing search query');
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }
    if (!clerk_id) {
      console.error('Missing clerk_id');
      return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 });
    }
    
    // Look up the user record in the "users" table using the clerk_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();
    if (userError || !userRecord) {
      console.error('Error fetching user record:', userError);
      return NextResponse.json({ error: 'User record not found' }, { status: 500 });
    }
    const user_id = userRecord.id;
    console.log('Found user id (UUID):', user_id);
    
    // Initialize Tavily with your API key
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    console.log('Initialized Tavily client');
    
    // Call the search method with the query and an empty options object
    const response = await tvly.search(query);
    console.log('Tavily API raw response:', response);
    
    if (!response.results || response.results.length === 0) {
      console.error('No results returned from Tavily API');
      throw new Error('No results returned from Tavily API');
    }
    
    // Use the current month since the response doesn't include a date
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    // Instead of mapping individual fields, store the entire results array as JSON
    const eventsJson = response.results;
    console.log('Storing event JSON:', eventsJson);
    
    // Insert the data into the events table
    const { data: storedData, error: insertError } = await supabase
      .from('events')
      .insert([
        {
          user_id,
          event_month: currentMonth,
          event_json: eventsJson,
        }
      ]);
    if (insertError) {
      console.error('Error storing events in Supabase:', insertError);
      return NextResponse.json({ error: 'Error storing events', details: insertError.message }, { status: 500 });
    }
    console.log('Events stored successfully:', storedData);
    
    return NextResponse.json({ success: true, storedData, events: eventsJson });
  } catch (err: any) {
    console.error('Error in POST /api/tavily-search:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message || err },
      { status: 500 }
    );
  }
}
