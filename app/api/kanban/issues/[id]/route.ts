import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { emitter } from "@/app/lib/emitter";
import { getColumnAccess, getIssueAccess } from "@/app/lib/kanban";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { column_id, position } = body as {
    column_id?: string;
    position?: number;
  };

  const issueAccess = await getIssueAccess(session.user.id, id);
  if (!issueAccess) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  if (column_id !== undefined) {
    const columnAccess = await getColumnAccess(session.user.id, column_id);
    if (!columnAccess || columnAccess.projectId !== issueAccess.projectId) {
      return NextResponse.json(
        { error: "Cannot move issue to that column." },
        { status: 400 },
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (column_id !== undefined) data.columnId = column_id;
  if (position !== undefined) data.position = position;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const issue = await prisma.issue.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  const payload = {
    type: "issue_updated",
    data: { id: issue.id, column_id: issue.columnId, position: issue.position },
  };
  emitter.emit("kanban", payload);

  return NextResponse.json({
    id: issue.id,
    column_id: issue.columnId,
    position: issue.position,
  });
}
