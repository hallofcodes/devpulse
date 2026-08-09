import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Fetches user's coding stats along with their project list.
 */
export async function getExistingUserStats(userId: string) {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    include: { user: { select: { userProjects: true } } },
  });
  return stats;
}

/**
 * Updates the WakaTime API key stored on the user's profile.
 * Throws Prisma P2002 if the key is already used by another account.
 */
export async function updateProfileWakatimeApiKey(
  userId: string,
  apiKey: string,
) {
  return prisma.user.update({
    where: { id: userId },
    data: { wakatimeApiKey: apiKey },
  });
}

/**
 * Upserts the user's WakaTime stats row (one row per user).
 */
export async function upsertUserStats(
  payload: Prisma.UserStatsUncheckedCreateInput,
) {
  return prisma.userStats.upsert({
    where: { userId: payload.userId },
    create: payload,
    update: payload,
  });
}

/**
 * Upserts the user's WakaTime projects row (one row per user).
 */
export async function upsertUserProjects(
  payload: Prisma.UserProjectsUncheckedCreateInput,
) {
  return prisma.userProjects.upsert({
    where: { userId: payload.userId },
    create: payload,
    update: payload,
  });
}

/**
 * Upserts a daily dashboard snapshot for the given user and date.
 */
export async function upsertUserDashboardSnapshot(
  payload: Prisma.UserDashboardSnapshotUncheckedCreateInput,
) {
  return prisma.userDashboardSnapshot.upsert({
    where: {
      userId_snapshotDate: {
        userId: payload.userId,
        snapshotDate: payload.snapshotDate as Date,
      },
    },
    create: payload,
    update: payload,
  });
}
