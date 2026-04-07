"use client";

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "react-toastify";
import type { Database } from "@/app/supabase-types";
import type { Message } from "@/app/components/Chat";
import { sanitizeTextWithBlocklist } from "@/app/utils/moderation";

type UseChatMessageComposerParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  channelRef: MutableRefObject<RealtimeChannel | null>;
  conversationId: string | null;
  input: string;
  attachments: File[];
  badWords: string[];
  bucketName: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  setInput: Dispatch<SetStateAction<string>>;
  setAttachments: Dispatch<SetStateAction<File[]>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  stopTyping: (targetConversationId: string) => void;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
};

export function useChatMessageComposer({
  supabase,
  userId,
  channelRef,
  conversationId,
  input,
  attachments,
  badWords,
  bucketName,
  bottomRef,
  setInput,
  setAttachments,
  setMessages,
  stopTyping,
  markConversationAsRead,
}: UseChatMessageComposerParams) {
  const sendingMessageRef = useRef(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const createClientMessageId = useCallback(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const sendMessage = useCallback(async () => {
    if (sendingMessageRef.current) return;
    if ((!input.trim() && attachments.length === 0) || !conversationId) return;

    sendingMessageRef.current = true;
    setIsSendingMessage(true);

    const targetConversationId = conversationId;
    const originalText = input;
    const originalAttachments = attachments;
    const outgoingText = sanitizeTextWithBlocklist(
      input.slice(0, 1000),
      badWords,
    );

    try {
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          if (!bucketName || bucketName.length === 0) {
            toast.error("Storage bucket is not configured.");
            return null;
          }
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} is too large. Max size is 10MB.`);
            return null;
          }

          const filePath = `messages/${targetConversationId}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            return null;
          }

          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          return {
            filename: file.name,
            mimetype: file.type,
            filesize: file.size,
            public_url: data.publicUrl,
          };
        }),
      );

      const validAttachments = uploadedAttachments.filter(
        (attachment): attachment is Message["attachments"][number] =>
          attachment !== null,
      );

      if (!outgoingText.trim() && validAttachments.length === 0) {
        setAttachments([]);
        return;
      }

      const clientMessageId = createClientMessageId();
      const optimisticCreatedAt = new Date().toISOString();
      const optimisticMessageId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticMessageId,
          conversation_id: targetConversationId,
          sender_id: userId,
          text: outgoingText,
          attachments: validAttachments,
          created_at: optimisticCreatedAt,
          optimistic: true,
        },
      ]);

      const activeChannel = channelRef.current;
      if (activeChannel) {
        void activeChannel.send({
          type: "broadcast",
          event: "message",
          payload: {
            client_message_id: clientMessageId,
            conversation_id: targetConversationId,
            sender_id: userId,
            text: outgoingText,
            attachments: validAttachments,
            created_at: optimisticCreatedAt,
          },
        });
      }

      setInput("");
      setAttachments([]);
      stopTyping(targetConversationId);

      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      const { error: insertError } = await supabase.from("messages").insert({
        conversation_id: targetConversationId,
        sender_id: userId,
        text: outgoingText,
        attachments: validAttachments,
      });

      if (insertError) {
        if (activeChannel) {
          void activeChannel.send({
            type: "broadcast",
            event: "message_retract",
            payload: {
              client_message_id: clientMessageId,
              conversation_id: targetConversationId,
              sender_id: userId,
            },
          });
        }

        setMessages((prev) =>
          prev.filter((message) => message.id !== optimisticMessageId),
        );
        setInput(originalText);
        setAttachments(originalAttachments);
        throw insertError;
      }

      void markConversationAsRead(targetConversationId);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      sendingMessageRef.current = false;
      setIsSendingMessage(false);
    }
  }, [
    attachments,
    badWords,
    bottomRef,
    bucketName,
    channelRef,
    conversationId,
    createClientMessageId,
    input,
    markConversationAsRead,
    setAttachments,
    setInput,
    setMessages,
    stopTyping,
    supabase,
    userId,
  ]);

  return {
    sendMessage,
    isSendingMessage,
  };
}