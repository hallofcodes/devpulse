import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flexes = await prisma.userFlex.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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

  if (!project_name?.trim()) {
    return NextResponse.json(
      { error: "Project name is required." },
      { status: 400 },
    );
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const flex = await prisma.userFlex.create({
    data: {
      userId: session.user.id,
      userEmail: session.user.email,
      projectName: project_name.trim(),
      projectDescription: project_description ?? "",
      projectUrl: project_url ?? "",
      projectTime: project_time ?? "",
      isOpenSource: is_open_source ?? false,
      openSourceUrl: is_open_source ? (open_source_url ?? "") : "",
      expiresAt,
    },
  });

  return NextResponse.json(flex, { status: 201 });
}
