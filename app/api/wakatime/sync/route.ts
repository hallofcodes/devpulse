import { NextResponse } from "next/server";
import {
  saveWakatimeApiKey,
  syncWakatimeData,
  validateWakatimeApiKey,
} from "@/app/lib/wakatime/sync";
import { auth } from "@/app/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncWakatimeData({
    userId: session.user.id,
    incomingApiKey: "",
    storedApiKey: session.user.wakatime_api_key ?? undefined,
  });

  if (!result.success && result.status !== 200) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    success: result.success,
    data: result.data,
    error: result.error,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { api_key, save_only } = await req.json();

  const validationError = validateWakatimeApiKey(api_key);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (save_only) {
    const result = await saveWakatimeApiKey({
      userId: session.user.id,
      apiKey: api_key,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, data: null, error: null });
  }

  const result = await syncWakatimeData({
    userId: session.user.id,
    incomingApiKey: api_key,
    storedApiKey: session.user.wakatime_api_key,
  });

  if (!result.success && result.status !== 200) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    success: result.success,
    data: result.data,
    error: result.error,
  });
}
