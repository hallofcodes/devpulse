import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return NextResponse.json(data);
}
