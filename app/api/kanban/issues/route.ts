import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { emitter } from "@/app/lib/emitter";
import { IssueType, IssuePriority } from "@prisma/client";
import { getColumnAccess, getNextIssueKey } from "@/app/lib/kanban";

const TYPE_MAP: Record<string, IssueType> = {
  bug: "BUG",
  feature: "FEATURE",
  chore: "CHORE",
};

const PRIORITY_MAP: Record<string, IssuePriority> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { columnId, title, tag, type, priority, issueKey, position } =
    await req.json();

  if (!columnId || !title?.trim()) {
    return NextResponse.json(
      { error: "columnId and title are required." },
      { status: 400 },
    );
  }

  const columnAccess = await getColumnAccess(session.user.id, columnId);
  if (!columnAccess) {
    return NextResponse.json({ error: "Column not found." }, { status: 404 });
  }

  const resolvedIssueKey =
    typeof issueKey === "string" && issueKey.trim().length > 0
      ? issueKey.trim()
      : await getNextIssueKey(
          columnAccess.projectId,
          columnAccess.projectName,
        );

  const issue = await prisma.issue.create({
    data: {
      columnId,
      issueKey: resolvedIssueKey,
      title: title.trim(),
      tag: tag ?? "",
      type: TYPE_MAP[type] ?? "FEATURE",
      priority: PRIORITY_MAP[priority] ?? "P2",
      position: position ?? 0,
    },
  });

  const payload = {
    id: issue.id,
    column_id: issue.columnId,
    issue_key: issue.issueKey,
    title: issue.title,
    tag: issue.tag ?? "",
    type: issue.type.toLowerCase(),
    priority: issue.priority.toLowerCase(),
    position: issue.position,
    created_at: issue.createdAt.toISOString(),
  };

  emitter.emit("kanban", { type: "issue_created", data: payload });

  return NextResponse.json(payload, { status: 201 });
}
