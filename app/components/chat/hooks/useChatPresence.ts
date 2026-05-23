"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type UseChatPresenceParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  onlineTimeoutMs: number;
  maxPresenceFutureSkewMs: number;
  presenceHeartbeatMs: number;
  readReceiptThrottleMs: number;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
  setUnreadCountByConversationId: Dispatch<SetStateAction<Record<string, number>>>;
  lastReadSyncAtRef: MutableRefObject<Record<string, number>>;
};

export function useChatPresence({
  supabase,
  userId,
  onlineTimeoutMs,
  maxPresenceFutureSkewMs,
  presenceHeartbeatMs,
  readReceiptThrottleMs,
  setParticipantMetaByConversationId,
  setUnreadCountByConversationId,
  lastReadSyncAtRef,
}: UseChatPresenceParams) {
  const [lastSeenByUserId, setLastSeenByUserId] = useState<
    Record<string, string | null>
  >({});
  const [presenceNow, setPresenceNow] = useState(() => Date.now());

  const fetchUnreadCountsForConversations = useCallback(
    async (
      targetConversationIds: string[],
      readMap: Record<string, string | null>,
      mode: "replace" | "merge" = "replace",
    ) => {
      if (targetConversationIds.length === 0) {
        if (mode === "replace") {
          setUnreadCountByConversationId({});
        }
        return;
      }

      const countEntries = await Promise.all(
        targetConversationIds.map(async (targetConversationId) => {
          let query = supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", targetConversationId)
            .neq("sender_id", userId);

          const lastReadAt = readMap[targetConversationId];
          if (lastReadAt) {
            query = query.gt("created_at", lastReadAt);
          }

          const { count } = await query;
          return [targetConversationId, count ?? 0] as const;
        }),
      );

      const nextCounts = Object.fromEntries(countEntries);

      setUnreadCountByConversationId((prev) =>
        mode === "replace" ? nextCounts : { ...prev, ...nextCounts },
      );
    },
    [setUnreadCountByConversationId, supabase, userId],
  );

  const markConversationAsRead = useCallback(
    async (targetConversationId: string) => {
      if (!targetConversationId || !userId) return;

      const timestamp = new Date().toISOString();

      setParticipantMetaByConversationId((prev) => ({
        ...prev,
        [targetConversationId]: {
          last_seen_at: timestamp,
          last_read_at: timestamp,
        },
      }));
      setUnreadCountByConversationId((prev) => ({
        ...prev,
        [targetConversationId]: 0,
      }));

      const now = Date.now();
      const lastSyncAt = lastReadSyncAtRef.current[targetConversationId] ?? 0;
      if (now - lastSyncAt < readReceiptThrottleMs) {
        return;
      }
      lastReadSyncAtRef.current[targetConversationId] = now;

      const { error } = await supabase
        .from("conversation_participants")
        .update({
          last_seen_at: timestamp,
          last_read_at: timestamp,
        })
        .eq("conversation_id", targetConversationId)
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to mark conversation as read:", error);
      }
    },
    [
      lastReadSyncAtRef,
      readReceiptThrottleMs,
      setParticipantMetaByConversationId,
      setUnreadCountByConversationId,
      supabase,
      userId,
    ],
  );

  const pingPresence = useCallback(async () => {
    if (!userId) return;

    const timestamp = new Date().toISOString();

    const { error } = await supabase
      .from("conversation_participants")
      .update({ last_seen_at: timestamp })
      .eq("user_id", userId);

    if (error) {
      console.error("Presence ping failed:", error);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    void pingPresence();

    const intervalId = window.setInterval(() => {
      setPresenceNow(Date.now());
      if (document.visibilityState === "visible") {
        void pingPresence();
      }
    }, presenceHeartbeatMs);

    const handleForeground = () => {
      setPresenceNow(Date.now());
      if (document.visibilityState === "visible") {
        void pingPresence();
      }
    };

    window.addEventListener("focus", handleForeground);
    document.addEventListener("visibilitychange", handleForeground);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleForeground);
      document.removeEventListener("visibilitychange", handleForeground);
    };
  }, [pingPresence, presenceHeartbeatMs, userId]);

  const onlineByUserId = useMemo(() => {
    const next: Record<string, boolean> = {};

    Object.entries(lastSeenByUserId).forEach(([targetUserId, lastSeenAt]) => {
      if (!lastSeenAt) {
        next[targetUserId] = false;
        return;
      }

      const seenAt = new Date(lastSeenAt).getTime();
      const ageMs = presenceNow - seenAt;

      next[targetUserId] =
        Number.isFinite(seenAt) &&
        ageMs >= -maxPresenceFutureSkewMs &&
        ageMs <= onlineTimeoutMs;
    });

    return next;
  }, [
    lastSeenByUserId,
    maxPresenceFutureSkewMs,
    onlineTimeoutMs,
    presenceNow,
  ]);

  return {
    setLastSeenByUserId,
    onlineByUserId,
    fetchUnreadCountsForConversations,
    markConversationAsRead,
  };
}
