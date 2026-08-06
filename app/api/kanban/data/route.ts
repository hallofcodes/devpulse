import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { getKanbanData } from "@/app/lib/kanban";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getKanbanData(session.user.id));
}
