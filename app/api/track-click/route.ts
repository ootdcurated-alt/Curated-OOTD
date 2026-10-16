import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outfit_id, item_id, target_url } = body;

    if (!target_url) {
      return NextResponse.json({ error: "target_url is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Log click event into analytics/clicks table if exists
    await supabase.from("click_events").insert({
      outfit_id: outfit_id || null,
      item_id: item_id || null,
      target_url,
      clicked_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, redirect_url: target_url });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
