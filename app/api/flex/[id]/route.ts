import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    project_name,
    project_description,
    project_url,
    project_time,
    is_open_source,
    open_source_url,
  } = body;

  const flex = await prisma.userFlex.updateMany({
    where: { id, userId: session.user.id },
    data: {
      projectName: project_name?.trim(),
      projectDescription: project_description ?? "",
      projectUrl: project_url ?? "",
      projectTime: project_time ?? "",
      isOpenSource: is_open_source ?? false,
      openSourceUrl: is_open_source ? (open_source_url ?? "") : "",
    },
  });

  if (flex.count === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const updated = await prisma.userFlex.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.userFlex.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
