"use client";

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { toast } from "react-toastify";
import type { Message } from "@/app/components/Chat";
import { sanitizeTextWithBlocklist } from "@/app/utils/moderation";

type UseChatMessageComposerParams = {
  user_id: string;
  conversationId: string | null;
  input: string;
  badWords: string[];
  bottomRef: RefObject<HTMLDivElement | null>;
  setInput: Dispatch<SetStateAction<string>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  stopTyping: (targetConversationId: string) => void;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
};

export function useChatMessageComposer({
  userId,
  conversationId,
  input,
  badWords,
  bottomRef,
  setInput,
  setMessages,
  stopTyping,
  markConversationAsRead,
}: UseChatMessageComposerParams) {
  const sendingMessageRef = useRef(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const sendMessage = useCallback(async () => {
    if (sendingMessageRef.current) return;
    if (!input.trim() || !conversationId) return;

    sendingMessageRef.current = true;
    setIsSendingMessage(true);

    const targetConversationId = conversationId;
    const originalText = input;
    const outgoingText = sanitizeTextWithBlocklist(
      input.slice(0, 1000),
      badWords,
    );

    if (!outgoingText.trim()) {
      sendingMessageRef.current = false;
      setIsSendingMessage(false);
      return;
    }

    const optimisticMessageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticCreatedAt = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticMessageId,
        conversation_id: targetConversationId,
        sender_id: userId,
        text: outgoingText,
        attachments: [],
        created_at: optimisticCreatedAt,
        optimistic: true,
      },
    ]);

    setInput("");
    stopTyping(targetConversationId);

    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: targetConversationId,
          text: outgoingText,
          attachments: [],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message.");
      }

      const saved: Message = await res.json();

      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessageId ? saved : m)),
      );

      void markConversationAsRead(targetConversationId);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessageId));
      setInput(originalText);
      toast.error("Failed to send message. Please try again.");
    } finally {
      sendingMessageRef.current = false;
      setIsSendingMessage(false);
    }
  }, [
    badWords,
    bottomRef,
    conversationId,
    input,
    markConversationAsRead,
    setInput,
    setMessages,
    stopTyping,
    userId,
  ]);

  return {
    sendMessage,
    isSendingMessage,
  };
}
