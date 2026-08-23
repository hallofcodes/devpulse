"use client";

import { useEffect, useRef, useState } from "react";
import { type BadgeInfo, getBadgeInfoFromHours } from "@/app/utils/badge";

type ConversationLike = {
  users: { id: string }[];
};

type UseChatBadgesParams = {
  userId: string;
  conversations: ConversationLike[];
};

export function useChatBadges({ userId, conversations }: UseChatBadgesParams) {
  const [badgesByUserId, setBadgesByUserId] = useState<
    Record<string, BadgeInfo>
  >({});
  const badgeCacheRef = useRef<Record<string, BadgeInfo>>({});

  useEffect(() => {
    const fetchBadgesForParticipants = async () => {
      if (!conversations.length) return;

      const participantIds = new Set<string>();
      conversations.forEach((c) => {
        c.users.forEach((u) => {
          if (u.id) participantIds.add(u.id);
        });
      });
      participantIds.add(userId);

      const ids = Array.from(participantIds).filter(Boolean);
      if (ids.length === 0) return;

      const cached: Record<string, BadgeInfo> = {};
      const missingIds: string[] = [];
      ids.forEach((id) => {
        const hit = badgeCacheRef.current[id];
        if (hit) cached[id] = hit;
        else missingIds.push(id);
      });

      if (Object.keys(cached).length > 0) {
        setBadgesByUserId((prev) => ({ ...prev, ...cached }));
      }

      if (missingIds.length === 0) return;

      const params = missingIds
        .map((id) => `id=${encodeURIComponent(id)}`)
        .join("&");
      const res = await fetch(`/api/users/badges?${params}`);
      if (!res.ok) return;

      const data: { user_id: string; total_seconds: number }[] =
        await res.json();

      const next: Record<string, BadgeInfo> = {};
      for (const row of data) {
        if (!row.user_id) continue;
        const hours = Math.round((row.total_seconds || 0) / 3600);
        next[row.user_id] = getBadgeInfoFromHours(hours);
      }

      if (Object.keys(next).length === 0) return;

      badgeCacheRef.current = { ...badgeCacheRef.current, ...next };
      setBadgesByUserId((prev) => ({ ...prev, ...next }));
    };

    void fetchBadgesForParticipants();
  }, [conversations, userId]);

  return {
    badgesByUserId,
  };
}
