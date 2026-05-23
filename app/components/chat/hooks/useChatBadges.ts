"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import { type BadgeInfo, getBadgeInfoFromHours } from "@/app/utils/badge";

type ConversationLike = {
  users: { id: string }[];
};

type UseChatBadgesParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  conversations: ConversationLike[];
};

export function useChatBadges({
  supabase,
  userId,
  conversations,
}: UseChatBadgesParams) {
  const [badgesByUserId, setBadgesByUserId] = useState<Record<string, BadgeInfo>>(
    {},
  );
  const badgeCacheRef = useRef<Record<string, BadgeInfo>>({});

  useEffect(() => {
    const fetchBadgesForParticipants = async () => {
      if (!conversations.length) return;

      const participantIds = new Set<string>();
      conversations.forEach((conversation) => {
        conversation.users.forEach((user) => {
          if (user.id) participantIds.add(user.id);
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

      const { data } = await supabase
        .from("top_user_stats")
        .select("user_id, total_seconds")
        .in("user_id", missingIds);

      if (!data) return;

      const next: Record<string, BadgeInfo> = {};
      for (const row of data) {
        if (!row.user_id || row.total_seconds === null) continue;
        const hours = Math.round((row.total_seconds || 0) / 3600);
        next[row.user_id] = getBadgeInfoFromHours(hours);
      }

      if (Object.keys(next).length === 0) return;

      badgeCacheRef.current = { ...badgeCacheRef.current, ...next };
      setBadgesByUserId((prev) => ({ ...prev, ...next }));
    };

    void fetchBadgesForParticipants();
  }, [conversations, supabase, userId]);

  return {
    badgesByUserId,
  };
}