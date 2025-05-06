// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export async function POST(request: Request) {
  const { feedbackType, feedbackText } = await request.json();

  if (!feedbackType || !feedbackText) {
    return NextResponse.json(
      { error: "feedbackType and feedbackText are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("feedback").insert([
    {
      feedback_type: feedbackType,
      feedback_text: feedbackText,
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
