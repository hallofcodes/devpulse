"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";

type UseChatInputBehaviorParams = {
  input: string;
  isSendingMessage: boolean;
  conversationId: string | null;
  attachmentsCount: number;
  setInput: Dispatch<SetStateAction<string>>;
  markTypingFromInput: (targetConversationId: string, nextValue: string) => void;
  sendMessage: () => void;
  maxChars?: number;
};

export function useChatInputBehavior({
  input,
  isSendingMessage,
  conversationId,
  attachmentsCount,
  setInput,
  markTypingFromInput,
  sendMessage,
  maxChars = 1000,
}: UseChatInputBehaviorParams) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const minHeight = 20;
    const maxHeight = minHeight * 6;

    textarea.style.height = `${minHeight}px`;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value.slice(0, maxChars);
      setInput(nextValue);

      if (conversationId) {
        markTypingFromInput(conversationId, nextValue);
      }
    },
    [conversationId, markTypingFromInput, maxChars, setInput],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (isSendingMessage) return;

      event.preventDefault();

      if (input.trim() || attachmentsCount > 0) {
        sendMessage();
      }
    },
    [attachmentsCount, input, isSendingMessage, sendMessage],
  );

  return {
    textareaRef,
    handleInputChange,
    handleInputKeyDown,
  };
}