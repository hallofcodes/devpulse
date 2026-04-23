"use client";

import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import type { Message } from "@/app/components/Chat";

type TypingState = {
  user_id: string;
  label: string;
};

type UseActiveConversationStreamParams = {
  supabase: SupabaseClient<Database>;
  conversationId: string | null;
  userId: string;
  channelRef: MutableRefObject<RealtimeChannel | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
  setRemoteTypingState: (targetConversationId: string, state: TypingState | null) => void;
  stopTyping: (targetConversationId: string) => void;
};

const getAttachmentFingerprint = (attachments: Message["attachments"] = []) =>
  attachments
    .map((attachment) => {
      const filename = attachment?.filename ?? "";
      const mimetype = attachment?.mimetype ?? "";
      const filesize = String(attachment?.filesize ?? 0);
      const publicUrl = attachment?.public_url ?? "";
      return `${filename}|${mimetype}|${filesize}|${publicUrl}`;
    })
    .join("::");

const EPHEMERAL_RECONCILE_WINDOW_MS = 15_000;
const BROADCAST_DUPLICATE_WINDOW_MS = 1_500;

const isEphemeralMessageId = (messageId: string) =>
  messageId.startsWith("temp-") || messageId.startsWith("live-");

const isCreatedWithinWindow = (
  candidateCreatedAt: string,
  incomingCreatedAt: string,
  windowMs = EPHEMERAL_RECONCILE_WINDOW_MS,
) => {
  const candidateTimestamp = Date.parse(candidateCreatedAt);
  const incomingTimestamp = Date.parse(incomingCreatedAt);

  if (!Number.isFinite(candidateTimestamp) || !Number.isFinite(incomingTimestamp)) {
    return true;
  }

  return Math.abs(incomingTimestamp - candidateTimestamp) <= windowMs;
};

const normalizeAttachments = (attachments: unknown): Message["attachments"] => {
  if (!Array.isArray(attachments)) return [];

  return attachments
    .map((rawAttachment) => {
      if (!rawAttachment || typeof rawAttachment !== "object") return null;

      const attachment = rawAttachment as Record<string, unknown>;
      const filename =
        typeof attachment.filename === "string" ? attachment.filename : "";
      const mimetype =
        typeof attachment.mimetype === "string" ? attachment.mimetype : "";
      const publicUrl =
        typeof attachment.public_url === "string" ? attachment.public_url : "";
      const rawFilesize = attachment.filesize;
      const filesize =
        typeof rawFilesize === "number"
          ? rawFilesize
          : typeof rawFilesize === "string"
            ? Number(rawFilesize)
            : 0;

      return {
        filename,
        mimetype,
        filesize: Number.isFinite(filesize) ? filesize : 0,
        public_url: publicUrl,
      };
    })
    .filter(
      (
        attachment,
      ): attachment is Message["attachments"][number] => attachment !== null,
    );
};

