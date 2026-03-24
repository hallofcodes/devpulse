"use client";

import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Conversation, Message } from "../Chat";
import { timeAgo } from "@/app/utils/time";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { faDownload, faFile, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Player from "./Player";

const RANK_BORDER: Record<string, { border: string; ring: string }> = {
  "MISSION IMPOSSIBLE": {
    border: "border-fuchsia-400",
    ring: "ring-fuchsia-400/25",
  },
  "GOD LEVEL": { border: "border-fuchsia-400", ring: "ring-fuchsia-300/25" },
  STARLIGHT: { border: "border-sky-400", ring: "ring-sky-300/25" },
  ELITE: { border: "border-red-400", ring: "ring-red-300/25" },
  PRO: { border: "border-indigo-400", ring: "ring-indigo-300/25" },
  NOVICE: { border: "border-emerald-400", ring: "ring-emerald-300/25" },
  NEWBIE: { border: "border-lime-400", ring: "ring-lime-300/25" },
};
const DEFAULT_RANK_BORDER = {
  border: "border-indigo-400",
  ring: "ring-indigo-300/20",
};

export default function Messages({
  messages,
  user,
  conversations,
  bottomRef,
  badgesByUserId,
}: {
  messages: Message[];
  user: User;
  conversations: Conversation[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  badgesByUserId?: Record<string, { label: string; className: string }>;
}) {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{
    type: "image" | "video";
    url: string;
    filename: string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const container = document.getElementById("chat-container");
    if (!container) return;
    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollBtn(!nearBottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDownloadMedia = async () => {
    if (!mediaViewer) return;
    try {
      const res = await fetch(mediaViewer.url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = mediaViewer.filename || "media";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Media download failed:", err);
      window.open(mediaViewer.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {isMounted &&
        mediaViewer &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
            onClick={() => setMediaViewer(null)}
          >
            <div
              className="w-screen h-[100dvh] sm:w-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] rounded-none sm:rounded-2xl border-0 sm:border border-white/10 bg-[#0d0d18]/95 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`${
                  mediaViewer.type === "video"
                    ? "h-[100dvh] sm:h-[90vh] p-0 bg-black"
                    : "h-[100dvh] sm:h-[90vh] p-0 bg-black/30"
                } flex items-center justify-center`}
              >
                {mediaViewer.type === "image" ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img
                      src={mediaViewer.url}
                      alt={mediaViewer.filename}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadMedia}
                        className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
                        aria-label="Download media"
                      >
                        <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaViewer(null)}
                        className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
                        aria-label="Close viewer"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Player
                    src={mediaViewer.url}
                    autoPlay={true}
                    immersive={true}
                    className="w-full h-full"
                    onDownload={handleDownloadMedia}
                    onClose={() => setMediaViewer(null)}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-1"
        id="chat-container"
      >
        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="fixed right-4 bottom-24 z-50 w-9 h-9 flex items-center justify-center
                       bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur border border-white/10
                       text-gray-300 rounded-full shadow-lg transition"
          >
            ↓
          </button>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pt-16">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isSelf = msg.sender_id === user.id;
          const conversationRow = conversations.find(
            (c) => c.id === msg.conversation_id,
          );
          const senderRow = conversationRow?.users.find(
            (u) => u.id === msg.sender_id,
          );

          const senderInitial = senderRow?.email?.[0]?.toUpperCase() ?? "?";
          const senderName = senderRow?.email?.split("@")?.[0] ?? "";

          const badge = badgesByUserId?.[msg.sender_id];
          const badgeLabel = badge?.label ?? "NEWBIE";
          const rankBorder = RANK_BORDER[badgeLabel] ?? DEFAULT_RANK_BORDER;

          const badgePillClass =
            badge?.className ??
            `bg-white/[0.03] text-gray-300 ring-1 ${rankBorder.border} ${rankBorder.ring}`;

          // long msg? nudge avatar up, ez.
          const text = msg.text ?? "";
          const hasMedia = !!msg.attachments?.length;
          const isLongMessage = hasMedia || text.length >= 120 || text.includes("\n");
          const avatarTranslateClass = isLongMessage
            ? "-translate-y-[4.5px]"
            : "-translate-y-[4px]";

          return (
            <div
              key={idx}
              className={`group flex gap-2.5 items-end transition-colors ${
                isSelf ? "justify-end" : "justify-start"
              }`}
            >
              {!isSelf && (
                <div
                  className={`flex-shrink-0 ${avatarTranslateClass} w-8 h-8 rounded-full bg-neutral-700 border border-white/10 flex items-center justify-center aspect-square overflow-hidden`}
                >
                  <span className="text-xs font-semibold leading-none text-gray-200">
                    {senderInitial}
                  </span>
                </div>
              )}

              <div
                className={`flex flex-col min-w-0 w-full max-w-[680px] ${
                  isSelf ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-0.5">
                  {isSelf && (
                    <span className="text-[10px] text-gray-600">
                      {timeAgo(msg.created_at)}
                    </span>
                  )}
                <span
                  className={`text-[12px] font-semibold leading-none ${
                    isSelf ? "text-indigo-300" : "text-gray-200"
                  }`}
                >
                  {senderName}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border leading-none ${badgePillClass}`}
                >
                  {badgeLabel}
                </span>
                  {!isSelf && (
                    <span className="text-[10px] text-gray-600">
                      {timeAgo(msg.created_at)}
                    </span>
                  )}
                </div>

                {msg.text && (
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed border break-words break-all overflow-x-hidden ${
                      isSelf
                        ? "bg-indigo-500/15 border-indigo-400/25 text-gray-100"
                        : "bg-neutral-800/60 border-white/8 text-gray-100"
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none break-words break-all whitespace-pre-wrap">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeText = String(children).replace(/\n$/, "");

                            if (!match) {
                              return (
                                <code
                                  className="px-1 py-0.5 rounded bg-white/10 text-[0.85em]"
                                  {...(props as Record<string, unknown>)}
                                >
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <CodeBlock
                                code={codeText}
                                language={match[1]}
                                props={props as Record<string, unknown>}
                              />
                            );
                          },
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    {msg.attachments.map((att, i) => (
                      <div key={i}>
                        {getAttachments(att, (payload) => setMediaViewer(payload))}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </>
  );
}

function CodeBlock({
  code,
  language,
  props,
}: {
  code: string;
  language: string;
  props: Record<string, unknown>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy code failed:", err);
    }
  };

  return (
    <div className="relative group/code max-w-full">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 rounded-md border border-white/15 bg-black/45 text-gray-300 hover:text-white hover:bg-black/60 transition opacity-0 group-hover/code:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <SyntaxHighlighter
        style={atomDark as { [key: string]: React.CSSProperties }}
        language={language}
        PreTag="pre"
        wrapLongLines={true}
        className="rounded-xl text-xs border border-white/10 !bg-neutral-900/60 max-w-full"
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          },
        }}
        customStyle={{
          width: "100%",
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          overflowX: "hidden",
          margin: 0,
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function getAttachments(
  attachment: {
    mimetype: string;
    public_url: string;
    filename: string;
  },
  onOpenMedia: (payload: { type: "image" | "video"; url: string; filename: string }) => void,
) {
  switch (attachment.mimetype.split("/")[0]) {
    case "image":
      return (
        <button
          type="button"
          onClick={() =>
            onOpenMedia({
              type: "image",
              url: attachment.public_url,
              filename: attachment.filename,
            })
          }
          className="group relative block w-full max-w-[320px] sm:max-w-[380px] overflow-hidden rounded-xl border border-white/10 bg-black/30"
        >
          <Image
            src={attachment.public_url}
            alt={attachment.filename}
            className="w-full h-auto rounded-xl transition-transform duration-200 group-hover:scale-[1.01]"
            width={520}
            height={320}
          />
          <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent text-left">
            <span className="text-[11px] text-gray-200">Tap to preview</span>
          </div>
        </button>
      );
    case "video":
      return (
        <button
          type="button"
          onClick={() =>
            onOpenMedia({
              type: "video",
              url: attachment.public_url,
              filename: attachment.filename,
            })
          }
          className="group relative w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-black/35 text-left"
        >
          <video
            muted
            playsInline
            className="w-full h-auto max-h-[420px] object-contain bg-black opacity-95 group-hover:opacity-100 transition"
          >
            <source src={attachment.public_url} type={attachment.mimetype} />
          </video>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs text-gray-100">
              Play video
            </span>
          </div>
        </button>
      );
    case "audio":
      return (
        <audio controls className="w-full">
          <source src={attachment.public_url} type={attachment.mimetype} />
        </audio>
      );
    default:
      return (
        <a
          href={attachment.public_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 hover:underline text-sm"
        >
          <FontAwesomeIcon icon={faFile} className="w-3 h-3" />
          {attachment.filename}
        </a>
      );
  }
}
