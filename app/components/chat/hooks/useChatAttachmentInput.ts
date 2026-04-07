"use client";

import { useCallback, useState, type ClipboardEvent, type DragEvent, type ChangeEvent } from "react";

export function useChatAttachmentInput() {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handlePaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    if (!items) return;

    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length) {
      setAttachments((prev) => [...prev, ...files]);
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    attachments,
    setAttachments,
    isDraggingOver,
    handleFileChange,
    handleDrop,
    handleDragOver,
    onDragLeave,
    handlePaste,
    removeAttachment,
  };
}