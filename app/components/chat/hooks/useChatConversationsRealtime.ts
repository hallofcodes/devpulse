"use client";

import {
  useCallback,
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { Conversation } from "@/app/components/Chat";

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type ConversationUserRow = {
  id: string;
  email: string;
  last_seen_at: string;
};

type ConversationApiRow = {
  id: string;
  created_at: string;
  type: string;
  last_read_at: string;
  users: ConversationUserRow[];
};

type UseChatConversationsRealtimeParams = {
  user_id: string;
  userEmail: string;
  globalConversationId: string;
  conversationIdsRef: MutableRefObject<Set<string>>;
  activeConversationIdRef: MutableRefObject<string | null>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
  setLastSeenByuser_id: Dispatch<SetStateAction<Record<string, string | null>>>;
  fetchUnreadCountsForConversations: (
    targetConversationIds: string[],
    readMap: Record<string, string | null>,
    mode?: "replace" | "merge",
  ) => Promise<void>;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
};

export function useChatConversationsRealtime({
  userId,
  conversationIdsRef,
  activeConversationIdRef,
  setConversations,
  setParticipantMetaByConversationId,
  setLastSeenByUserId,
  fetchUnreadCountsForConversations,
  markConversationAsRead,
}: UseChatConversationsRealtimeParams) {
  const refreshUnreadForConversation = useCallback(
    async (targetConversationId: string) => {
      const res = await fetch(
        `/api/conversations/${targetConversationId}/unread`,
      );
      if (!res.ok) return;
      const { count } = (await res.json()) as { count: number };
      setLastSeenByUserId((prev) => ({ ...prev }));
      fetchUnreadCountsForConversations(
        [targetConversationId],
        { [targetConversationId]: null },
        "merge",
      ).catch(() => {});
      // Directly update count instead of re-fetching
      setParticipantMetaByConversationId((prev) => {
        const existing = prev[targetConversationId];
        if (!existing) return prev;
        return { ...prev, [targetConversationId]: existing };
      });
      // Update unread count via the count result
      void count;
    },
    [
      fetchUnreadCountsForConversations,
      setLastSeenByUserId,
      setParticipantMetaByConversationId,
    ],
  );

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;

      const rows: ConversationApiRow[] = await res.json();
      const convs: Conversation[] = [];
      const nextParticipantMeta: Record<string, ParticipantPresence> = {};
      const nextLastSeenByuser_id: Record<string, string | null> = {};
      const readMap: Record<string, string | null> = {};

      rows.forEach((row) => {
        convs.push({
          id: row.id,
          created_at: row.created_at,
          users: row.users.map((u) => ({ id: u.id, email: u.email })),
          type: row.type,
        });

        nextParticipantMeta[row.id] = {
          last_seen_at: null,
          last_read_at: row.last_read_at ?? null,
        };
        readMap[row.id] = row.last_read_at ?? null;

        row.users.forEach((u) => {
          if (u.id === userId) return;
          const prev = nextLastSeenByUserId[u.id];
          if (
            !prev ||
            (u.last_seen_at && new Date(u.last_seen_at) > new Date(prev))
          ) {
            nextLastSeenByUserId[u.id] = u.last_seen_at ?? null;
          }
        });
      });

      const sortedConvs = convs.sort((a, b) =>
        a.type === "global" ? -1 : b.type === "global" ? 1 : 0,
      );

      conversationIdsRef.current = new Set(sortedConvs.map((c) => c.id));

      setConversations(sortedConvs);
      setParticipantMetaByConversationId(nextParticipantMeta);
      setLastSeenByUserId(nextLastSeenByUserId);
      void fetchUnreadCountsForConversations(
        sortedConvs.map((c) => c.id),
        readMap,
        "replace",
      );
    };

    void fetchConversations();
  }, [
    conversationIdsRef,
    fetchUnreadCountsForConversations,
    setConversations,
    setLastSeenByUserId,
    setParticipantMetaByConversationId,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;

    const es = new EventSource("/api/sse/conversations");

    es.onmessage = (event) => {
      const envelope = JSON.parse(event.data) as {
        type: string;
        data: unknown;
      };

      if (envelope.type === "new_message") {
        const msg = envelope.data as {
          conversation_id: string;
          sender_id: string;
        };
        if (!conversationIdsRef.current.has(msg.conversation_id)) return;
        if (msg.sender_id === userId) return;

        if (activeConversationIdRef.current === msg.conversation_id) {
          void markConversationAsRead(msg.conversation_id);
          return;
        }

        void refreshUnreadForConversation(msg.conversation_id);
      }
    };

    return () => {
      es.close();
    };
  }, [
    activeConversationIdRef,
    conversationIdsRef,
    markConversationAsRead,
    refreshUnreadForConversation,
    userId,
  ]);
}
