"use client";

import { useEffect, useState } from "react";

const BAD_WORDS_SOURCE_URL =
  "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/refs/heads/master/en";
const FETCH_RETRY_DELAYS_MS = [500, 1500];

function parseBadWords(rawText: string) {
  return rawText
    .split("\n")
    .map((word) => word.trim())
    .filter(Boolean);
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function fetchBadWordsWithRetry(signal: AbortSignal) {
  for (let attempt = 0; attempt <= FETCH_RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch(BAD_WORDS_SOURCE_URL, { signal });
      if (!response.ok) {
        throw new Error(`Bad words fetch failed: ${response.status}`);
      }

      const text = await response.text();
      return parseBadWords(text);
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      const retryDelay = FETCH_RETRY_DELAYS_MS[attempt];
      if (retryDelay === undefined) {
        throw error;
      }

      await wait(retryDelay);
    }
  }

  return [];
}

export function useBadWords() {
  const [badWords, setBadWords] = useState<string[]>([]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadBadWords = async () => {
      try {
        const words = await fetchBadWordsWithRetry(abortController.signal);
        setBadWords(words);
      } catch (error) {
        if (abortController.signal.aborted) return;

        console.error("Failed to load bad words list:", error);
        setBadWords([]);
      }
    };

    void loadBadWords();

    return () => {
      abortController.abort();
    };
  }, []);

  return {
    badWords,
  };
}