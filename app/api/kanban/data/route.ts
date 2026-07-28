import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [projects, boards, columns, issues] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.board.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.column.findMany({ orderBy: { position: "asc" } }),
    prisma.issue.findMany({ orderBy: { position: "asc" } }),
  ]);

  return NextResponse.json({
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    boards: boards.map((b) => ({
      id: b.id,
      project_id: b.projectId,
      title: b.title,
      description: b.description ?? "",
    })),
    columns: columns.map((c) => ({
      id: c.id,
      board_id: c.boardId,
      title: c.title,
      position: c.position,
    })),
    issues: issues.map((i) => ({
      id: i.id,
      column_id: i.columnId,
      issue_key: i.issueKey,
      title: i.title,
      tag: i.tag ?? "",
      type: i.type.toLowerCase(),
      priority: i.priority.toLowerCase(),
      position: i.position,
    })),
  });
}
