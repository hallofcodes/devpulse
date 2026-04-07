"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faDownload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Player from "./Player";
import { downloadRemoteMedia } from "@/app/utils/media";

export type MediaViewerPayload = {
  type: "image" | "video";
  url: string;
  filename: string;
};

type MediaAttachment = {
  mimetype?: string | null;
  public_url: string;
  filename?: string | null;
};

type MediaViewerModalProps = {
  viewer: MediaViewerPayload | null;
  attachments: MediaAttachment[];
  onChange: (next: MediaViewerPayload | null) => void;
};

function toViewerPayload(attachment: MediaAttachment): MediaViewerPayload {
  return {
    type: attachment.mimetype?.startsWith("video/") ? "video" : "image",
    url: attachment.public_url,
    filename: attachment.filename || "Media",
  };
}

export default function MediaViewerModal({
  viewer,
  attachments,
  onChange,
}: MediaViewerModalProps) {
  const currentMediaIndex = useMemo(() => {
    if (!viewer) return -1;
    return attachments.findIndex((attachment) => attachment.public_url === viewer.url);
  }, [attachments, viewer]);

  const hasPrevMedia = currentMediaIndex > 0;
  const hasNextMedia =
    currentMediaIndex !== -1 && currentMediaIndex < attachments.length - 1;

  const navigateMedia = (e: React.MouseEvent, step: number) => {
    e.stopPropagation();
    if (currentMediaIndex === -1) return;

    const nextIndex = currentMediaIndex + step;
    if (nextIndex >= 0 && nextIndex < attachments.length) {
      onChange(toViewerPayload(attachments[nextIndex]));
    }
  };

  if (!viewer || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
      onClick={() => onChange(null)}
    >
      {hasPrevMedia && (
        <button
          type="button"
          onClick={(e) => navigateMedia(e, -1)}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-[10000] w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition shadow-lg backdrop-blur-md border border-white/10"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
        </button>
      )}

      {hasNextMedia && (
        <button
          type="button"
          onClick={(e) => navigateMedia(e, 1)}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[10000] w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition shadow-lg backdrop-blur-md border border-white/10"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
        </button>
      )}

      <div
        className="w-screen h-[100dvh] sm:w-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] rounded-none sm:rounded-2xl border-0 sm:border border-white/10 bg-[rgba(10,10,30,0.9)]/95 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${
            viewer.type === "video"
              ? "h-[100dvh] sm:h-[90vh] p-0 bg-black"
              : "h-[100dvh] sm:h-[90vh] p-0 bg-black/30"
          } flex items-center justify-center`}
        >
          {viewer.type === "image" ? (
            <div className="relative h-full w-full flex items-center justify-center">
              <Image
                src={viewer.url}
                alt={viewer.filename}
                className="h-full w-full object-contain"
                fill
              />
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void downloadRemoteMedia(viewer.url, viewer.filename || "media")}
                  className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
                  aria-label="Download media"
                >
                  <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
                  aria-label="Close viewer"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <Player
              src={viewer.url}
              autoPlay={true}
              immersive={true}
              className="w-full h-full"
              onDownload={() => void downloadRemoteMedia(viewer.url, viewer.filename || "media")}
              onClose={() => onChange(null)}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}