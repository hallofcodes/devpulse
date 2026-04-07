"use client";

import { useCallback, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import type { Conversation, Message } from "@/app/components/Chat";

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type ConversationUserRow = {
  user_id: string;
  email: string | null;
  last_seen_at: string | null;
};

type ConversationRowWithParticipants = {
  id: string;
  created_at: string;
  type: string;
  users: ConversationUserRow[];
};

type ConversationParticipantWithConversationRow = {
  conversation_id: string;
  last_seen_at: string | null;
  last_read_at: string | null;
  conversation:
    | ConversationRowWithParticipants
    | ConversationRowWithParticipants[]
    | null;
};

type UseChatConversationsRealtimeParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  userEmail: string;
  globalConversationId: string;
  conversationIdsRef: MutableRefObject<Set<string>>;
  activeConversationIdRef: MutableRefObject<string | null>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
  setLastSeenByUserId: Dispatch<SetStateAction<Record<string, string | null>>>;
  fetchUnreadCountsForConversations: (
    targetConversationIds: string[],
    readMap: Record<string, string | null>,
    mode?: "replace" | "merge",
  ) => Promise<void>;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
};

function withLatestLastSeen(
  prev: Record<string, string | null>,
  targetUserId: string,
  incoming: string | null,
) {
  const previous = prev[targetUserId];

  if (!previous) {
    return { ...prev, [targetUserId]: incoming };
  }

  if (!incoming) {
    return prev;
  }

  if (new Date(incoming).getTime() > new Date(previous).getTime()) {
    return { ...prev, [targetUserId]: incoming };
  }

  return prev;
}

