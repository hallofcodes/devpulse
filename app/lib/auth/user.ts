import { cache } from "react";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return { user: null };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      wakatime_api_key: true,
    },
  });

  return { user };
});
