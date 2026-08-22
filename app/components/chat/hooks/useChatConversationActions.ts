"use client";

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { toast } from "react-toastify";
import type { ChatUser, Conversation } from "@/app/components/Chat";

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type UseChatConversationActionsParams = {
  user_id: string;
  userEmail: string | null | undefined;
  conversationId: string | null;
  conversations: Conversation[];
  creatingRef: MutableRefObject<boolean>;
  unseenPresenceIso: string;
  setConversationId: Dispatch<SetStateAction<string | null>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowRightSidebar: Dispatch<SetStateAction<boolean>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setUnreadCountByConversationId: Dispatch<
    SetStateAction<Record<string, number>>
  >;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
};

export function useChatConversationActions({
  userId,
  userEmail,
  conversationId,
  conversations,
  creatingRef,
  unseenPresenceIso,
  setConversationId,
  setShowModal,
  setShowRightSidebar,
  setConversations,
  setUnreadCountByConversationId,
  setParticipantMetaByConversationId,
}: UseChatConversationActionsParams) {
  const createConversation = useCallback(
    async (otherUser: ChatUser) => {
      if (creatingRef.current) return;
      creatingRef.current = true;

      try {
        const existing = conversations.find((c) => {
          if (c.type === "global") return false;
          const ids = new Set(c.users.map((u) => u.id));
          return (
            ids.size === 2 && ids.has(userId) && ids.has(otherUser.user_id)
          );
        });

        if (existing) {
          setConversationId(existing.id);
          setShowModal(false);
          return;
        }

        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otheruser_id: otherUser.user_id,
            otherUserEmail: otherUser.email,
          }),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Could not start a direct message.");
        }

        const created: Conversation & { last_read_at: string } =
          await res.json();

        setConversationId(created.id);
        setConversations((prev) => {
          if (prev.some((c) => c.id === created.id)) return prev;
          return [
            ...prev,
            {
              id: created.id,
              created_at: created.created_at,
              users: created.users,
              type: created.type,
            },
          ];
        });
        setUnreadCountByConversationId((prev) => ({
          ...prev,
          [created.id]: 0,
        }));
        setParticipantMetaByConversationId((prev) => ({
          ...prev,
          [created.id]: {
            last_seen_at: created.last_read_at,
            last_read_at: created.last_read_at,
          },
        }));

        setShowModal(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not start a direct message. Please try again.",
        );
      } finally {
        creatingRef.current = false;
      }

      void unseenPresenceIso;
      void userEmail;
    },
    [
      conversations,
      creatingRef,
      setConversationId,
      setConversations,
      setParticipantMetaByConversationId,
      setShowModal,
      setUnreadCountByConversationId,
      unseenPresenceIso,
      userEmail,
      userId,
    ],
  );

  const openPrivateChatFromGlobalProfile = useCallback(
    (targetuser_id: string, targetEmail: string) => {
      if (!targetUserId || targetUserId === userId) return;
      if (!targetEmail) {
        toast.info("Cannot start a private chat without user email.");
        return;
      }
      void createConversation({ user_id: targetUserId, email: targetEmail });
    },
    [createConversation, userId],
  );

  const handleDeleteConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setUnreadCountByConversationId((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      setParticipantMetaByConversationId((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      setConversationId(null);
      setShowRightSidebar(false);
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete conversation");
    }
  }, [
    conversationId,
    setConversationId,
    setConversations,
    setParticipantMetaByConversationId,
    setShowRightSidebar,
    setUnreadCountByConversationId,
  ]);

  return {
    createConversation,
    openPrivateChatFromGlobalProfile,
    handleDeleteConversation,
  };
}
