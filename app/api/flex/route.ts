import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const flexes = await prisma.userFlex.findMany({
    where: {
      user_id: session.user.id,
      expires_at: { gt: now },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(flexes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    project_name,
    project_description,
    project_url,
    project_time,
    is_open_source,
    open_source_url,
  } = body;

  const normalizedProjectName = project_name?.trim();

  if (!normalizedProjectName) {
    return NextResponse.json(
      { error: "Project name is required." },
      { status: 400 },
    );
  }

  const now = new Date();
  const existingActiveFlex = await prisma.userFlex.findFirst({
    where: {
      user_id: session.user.id,
      project_name: normalizedProjectName,
      expires_at: { gt: now },
    },
    select: { id: true },
  });

  if (existingActiveFlex) {
    return NextResponse.json(
      { error: "You already have an active flex for this project." },
      { status: 409 },
    );
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const flex = await prisma.userFlex.create({
    data: {
      user_id: session.user.id,
      user_email: session.user.email,
      project_name: normalizedProjectName,
      project_description: project_description ?? "",
      project_url: project_url ?? "",
      project_time: project_time ?? "",
      is_open_source: is_open_source ?? false,
      open_source_url: is_open_source ? (open_source_url ?? "") : "",
      expires_at: expiresAt,
    },
  });

  return NextResponse.json(flex, { status: 201 });
}
