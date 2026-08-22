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

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type UseChatPresenceParams = {
  user_id: string;
  onlineTimeoutMs: number;
  maxPresenceFutureSkewMs: number;
  presenceHeartbeatMs: number;
  readReceiptThrottleMs: number;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
  setUnreadCountByConversationId: Dispatch<
    SetStateAction<Record<string, number>>
  >;
  lastReadSyncAtRef: MutableRefObject<Record<string, number>>;
};

export function useChatPresence({
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
        if (mode === "replace") setUnreadCountByConversationId({});
        return;
      }

      const countEntries = await Promise.all(
        targetConversationIds.map(async (id) => {
          const res = await fetch(`/api/conversations/${id}/unread`);
          if (!res.ok) return [id, 0] as const;
          const { count } = (await res.json()) as { count: number };
          return [id, count] as const;
        }),
      );

      const nextCounts = Object.fromEntries(countEntries);
      setUnreadCountByConversationId((prev) =>
        mode === "replace" ? nextCounts : { ...prev, ...nextCounts },
      );

      void readMap;
    },
    [setUnreadCountByConversationId],
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
      if (now - lastSyncAt < readReceiptThrottleMs) return;
      lastReadSyncAtRef.current[targetConversationId] = now;

      await fetch(`/api/conversations/${targetConversationId}/presence`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markRead: true }),
      }).catch(() => {});
    },
    [
      lastReadSyncAtRef,
      readReceiptThrottleMs,
      setParticipantMetaByConversationId,
      setUnreadCountByConversationId,
      userId,
    ],
  );

  const pingPresence = useCallback(async () => {
    if (!userId) return;
    await fetch("/api/presence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  }, [userId]);

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
    Object.entries(lastSeenByUserId).forEach(([id, lastSeenAt]) => {
      if (!lastSeenAt) {
        next[id] = false;
        return;
      }
      const seenAt = new Date(lastSeenAt).getTime();
      const ageMs = presenceNow - seenAt;
      next[id] =
        Number.isFinite(seenAt) &&
        ageMs >= -maxPresenceFutureSkewMs &&
        ageMs <= onlineTimeoutMs;
    });
    return next;
  }, [lastSeenByUserId, maxPresenceFutureSkewMs, onlineTimeoutMs, presenceNow]);

  return {
    setLastSeenByUserId,
    onlineByUserId,
    fetchUnreadCountsForConversations,
    markConversationAsRead,
  };
}
