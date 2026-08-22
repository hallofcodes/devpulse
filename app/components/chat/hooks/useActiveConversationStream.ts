"use client";

import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { Message } from "@/app/components/Chat";

type TypingState = {
  user_id: string;
  label: string;
};

type UseActiveConversationStreamParams = {
  conversationId: string | null;
  user_id: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
  setRemoteTypingState: (
    targetConversationId: string,
    state: TypingState | null,
  ) => void;
  stopTyping: (targetConversationId: string) => void;
};

const getAttachmentFingerprint = (attachments: Message["attachments"] = []) =>
  attachments
    .map(
      (a) =>
        `${a?.filename ?? ""}|${a?.mimetype ?? ""}|${String(a?.filesize ?? 0)}|${a?.public_url ?? ""}`,
    )
    .join("::");

const EPHEMERAL_RECONCILE_WINDOW_MS = 15_000;

const isEphemeralMessageId = (id: string) =>
  id.startsWith("temp-") || id.startsWith("live-");

const isCreatedWithinWindow = (
  candidatecreated_at: string,
  incomingcreated_at: string,
  windowMs = EPHEMERAL_RECONCILE_WINDOW_MS,
) => {
  const a = Date.parse(candidateCreatedAt);
  const b = Date.parse(incomingCreatedAt);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return true;
  return Math.abs(b - a) <= windowMs;
};

const normalizeAttachments = (attachments: unknown): Message["attachments"] => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const a = raw as Record<string, unknown>;
      return {
        filename: typeof a.filename === "string" ? a.filename : "",
        mimetype: typeof a.mimetype === "string" ? a.mimetype : "",
        filesize: typeof a.filesize === "number" ? a.filesize : 0,
        public_url: typeof a.public_url === "string" ? a.public_url : "",
      };
    })
    .filter((a): a is Message["attachments"][number] => a !== null);
};

export function useActiveConversationStream({
  conversationId,
  userId,
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

    void markConversationAsRead(conversationId);

    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
      void markConversationAsRead(conversationId);
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    void fetchMessages();

    const es = new EventSource(`/api/sse/chat/${conversationId}`);

    es.onmessage = (event) => {
      const envelope = JSON.parse(event.data) as {
        type: string;
        data: unknown;
      };

      if (envelope.type === "typing") {
        const typingPayload = envelope.data as {
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
        } else {
          setRemoteTypingState(conversationId, null);
        }
        return;
      }

      if (envelope.type === "message") {
        const messagePayload = envelope.data as {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          text?: string;
          attachments?: unknown;
          created_at?: string;
        };

        if (messagePayload.conversation_id !== conversationId) return;
        if (!messagePayload.sender_id || messagePayload.sender_id === userId)
          return;

        const incomingMessage: Message = {
          id: messagePayload.id ?? `live-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: messagePayload.sender_id,
          text: messagePayload.text ?? "",
          attachments: normalizeAttachments(messagePayload.attachments),
          created_at: messagePayload.created_at ?? new Date().toISOString(),
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMessage.id)) return prev;

          const fingerprint = getAttachmentFingerprint(
            incomingMessage.attachments,
          );
          const optimisticIndex = prev.findIndex((m) => {
            if (!isEphemeralMessageId(m.id)) return false;
            if (m.sender_id !== incomingMessage.sender_id) return false;
            if (m.conversation_id !== conversationId) return false;
            if (m.text !== incomingMessage.text) return false;
            if (
              !isCreatedWithinWindow(m.created_at, incomingMessage.created_at)
            )
              return false;
            return getAttachmentFingerprint(m.attachments) === fingerprint;
          });

          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = incomingMessage;
            return next;
          }

          return [...prev, incomingMessage];
        });

        void markConversationAsRead(conversationId);
        window.setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    return () => {
      stopTyping(conversationId);
      setRemoteTypingState(conversationId, null);
      es.close();
    };
  }, [
    bottomRef,
    conversationId,
    markConversationAsRead,
    setMessages,
    setRemoteTypingState,
    stopTyping,
    userId,
  ]);
}
