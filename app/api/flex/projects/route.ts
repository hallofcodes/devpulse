import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProjects = await prisma.userProjects.findUnique({
    where: { userId: session.user.id },
    select: { projects: true },
  });

  return NextResponse.json({ projects: userProjects?.projects ?? [] });
}
