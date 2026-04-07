"use client";

import { useBadWords } from "@/app/hooks/useBadWords";

export function useChatBadWords() {
  return useBadWords();
}