export function useActiveConversationStream({
  supabase,
  conversationId,
  userId,
  channelRef,
  bottomRef,
  setMessages,
  markConversationAsRead,
  setRemoteTypingState,
  stopTyping,
}: UseActiveConversationStreamParams) {
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    void markConversationAsRead(conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "broadcast",
        {
          event: "typing",
        },
        ({ payload }) => {
          const typingPayload = payload as {
            conversation_id?: string;
            user_id?: string;
            email?: string | null;
            is_typing?: boolean;
          };

          if (typingPayload.conversation_id !== conversationId) return;
          if (!typingPayload.user_id || typingPayload.user_id === userId) return;

          if (typingPayload.is_typing) {
            setRemoteTypingState(conversationId, {
              user_id: typingPayload.user_id,
              label: typingPayload.email?.split("@")[0] || "Someone",
            });
            return;
          }

          setRemoteTypingState(conversationId, null);
        },
      )
      .on(
        "broadcast",
        {
          event: "message",
        },
        ({ payload }) => {
          const messagePayload = payload as {
            conversation_id?: string;
            sender_id?: string;
            text?: string;
            attachments?: unknown;
            created_at?: string;
            client_message_id?: string;
          };

          if (messagePayload.conversation_id !== conversationId) return;
          if (!messagePayload.sender_id || messagePayload.sender_id === userId) {
            return;
          }
          const senderId = messagePayload.sender_id;

          const incomingCreatedAt =
            typeof messagePayload.created_at === "string"
              ? messagePayload.created_at
              : new Date().toISOString();
          const incomingAttachments = normalizeAttachments(
            messagePayload.attachments,
          );
          const clientMessageId =
            typeof messagePayload.client_message_id === "string" &&
            messagePayload.client_message_id.length > 0
              ? messagePayload.client_message_id
              : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const liveMessageId = `live-${clientMessageId}`;

          setMessages((prev) => {
            if (prev.some((message) => message.id === liveMessageId)) {
              return prev;
            }

            const incomingText = messagePayload.text ?? "";
            const incomingFingerprint = getAttachmentFingerprint(incomingAttachments);

            const hasMatchingMessage = prev.some((message) => {
              if (isEphemeralMessageId(message.id)) return false;
              if (message.sender_id !== senderId) return false;
              if (message.conversation_id !== conversationId) return false;
              if (message.text !== incomingText) return false;
              if (
                getAttachmentFingerprint(message.attachments) !== incomingFingerprint
              ) {
                return false;
              }

              return isCreatedWithinWindow(
                message.created_at,
                incomingCreatedAt,
                BROADCAST_DUPLICATE_WINDOW_MS,
              );
            });

            if (hasMatchingMessage) {
              return prev;
            }

            return [
              ...prev,
              {
                id: liveMessageId,
                conversation_id: conversationId,
                sender_id: senderId,
                text: incomingText,
                attachments: incomingAttachments,
                created_at: incomingCreatedAt,
              },
            ];
          });

          void markConversationAsRead(conversationId);

          window.setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      )
      .on(
        "broadcast",
        {
          event: "message_retract",
        },
        ({ payload }) => {
          const retractPayload = payload as {
            conversation_id?: string;
            sender_id?: string;
            client_message_id?: string;
          };

          if (retractPayload.conversation_id !== conversationId) return;
          if (retractPayload.sender_id === userId) return;
          if (!retractPayload.client_message_id) return;

          const liveMessageId = `live-${retractPayload.client_message_id}`;

          setMessages((prev) =>
            prev.filter((message) => message.id !== liveMessageId),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incomingMessage: Message = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            text: payload.new.text,
            attachments: normalizeAttachments(payload.new.attachments),
            created_at: payload.new.created_at,
          };

          setMessages((prev) => {
            if (prev.some((message) => message.id === incomingMessage.id)) {
              return prev;
            }

            const incomingFingerprint = getAttachmentFingerprint(
              incomingMessage.attachments,
            );

            const optimisticMessageIndex = prev.findIndex((message) => {
              if (!isEphemeralMessageId(message.id)) return false;
              if (message.sender_id !== incomingMessage.sender_id) return false;
              if (message.conversation_id !== incomingMessage.conversation_id) {
                return false;
              }
              if (message.text !== incomingMessage.text) return false;
              if (
                !isCreatedWithinWindow(
                  message.created_at,
                  incomingMessage.created_at,
                )
              ) {
                return false;
              }

              return (
                getAttachmentFingerprint(message.attachments) ===
                incomingFingerprint
              );
            });

            if (optimisticMessageIndex === -1) {
              return [...prev, incomingMessage];
            }

            const next = [...prev];
            next[optimisticMessageIndex] = incomingMessage;
            return next;
          });

          if (payload.new.sender_id !== userId) {
            void markConversationAsRead(conversationId);
          }

          window.setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const deletedMessageId = payload.old.id as string | undefined;
          if (!deletedMessageId) return;

          setMessages((prev) =>
            prev.filter((message) => message.id !== deletedMessageId),
          );
        },
      )
      .subscribe();

    channelRef.current = channel;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!data) return;

      setMessages(data as Message[]);
      void markConversationAsRead(conversationId);
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    void fetchMessages();

    return () => {
      stopTyping(conversationId);
      setRemoteTypingState(conversationId, null);
      channel.unsubscribe();
    };
  }, [
    bottomRef,
    channelRef,
    conversationId,
    markConversationAsRead,
    setMessages,
    setRemoteTypingState,
    stopTyping,
    supabase,
    userId,
  ]);
}