export function useChatConversationsRealtime({
  supabase,
  userId,
  userEmail,
  globalConversationId,
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
      const { data: participant } = await supabase
        .from("conversation_participants")
        .select("last_read_at")
        .eq("conversation_id", targetConversationId)
        .eq("user_id", userId)
        .single();

      await fetchUnreadCountsForConversations(
        [targetConversationId],
        {
          [targetConversationId]: participant?.last_read_at ?? null,
        },
        "merge",
      );
    },
    [fetchUnreadCountsForConversations, supabase, userId],
  );

  const ensureGlobalConversationMembership = useCallback(async () => {
    if (!userId) return;

    const timestamp = new Date().toISOString();

    const { error: conversationError } = await supabase.from("conversations").upsert(
      {
        id: globalConversationId,
        type: "global",
      },
      {
        onConflict: "id",
      },
    );

    if (conversationError) {
      console.error("Failed to ensure global conversation:", conversationError);
    }

    const { error: participantError } = await supabase
      .from("conversation_participants")
      .upsert(
        {
          conversation_id: globalConversationId,
          user_id: userId,
          email: userEmail,
          last_seen_at: timestamp,
          last_read_at: timestamp,
        },
        {
          onConflict: "conversation_id,user_id",
        },
      );

    if (participantError) {
      console.error(
        "Failed to ensure global conversation membership:",
        participantError,
      );
    }
  }, [globalConversationId, supabase, userEmail, userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      await ensureGlobalConversationMembership();

      const { data } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation_id,
          last_read_at,
          last_seen_at,
          conversation: conversations(
            id,
            created_at,
            users: conversation_participants!inner(user_id, email, last_seen_at),
            type
          )
          `,
        )
        .eq("user_id", userId);

      if (!data) return;

      const participantRows =
        (data as ConversationParticipantWithConversationRow[]) ?? [];
      const convs: Conversation[] = [];
      const nextParticipantMeta: Record<string, ParticipantPresence> = {};
      const nextLastSeenByUserId: Record<string, string | null> = {};
      const readMap: Record<string, string | null> = {};

      participantRows.forEach((row) => {
        const convo = Array.isArray(row.conversation)
          ? row.conversation[0]
          : row.conversation;

        if (!convo) return;

        convs.push({
          id: convo.id,
          created_at: convo.created_at,
          users: convo.users.map((participant) => ({
            id: participant.user_id,
            email: participant.email ?? "",
          })),
          type: convo.type,
        });

        nextParticipantMeta[row.conversation_id] = {
          last_seen_at: row.last_seen_at ?? null,
          last_read_at: row.last_read_at ?? null,
        };
        readMap[row.conversation_id] = row.last_read_at ?? null;

        convo.users.forEach((participant) => {
          if (!participant.user_id || participant.user_id === userId) return;

          const previous = nextLastSeenByUserId[participant.user_id];
          const incoming = participant.last_seen_at ?? null;

          if (!previous) {
            nextLastSeenByUserId[participant.user_id] = incoming;
            return;
          }

          if (!incoming) return;

          if (new Date(incoming).getTime() > new Date(previous).getTime()) {
            nextLastSeenByUserId[participant.user_id] = incoming;
          }
        });
      });

      const sortedConvs = convs.sort((a, b) =>
        a.type === "global" ? -1 : b.type === "global" ? 1 : 0,
      );

      setConversations(sortedConvs);
      setParticipantMetaByConversationId(nextParticipantMeta);
      setLastSeenByUserId(nextLastSeenByUserId);
      void fetchUnreadCountsForConversations(
        sortedConvs.map((conv) => conv.id),
        readMap,
        "replace",
      );
    };

    void fetchConversations();
  }, [
    ensureGlobalConversationMembership,
    fetchUnreadCountsForConversations,
    setConversations,
    setLastSeenByUserId,
    setParticipantMetaByConversationId,
    supabase,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversation-membership-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as {
            conversation_id: string;
            last_seen_at: string | null;
            last_read_at: string | null;
          };

          const { data } = await supabase
            .from("conversations")
            .select(
              `
                id,
                created_at,
                type,
                users:conversation_participants!inner(user_id, email, last_seen_at)
              `,
            )
            .eq("id", row.conversation_id)
            .single();

          if (!data) return;

          const convo = data as ConversationRowWithParticipants;
          const nextConversation: Conversation = {
            id: convo.id,
            created_at: convo.created_at,
            users: convo.users.map((participant) => ({
              id: participant.user_id,
              email: participant.email ?? "",
            })),
            type: convo.type,
          };

          setConversations((prev) => {
            if (prev.some((existing) => existing.id === nextConversation.id)) {
              return prev;
            }

            return [...prev, nextConversation].sort((a, b) =>
              a.type === "global" ? -1 : b.type === "global" ? 1 : 0,
            );
          });

          setParticipantMetaByConversationId((prev) => ({
            ...prev,
            [row.conversation_id]: {
              last_seen_at: row.last_seen_at ?? null,
              last_read_at: row.last_read_at ?? null,
            },
          }));

          convo.users.forEach((participant) => {
            if (participant.user_id === userId) return;

            setLastSeenByUserId((prev) =>
              withLatestLastSeen(
                prev,
                participant.user_id,
                participant.last_seen_at ?? null,
              ),
            );
          });

          void fetchUnreadCountsForConversations(
            [row.conversation_id],
            { [row.conversation_id]: row.last_read_at ?? null },
            "merge",
          );
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [
    fetchUnreadCountsForConversations,
    setConversations,
    setLastSeenByUserId,
    setParticipantMetaByConversationId,
    supabase,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversation-participant-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
        },
        (payload) => {
          const row = payload.new as {
            conversation_id: string;
            user_id: string;
            last_seen_at: string | null;
            last_read_at: string | null;
          };

          if (!conversationIdsRef.current.has(row.conversation_id)) return;

          if (row.user_id === userId) {
            setParticipantMetaByConversationId((prev) => ({
              ...prev,
              [row.conversation_id]: {
                last_seen_at: row.last_seen_at ?? null,
                last_read_at: row.last_read_at ?? null,
              },
            }));

            void refreshUnreadForConversation(row.conversation_id);

            return;
          }

          setLastSeenByUserId((prev) =>
            withLatestLastSeen(prev, row.user_id, row.last_seen_at ?? null),
          );
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationIdsRef, refreshUnreadForConversation, setLastSeenByUserId, setParticipantMetaByConversationId, supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`message-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as Message;

          if (!conversationIdsRef.current.has(message.conversation_id)) return;
          if (message.sender_id === userId) return;

          if (activeConversationIdRef.current === message.conversation_id) {
            void markConversationAsRead(message.conversation_id);
            return;
          }

          void refreshUnreadForConversation(message.conversation_id);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [
    activeConversationIdRef,
    conversationIdsRef,
    refreshUnreadForConversation,
    markConversationAsRead,
    supabase,
    userId,
  ]);
}
