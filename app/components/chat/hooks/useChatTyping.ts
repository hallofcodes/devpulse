"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TypingState = {
  user_id: string;
  label: string;
};

type UseChatTypingParams = {
  user_id: string;
  userEmail: string;
  typingInactiveTimeoutMs: number;
  typingRemoteExpireMs: number;
};

export function useChatTyping({
  userId,
  typingInactiveTimeoutMs,
  typingRemoteExpireMs,
}: UseChatTypingParams) {
  const [typingByConversationId, setTypingByConversationId] = useState<
    Record<string, TypingState>
  >({});
  const typingStopTimeoutRef = useRef<Record<string, number>>({});
  const typingExpiryTimeoutRef = useRef<Record<string, number>>({});
  const localTypingByConversationRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    return () => {
      Object.values(typingStopTimeoutRef.current).forEach(window.clearTimeout);
      Object.values(typingExpiryTimeoutRef.current).forEach(
        window.clearTimeout,
      );
      typingStopTimeoutRef.current = {};
      typingExpiryTimeoutRef.current = {};
      localTypingByConversationRef.current = {};
    };
  }, []);

  const setRemoteTypingState = useCallback(
    (targetConversationId: string, state: TypingState | null) => {
      const activeTimeoutId =
        typingExpiryTimeoutRef.current[targetConversationId];
      if (activeTimeoutId) {
        window.clearTimeout(activeTimeoutId);
        delete typingExpiryTimeoutRef.current[targetConversationId];
      }

      if (!state) {
        setTypingByConversationId((prev) => {
          if (!prev[targetConversationId]) return prev;
          const next = { ...prev };
          delete next[targetConversationId];
          return next;
        });
        return;
      }

      setTypingByConversationId((prev) => ({
        ...prev,
        [targetConversationId]: state,
      }));

      typingExpiryTimeoutRef.current[targetConversationId] = window.setTimeout(
        () => {
          setTypingByConversationId((prev) => {
            if (!prev[targetConversationId]) return prev;
            const next = { ...prev };
            delete next[targetConversationId];
            return next;
          });
        },
        typingRemoteExpireMs,
      );
    },
    [typingRemoteExpireMs],
  );

  const emitTypingState = useCallback(
    (targetConversationId: string, isTyping: boolean) => {
      if (!targetConversationId) return;

      void fetch(`/api/sse/chat/${targetConversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_typing: isTyping }),
      });
    },
    [],
  );

  const stopTyping = useCallback(
    (targetConversationId: string) => {
      if (!targetConversationId) return;

      const activeTimeoutId =
        typingStopTimeoutRef.current[targetConversationId];
      if (activeTimeoutId) {
        window.clearTimeout(activeTimeoutId);
        delete typingStopTimeoutRef.current[targetConversationId];
      }

      if (!localTypingByConversationRef.current[targetConversationId]) return;

      localTypingByConversationRef.current[targetConversationId] = false;
      emitTypingState(targetConversationId, false);
    },
    [emitTypingState],
  );

  const markTypingFromInput = useCallback(
    (targetConversationId: string, nextValue: string) => {
      if (!targetConversationId) return;

      const hasText = nextValue.trim().length > 0;
      if (!hasText) {
        stopTyping(targetConversationId);
        return;
      }

      if (!localTypingByConversationRef.current[targetConversationId]) {
        localTypingByConversationRef.current[targetConversationId] = true;
        emitTypingState(targetConversationId, true);
      }

      const activeTimeoutId =
        typingStopTimeoutRef.current[targetConversationId];
      if (activeTimeoutId) window.clearTimeout(activeTimeoutId);

      typingStopTimeoutRef.current[targetConversationId] = window.setTimeout(
        () => {
          stopTyping(targetConversationId);
        },
        typingInactiveTimeoutMs,
      );
    },
    [emitTypingState, stopTyping, typingInactiveTimeoutMs],
  );

  void userId;

  return {
    typingByConversationId,
    setRemoteTypingState,
    stopTyping,
    markTypingFromInput,
  };
}
