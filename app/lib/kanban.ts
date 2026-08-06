import { prisma } from "@/app/lib/prisma";

type JsonRecord = Record<string, unknown>;

interface WakaTimeProject {
  name: string;
  total_seconds: number;
}

interface KanbanProjectRow {
  id: string;
  name: string;
  description: string | null;
  wakatime_project_name: string | null;
  color: string | null;
  created_at: Date;
}

interface KanbanBoardRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
}

interface KanbanColumnRow {
  id: string;
  board_id: string;
  title: string;
  position: number;
}

interface KanbanIssueRow {
  id: string;
  column_id: string;
  issue_key: string;
  title: string;
  tag: string | null;
  type: string;
  priority: string;
  position: number;
  created_at: Date;
}

function normalizeWakaTimeProjects(value: unknown): WakaTimeProject[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const item = entry as JsonRecord;
      const name = typeof item.name === "string" ? item.name : null;
      if (!name) return null;

      const totalSeconds =
        typeof item.total_seconds === "number" ? item.total_seconds : 0;

      return { name, total_seconds: totalSeconds };
    })
    .filter((entry): entry is WakaTimeProject => entry !== null)
    .sort((a, b) => b.total_seconds - a.total_seconds);
}

export async function getKanbanProjectAccess(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT p.id
    FROM projects p
    WHERE p.id = ${projectId}
      AND (p.user_id = ${userId} OR p.user_id IS NULL)
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function getColumnAccess(
  userId: string,
  columnId: string,
): Promise<
  | {
      columnId: string;
      projectId: string;
      projectName: string;
    }
  | null
> {
  const rows = await prisma.$queryRaw<
    Array<{
      columnId: string;
      projectId: string;
      projectName: string;
    }>
  >`
    SELECT
      c.id AS columnId,
      p.id AS projectId,
      p.name AS projectName
    FROM columns c
    INNER JOIN boards b ON b.id = c.board_id
    INNER JOIN projects p ON p.id = b.project_id
    WHERE c.id = ${columnId}
      AND (p.user_id = ${userId} OR p.user_id IS NULL)
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getIssueAccess(
  userId: string,
  issueId: string,
): Promise<
  | {
      issueId: string;
      projectId: string;
    }
  | null
> {
  const rows = await prisma.$queryRaw<
    Array<{
      issueId: string;
      projectId: string;
    }>
  >`
    SELECT
      i.id AS issueId,
      p.id AS projectId
    FROM issues i
    INNER JOIN columns c ON c.id = i.column_id
    INNER JOIN boards b ON b.id = c.board_id
    INNER JOIN projects p ON p.id = b.project_id
    WHERE i.id = ${issueId}
      AND (p.user_id = ${userId} OR p.user_id IS NULL)
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getNextIssueKey(projectId: string, projectName: string) {
  const rows = await prisma.$queryRaw<Array<{ issueCount: bigint | number }>>`
    SELECT COUNT(*) AS issueCount
    FROM issues i
    INNER JOIN columns c ON c.id = i.column_id
    INNER JOIN boards b ON b.id = c.board_id
    WHERE b.project_id = ${projectId}
  `;

  const rawCount = rows[0]?.issueCount ?? 0;
  const issueCount =
    typeof rawCount === "bigint" ? Number(rawCount) : Number(rawCount);

  const prefix = projectName
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "DP";

  return `${prefix}-${String(issueCount + 1).padStart(3, "0")}`;
}

export async function getKanbanData(userId: string) {
  const [projectRows, boardRows, columnRows, issueRows, userProjects] =
    await Promise.all([
      prisma.$queryRaw<KanbanProjectRow[]>`
        SELECT
          p.id,
          p.name,
          p.description,
          p.wakatime_project_name,
          p.color,
          p.created_at
        FROM projects p
        WHERE p.user_id = ${userId} OR p.user_id IS NULL
        ORDER BY p.created_at ASC
      `,
      prisma.$queryRaw<KanbanBoardRow[]>`
        SELECT
          b.id,
          b.project_id,
          b.title,
          b.description
        FROM boards b
        INNER JOIN projects p ON p.id = b.project_id
        WHERE p.user_id = ${userId} OR p.user_id IS NULL
        ORDER BY b.created_at ASC
      `,
      prisma.$queryRaw<KanbanColumnRow[]>`
        SELECT
          c.id,
          c.board_id,
          c.title,
          c.position
        FROM columns c
        INNER JOIN boards b ON b.id = c.board_id
        INNER JOIN projects p ON p.id = b.project_id
        WHERE p.user_id = ${userId} OR p.user_id IS NULL
        ORDER BY c.position ASC, c.created_at ASC
      `,
      prisma.$queryRaw<KanbanIssueRow[]>`
        SELECT
          i.id,
          i.column_id,
          i.issue_key,
          i.title,
          i.tag,
          i.type,
          i.priority,
          i.position,
          i.created_at
        FROM issues i
        INNER JOIN columns c ON c.id = i.column_id
        INNER JOIN boards b ON b.id = c.board_id
        INNER JOIN projects p ON p.id = b.project_id
        WHERE p.user_id = ${userId} OR p.user_id IS NULL
        ORDER BY i.position ASC, i.created_at ASC
      `,
      prisma.userProjects.findUnique({
        where: { userId },
        select: { projects: true },
      }),
    ]);

  const projects = projectRows.map((project) => {
    const boards = boardRows.filter((board) => board.project_id === project.id);
    const boardIds = new Set(boards.map((board) => board.id));
    const columns = columnRows.filter((column) => boardIds.has(column.board_id));
    const columnIds = new Set(columns.map((column) => column.id));
    const issues = issueRows.filter((issue) => columnIds.has(issue.column_id));
    const doneColumnIds = new Set(
      columns
        .filter((column) => /done|complete/i.test(column.title))
        .map((column) => column.id),
    );
    const linkedWaka = normalizeWakaTimeProjects(userProjects?.projects).find(
      (wakaProject) => wakaProject.name === project.wakatime_project_name,
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      wakatime_project_name: project.wakatime_project_name ?? "",
      color: project.color ?? "indigo",
      created_at: project.created_at.toISOString(),
      board_count: boards.length,
      column_count: columns.length,
      issue_count: issues.length,
      completed_issue_count: issues.filter((issue) =>
        doneColumnIds.has(issue.column_id),
      ).length,
      total_tracked_seconds: linkedWaka?.total_seconds ?? 0,
    };
  });

  return {
    projects,
    boards: boardRows.map((board) => ({
      id: board.id,
      project_id: board.project_id,
      title: board.title,
      description: board.description ?? "",
    })),
    columns: columnRows.map((column) => ({
      id: column.id,
      board_id: column.board_id,
      title: column.title,
      position: column.position,
    })),
    issues: issueRows.map((issue) => ({
      id: issue.id,
      column_id: issue.column_id,
      issue_key: issue.issue_key,
      title: issue.title,
      tag: issue.tag ?? "",
      type: issue.type.toLowerCase(),
      priority: issue.priority.toLowerCase(),
      position: issue.position,
      created_at: issue.created_at.toISOString(),
    })),
    wakatime_projects: normalizeWakaTimeProjects(userProjects?.projects),
  };
}
