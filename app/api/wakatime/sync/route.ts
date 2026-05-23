import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import {
  saveWakatimeApiKey,
  syncWakatimeData,
  validateWakatimeApiKey,
} from "@/app/lib/wakatime/sync";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { user, profile } = await getUserWithProfile();
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey") || "";
  const saveOnly =
    searchParams.get("saveOnly") === "1" ||
    searchParams.get("saveOnly") === "true";

  const validationError = validateWakatimeApiKey(apiKey);
  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (saveOnly) {
    const result = await saveWakatimeApiKey({
      supabase,
      userId: user.id,
      apiKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      data: null,
      error: null,
    });
  }

  const result = await syncWakatimeData({
    supabase,
    userId: user.id,
    incomingApiKey: apiKey,
    storedApiKey: profile?.wakatime_api_key,
  });

  if (!result.success && result.status !== 200) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: result.success,
    data: result.data,
    error: result.error,
  });
}
