import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Fetches user's coding stats along with their project list.
 */
export async function getExistingUserStats(user_id: string) {
  const stats = await prisma.userStats.findUnique({
    where: { user_id },
    include: { user: { select: { user_projects: true } } },
  });

  return {
    ...stats,
    projects: stats?.user.user_projects?.projects,
  };
}

/**
 * Updates the WakaTime API key stored on the user's profile.
 * Throws Prisma P2002 if the key is already used by another account.
 */
export async function updateProfileWakatimeApiKey(
  user_id: string,
  apiKey: string,
) {
  return prisma.user.update({
    where: { id: user_id },
    data: { wakatime_api_key: apiKey },
  });
}

/**
 * Upserts the user's WakaTime stats row (one row per user).
 */
export async function upsertUserStats(
  payload: Prisma.UserStatsUncheckedCreateInput,
) {
  return prisma.userStats.upsert({
    where: { user_id: payload.user_id },
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
    where: { user_id: payload.user_id },
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
      user_id_snapshot_date: {
        user_id: payload.user_id,
        snapshot_date: payload.snapshot_date as Date,
      },
    },
    create: payload,
    update: payload,
  });
}
