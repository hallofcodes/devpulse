import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getKanbanData } from "@/app/lib/kanban";

const DEFAULT_COLUMNS = ["Backlog", "In Progress", "Done"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getKanbanData(session.user.id);
  return NextResponse.json({
    projects: data.projects,
    wakatime_projects: data.wakatime_projects,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    name?: string;
    description?: string;
    wakatimeProjectName?: string;
    color?: string;
  };

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Project name is required." },
      { status: 400 },
    );
  }

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM projects
    WHERE user_id = ${session.user.id}
      AND LOWER(name) = LOWER(${name})
    LIMIT 1
  `;

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "A Kanban project with that name already exists." },
      { status: 409 },
    );
  }

  const projectId = crypto.randomUUID();
  const boardId = crypto.randomUUID();
  const safeDescription = body.description?.trim() || null;
  const safeWakaName = body.wakatimeProjectName?.trim() || null;
  const safeColor = body.color?.trim() || "blue";
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO projects (
        id,
        user_id,
        name,
        description,
        wakatime_project_name,
        color,
        created_at
      ) VALUES (
        ${projectId},
        ${session.user.id},
        ${name},
        ${safeDescription},
        ${safeWakaName},
        ${safeColor},
        ${now}
      )
    `;

    await tx.$executeRaw`
      INSERT INTO boards (
        id,
        project_id,
        title,
        description,
        created_at
      ) VALUES (
        ${boardId},
        ${projectId},
        ${`${name} Board`},
        ${safeDescription},
        ${now}
      )
    `;

    for (const [index, columnTitle] of DEFAULT_COLUMNS.entries()) {
      await tx.$executeRaw`
        INSERT INTO columns (
          id,
          board_id,
          title,
          position,
          created_at
        ) VALUES (
          ${crypto.randomUUID()},
          ${boardId},
          ${columnTitle},
          ${index},
          ${now}
        )
      `;
    }
  });

  const data = await getKanbanData(session.user.id);
  const project = data.projects.find((entry) => entry.id === projectId);

  return NextResponse.json(project, { status: 201 });
}
