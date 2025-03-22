import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

async function generateRoadmap(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-distill-llama-70b:free",
      messages: [{ role: "user", content: prompt }],
      // response_format: "json",
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0,
    }),
  });
  const data = await response.json();
  console.log('OpenRouter API response:', data);
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from OpenRouter API');
  }
  // Access the generated content from message.content and trim any whitespace
  return data.choices[0].message.content.trim();
}

export async function POST(request: Request) {
  try {
    // Parse the JSON payload sent by the client
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 });
    }

    // Look up the user record in the users table using clerk_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();
    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 500 });
    }
    const user_id = userRecord.id;

    // Fetch the career_info record for that user to get the desired_career value
    const { data: careerInfo, error: careerInfoError } = await supabase
      .from('career_info')
      .select('desired_career')
      .eq('user_id', user_id)
      .single();
    if (careerInfoError || !careerInfo) {
      return NextResponse.json({ error: 'Career info record not found' }, { status: 500 });
    }
    const desiredCareer = careerInfo.desired_career;
    if (!desiredCareer) {
      return NextResponse.json({ error: 'Desired career not found in career_info' }, { status: 400 });
    }

    // Build the prompt using the desired career
    const prompt = `Generate a detailed career roadmap for a student in 9th grade who wants to become a ${desiredCareer}. The roadmap should cover from 9th grade to the end of their undergraduate studies, providing a clear path to achieving their goal. The response must be strictly in JSON format without any additional text, markdown formatting, or backticks, and must exactly match the following structure:

    { "career": "Desired Career", "current_grade": "9th Grade", "vision": "A brief motivational statement of the student's career vision", "roadmap": [ { "phase_name": "Phase Name", "time_period": "Grade Range or Undergraduate Year Range (e.g., Grade 9-10, Undergraduate Year 1-2)", "objective": "Main objective for this phase", "milestones": [ { "name": "Milestone Name", "description": "What needs to be achieved", "tasks": [ { "task_title": "Task Name", "description": "Detailed instructions for the task", "animation_trigger": "Suggested animation type (e.g., confetti, progress bar fill, badge unlock) when task is completed" } ], "resources": ["Resource 1", "Resource 2", ...], "animation_trigger": "Suggested animation type (e.g., milestone celebration) when milestone is completed" } ], "events_to_watch_for": ["Type of event 1", "Type of event 2", ...], "notes": "Brief advice or encouragement for this phase" } ], "additional_tips": ["Tip 1", "Tip 2", ...], "final_thoughts": "A motivational closing message" }
    
    Requirements:
    
    The roadmap must be comprehensive, realistic, and specific, covering key stages from 9th grade through undergraduate studies. Include 4-5 phases, each with 2-3 milestones, and each milestone with 2-3 tasks.
    Use generic phase names (e.g., "Developing the Foundation", "Building Expertise", "Gaining Real-World Experience", "Preparing for Professional Entry") that are applicable to any career.
    Ensure that tasks are concise, actionable, and relevant to pursuing the desired career.
    Provide resources (e.g., books, websites, courses) where applicable to support the tasks.
    Suggest animation triggers for each task and milestone (e.g., "confetti" for completing a task, "milestone celebration" for finishing a phase) to boost student morale.
    List events to watch for in each phase (e.g., "Competitions", "Workshops", "Networking events") that could align with the student's interests.
    Maintain a supportive and motivational tone, with "notes" providing advice and encouragement and "final_thoughts" delivering an inspiring closing message.
    Consider the student's other commitments, making tasks manageable within a school schedule.
    Include global opportunities (e.g., international programs, competitions) where applicable to enhance the student's resume.
    Return only the JSON output, without any additional commentary or formatting.Only give response in json as it is given above, use that layout.`;
    console.log('Prompt sent to OpenRouter API:', prompt);

    // Call the OpenRouter API to generate the roadmap
    const roadmap = await generateRoadmap(prompt);
    console.log('Generated Roadmap:', roadmap);

    // Update the career_info record with the generated roadmap
    const { data, error } = await supabase
      .from('career_info')
      .update({ roadmap, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);
    if (error) {
      console.error('Error updating career_info:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return a success response without fetching the roadmap
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in POST /api/generate-roadmap:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}
