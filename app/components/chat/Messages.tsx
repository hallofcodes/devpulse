"use client";

import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Conversation, Message } from "../Chat";
import { timeAgo } from "@/app/utils/time";
import { type BadgeInfo, getBadgeInfoFromHours } from "@/app/utils/badge";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  faFile,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MediaViewerModal, { type MediaViewerPayload } from "./MediaViewerModal";
import { toast } from "react-toastify";

export default function Messages({
  messages,
  user,
  conversations,
  bottomRef,
  badgesByUserId,
  onUserProfileClick,
  onUnsendMessage,
}: {
  messages: Message[];
  user: User;
  conversations: Conversation[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  badgesByUserId?: Record<string, BadgeInfo>;
  onUserProfileClick?: (targetUserId: string, targetEmail: string) => void;
  onUnsendMessage?: (messageId: string) => Promise<void>;
}) {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<MediaViewerPayload | null>(
    null,
  );
  const [activeDesktopMenuMessageId, setActiveDesktopMenuMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [mobileActionMenu, setMobileActionMenu] = useState<{
    messageId: string;
    text: string;
    isSelf: boolean;
  } | null>(null);
  const fallbackBadge = useMemo(() => getBadgeInfoFromHours(1), []);

  const allMediaAttachments = useMemo(() => {
    return messages
      .flatMap((m) => m.attachments || [])
      .filter((a) => a?.mimetype?.startsWith("image/") || a?.mimetype?.startsWith("video/"))
      .reverse();
  }, [messages]);

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

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const copyMessageText = async (messageText: string) => {
    const trimmed = (messageText || "").trim();
    if (!trimmed) {
      toast.info("Nothing to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(trimmed);
      toast.success("Message copied.");
    } catch {
      toast.error("Failed to copy message.");
    }
  };

  const clearLongPress = () => {
    if (!longPressTimerRef.current) return;
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const queueLongPressMenu = (
    messageId: string,
    messageText: string,
    isSelf: boolean,
  ) => {
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      setMobileActionMenu({
        messageId,
        text: messageText,
        isSelf,
      });
      longPressTimerRef.current = null;
    }, 450);
  };

  return (
    <>
      <MediaViewerModal
        viewer={mediaViewer}
        attachments={allMediaAttachments}
        onChange={setMediaViewer}
      />

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
        id="chat-container"
      >
        {activeDesktopMenuMessageId && (
          <div className="hidden md:block fixed inset-0 z-10 pointer-events-none bg-black/20 backdrop-blur-[2px]" />
        )}
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
          const canCopyText = !!(msg.text || "").trim();
          const hasDesktopActions = canCopyText || (isSelf && !!onUnsendMessage);
          const conversationRow = conversations.find(
            (c) => c.id === msg.conversation_id,
          );
          const senderRow = conversationRow?.users.find(
            (u) => u.id === msg.sender_id,
          );

          const senderInitial = senderRow?.email?.[0]?.toUpperCase() ?? "?";
          const senderName = senderRow?.email?.split("@")?.[0] ?? "";
          const canOpenPrivateChat =
            !isSelf &&
            conversationRow?.type === "global" &&
            !!senderRow?.email;

          const badgeInfo = badgesByUserId?.[msg.sender_id] ?? fallbackBadge;
          const badgeLabel = badgeInfo.label;
          const badgePillClass = badgeInfo.className;

          // long msg? nudge avatar up, ez.
          const text = msg.text ?? "";
          const hasMedia = !!msg.attachments?.length;
          const isLongMessage = hasMedia || text.length >= 120 || text.includes("\n");
          const avatarTranslateClass = isLongMessage
            ? "-translate-y-[4.5px]"
            : "-translate-y-[4px]";
          const normalizedAttachments = (msg.attachments ?? [])
            .map((att) => normalizeAttachment(att))
            .filter(
              (
                att,
              ): att is {
                mimetype: string;
                public_url: string;
                filename: string;
              } => !!att,
            );
          const isVoiceOnlyMessage =
            !msg.text &&
            normalizedAttachments.length > 0 &&
            normalizedAttachments.every((att) => getAttachmentKind(att) === "audio");

          return (
            <div
              key={idx}
              className={`group relative flex gap-2.5 items-end transition-colors ${
                isSelf ? "justify-end" : "justify-start"
              } ${
                activeDesktopMenuMessageId === msg.id ? "z-20" : "z-0"
              }`}
            >
              {!isSelf && (
                <div
                  role={canOpenPrivateChat ? "button" : undefined}
                  tabIndex={canOpenPrivateChat ? 0 : undefined}
                  onClick={() => {
                    if (!canOpenPrivateChat || !senderRow?.email) return;
                    onUserProfileClick?.(msg.sender_id, senderRow.email);
                  }}
                  onKeyDown={(event) => {
                    if (!canOpenPrivateChat || !senderRow?.email) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onUserProfileClick?.(msg.sender_id, senderRow.email);
                  }}
                  title={canOpenPrivateChat ? "Start private chat" : undefined}
                  className={`flex-shrink-0 ${avatarTranslateClass} w-8 h-8 rounded-full bg-neutral-700 border border-white/10 flex items-center justify-center aspect-square overflow-hidden ${
                    canOpenPrivateChat
                      ? "cursor-pointer hover:border-indigo-400/60 hover:bg-neutral-700/80"
                      : ""
                  }`}
                >
                  <span className="text-xs font-semibold leading-none text-gray-200">
                    {senderInitial}
                  </span>
                </div>
              )}

              <div
                className={`relative flex flex-col min-w-0 w-fit max-w-[680px] ${
                  isSelf ? "items-end" : "items-start"
                }`}
              >
                {hasDesktopActions && (
                  <div
                    className={`hidden md:flex absolute z-20 -top-8 ${
                      isSelf ? "right-0" : "left-0"
                    } ${
                      activeDesktopMenuMessageId === msg.id
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    } transition-opacity`}
                    onMouseEnter={() => {
                      if (!hasDesktopActions) return;
                      setActiveDesktopMenuMessageId(msg.id);
                    }}
                    onMouseLeave={() => {
                      setActiveDesktopMenuMessageId((prev) =>
                        prev === msg.id ? null : prev,
                      );
                    }}
                  >
                    <div className="relative isolate flex items-center gap-1 rounded-xl border border-white/10 bg-[#0c0c1f]/95 backdrop-blur px-1.5 py-1 shadow-xl">
                      {canCopyText && (
                        <button
                          type="button"
                          onClick={() => void copyMessageText(msg.text || "")}
                          className="px-2 py-1 rounded-lg text-[11px] text-gray-200 hover:bg-white/10 transition"
                          title="Copy message"
                        >
                          Copy
                        </button>
                      )}
                      {isSelf && onUnsendMessage && (
                        <button
                          type="button"
                          onClick={() => void onUnsendMessage(msg.id)}
                          className="px-2 py-1 rounded-lg text-[11px] text-red-300 hover:bg-red-500/15 transition"
                          title="Unsend message"
                        >
                          Unsend
                        </button>
                      )}
                      <span
                        className={`absolute -bottom-1.5 -z-10 w-3 h-3 rotate-45 border-r border-b border-white/10 bg-[#0c0c1f]/95 ${
                          isSelf ? "right-3" : "left-3"
                        }`}
                      />
                    </div>
                  </div>
                )}
                <div className={`flex items-center gap-1.5 ${isVoiceOnlyMessage ? "mb-0" : "mb-1"} px-0.5`}>
                  {isSelf && (
                    <span className="text-[10px] text-gray-600">
                      {timeAgo(msg.created_at)}
                    </span>
                  )}
                {canOpenPrivateChat && senderRow?.email ? (
                  <button
                    type="button"
                    onClick={() => onUserProfileClick?.(msg.sender_id, senderRow.email as string)}
                    className="text-[12px] font-semibold leading-none text-gray-200 hover:text-indigo-300 transition"
                    title="Start private chat"
                  >
                    {senderName}
                  </button>
                ) : (
                  <span
                    className={`text-[12px] font-semibold leading-none ${
                      isSelf ? "text-indigo-300" : "text-gray-200"
                    }`}
                  >
                    {senderName}
                  </span>
                )}
                <span
                  className={`badge-base shrink-0 !text-[9px] !py-0.5 !px-2 ${badgePillClass}`}
                >
                  {badgeInfo.icon && <FontAwesomeIcon icon={badgeInfo.icon} className="w-2.5 h-2.5" />}
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
                    onMouseEnter={() => {
                      if (!hasDesktopActions) return;
                      setActiveDesktopMenuMessageId(msg.id);
                    }}
                    onMouseLeave={() => {
                      setActiveDesktopMenuMessageId((prev) =>
                        prev === msg.id ? null : prev,
                      );
                    }}
                    onTouchStart={() => queueLongPressMenu(msg.id, msg.text || "", isSelf)}
                    onTouchEnd={clearLongPress}
                    onTouchMove={clearLongPress}
                    className={`px-5 py-3 text-[14px] leading-relaxed break-words break-all overflow-x-hidden ${
                      isSelf
                        ? "bg-indigo-600 border border-indigo-500/50 text-white rounded-2xl rounded-br-sm shadow-sm"
                        : "bg-[rgba(15,15,40,0.6)] border border-indigo-500/15 text-gray-200 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none break-words break-all whitespace-pre-wrap leading-[1.6]">
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

                {normalizedAttachments.length > 0 && (
                  <div
                    onMouseEnter={() => {
                      if (!hasDesktopActions) return;
                      setActiveDesktopMenuMessageId(msg.id);
                    }}
                    onMouseLeave={() => {
                      setActiveDesktopMenuMessageId((prev) =>
                        prev === msg.id ? null : prev,
                      );
                    }}
                    className={`${isVoiceOnlyMessage ? "mt-0" : "mt-1.5"} space-y-1.5`}
                  >
                    {normalizedAttachments.map((att, i) => (
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

      {mobileActionMenu && (
        <div
          className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] md:hidden flex items-end"
          onClick={() => setMobileActionMenu(null)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-white/10 bg-[#0c0c1f] p-4 pb-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <div className="space-y-2">
              {!!mobileActionMenu.text.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    void copyMessageText(mobileActionMenu.text);
                    setMobileActionMenu(null);
                  }}
                  className="w-full text-left rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-gray-100 font-medium"
                >
                  Copy
                </button>
              )}
              {mobileActionMenu.isSelf && onUnsendMessage && (
                <button
                  type="button"
                  onClick={() => {
                    void onUnsendMessage(mobileActionMenu.messageId);
                    setMobileActionMenu(null);
                  }}
                  className="w-full text-left rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-300 font-medium"
                >
                  Unsend
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
  const kind = getAttachmentKind(attachment);

  switch (kind) {
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
        <AudioAttachmentPlayer
          src={attachment.public_url}
          type={attachment.mimetype || "audio/mpeg"}
        />
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
          {attachment.filename || "Open attachment"}
        </a>
      );
  }
}

function getAttachmentKind(attachment: {
  mimetype: string;
  filename: string;
  public_url: string;
}): "image" | "video" | "audio" | "file" {
  const mime = (attachment.mimetype || "").toLowerCase();
  const filename = (attachment.filename || "").toLowerCase();
  const urlPath = (() => {
    try {
      return new URL(attachment.public_url || "", "https://x.local").pathname.toLowerCase();
    } catch {
      return (attachment.public_url || "").toLowerCase();
    }
  })();
  const source = `${filename} ${urlPath}`;

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";

  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(source)) return "image";
  if (/\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/.test(source)) return "video";
  if (/\.(mp3|wav|ogg|m4a|aac|flac|weba|opus|amr)(\?|$)/.test(source)) return "audio";

  // Mobile voice uploads can end up as generic binary mime.
  if (
    mime.includes("octet-stream") &&
    (source.includes("audio") || source.includes("voice") || source.includes("record"))
  ) {
    return "audio";
  }

  // Favor voice-note UX for unknown media blobs unless clearly image/video.
  if (!mime || mime.includes("octet-stream") || mime.includes("application/")) {
    return "audio";
  }

  return "file";
}

function normalizeAttachment(raw: unknown): {
  mimetype: string;
  public_url: string;
  filename: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const public_url = String(
    obj.public_url ??
      obj.publicUrl ??
      obj.url ??
      obj.file_url ??
      obj.fileUrl ??
      obj.path ??
      "",
  ).trim();
  if (!public_url) return null;

  const mimetype = String(
    obj.mimetype ?? obj.mimeType ?? obj.content_type ?? obj.contentType ?? obj.type ?? "",
  ).trim();
  const filename = String(
    obj.filename ??
      obj.file_name ??
      obj.fileName ??
      obj.name ??
      obj.original_name ??
      obj.originalName ??
      "attachment",
  ).trim();

  return {
    mimetype,
    public_url,
    filename,
  };
}

function AudioAttachmentPlayer({
  src,
  type,
}: {
  src: string;
  type: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("loadeddata", onLoaded);
    audio.addEventListener("durationchange", onDuration);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("loadeddata", onLoaded);
      audio.removeEventListener("durationchange", onDuration);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;
    let rafId = 0;
    const tick = () => {
      setCurrentTime(audio.currentTime || 0);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const formatTime = (value: number) => {
    if (!Number.isFinite(value) || value < 0) return "0:00";
    const mins = Math.floor(value / 60);
    const secs = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const fallbackBars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < src.length; i += 1) seed = (seed * 31 + src.charCodeAt(i)) >>> 0;
    return Array.from({ length: 42 }).map((_, i) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const noise = (seed % 1000) / 1000;
      const wave = Math.abs(Math.sin((i + 1) * 0.62));
      return Math.max(8, Math.round(8 + wave * 16 * (0.55 + noise * 0.45)));
    });
  }, [src]);

  const waveData = useMemo(() => (peaks.length ? peaks : fallbackBars), [peaks, fallbackBars]);
  const md3WaveData = useMemo(() => {
    if (!waveData.length) return [];

    // Smooth neighboring peaks so waveform looks cleaner (MD3-like, less jagged).
    const smooth = waveData.map((v, i) => {
      const a = waveData[Math.max(0, i - 1)] ?? v;
      const b = v;
      const c = waveData[Math.min(waveData.length - 1, i + 1)] ?? v;
      const d = waveData[Math.min(waveData.length - 1, i + 2)] ?? c;
      const weighted = a * 0.18 + b * 0.44 + c * 0.28 + d * 0.1;
      return weighted;
    });

    const min = Math.min(...smooth);
    const max = Math.max(...smooth);
    const range = Math.max(1, max - min);

    return smooth.map((v, i) => {
      const normalized = (v - min) / range;
      const shaped = Math.pow(normalized, 0.95);
      // Gentle center emphasis like modern voice notes.
      const pos = i / Math.max(1, smooth.length - 1);
      const centerBoost = 0.88 + 0.18 * (1 - Math.abs(pos - 0.5) * 2);
      return 7 + shaped * 10 * centerBoost;
    });
  }, [waveData]);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || md3WaveData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const compactData = md3WaveData.filter((_, i) => i % 2 === 0);
    const barStep = width / compactData.length;
    const gap = Math.max(2.8, barStep * 0.5);
    const barWidth = Math.max(1.8, barStep - gap);

    ctx.clearRect(0, 0, width, height);

    compactData.forEach((value, index) => {
      const x = index * barStep + gap / 2;
      const barHeight = Math.max(7, Math.min(height * 0.72, value));
      const y = centerY - barHeight / 2;
      const isPlayed = (index / Math.max(1, compactData.length - 1)) * 100 <= progressPct;
      ctx.fillStyle = isPlayed ? "#8b5cf6" : "rgba(226,232,240,0.35)";
      const r = Math.min(barWidth / 2, barHeight / 2, 3);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [r, r, r, r]);
      ctx.fill();
    });
  }, [md3WaveData, progressPct]);

  useEffect(() => {
    let cancelled = false;

    const buildPeaks = async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`peak fetch failed: ${res.status}`);
        const arr = await res.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)();
        const decoded = await audioContext.decodeAudioData(arr.slice(0));
        const channel = decoded.getChannelData(0);
        const bars = 48;
        const blockSize = Math.max(1, Math.floor(channel.length / bars));
        const rawPeaks: number[] = [];

        for (let i = 0; i < bars; i += 1) {
          const start = i * blockSize;
          const end = Math.min(channel.length, start + blockSize);
          let peak = 0;
          for (let j = start; j < end; j += 1) peak = Math.max(peak, Math.abs(channel[j]));
          rawPeaks.push(peak);
        }

        const maxPeak = Math.max(0.0001, ...rawPeaks);
        const next = rawPeaks.map((p) => {
          const normalized = p / maxPeak;
          // Gamma-ish curve gives clearer separation for low-dynamic voice notes.
          const shaped = Math.pow(normalized, 0.65);
          return Math.max(8, Math.min(24, Math.round(8 + shaped * 16)));
        });

        await audioContext.close();
        if (!cancelled) setPeaks(next);
      } catch {
        if (!cancelled) setPeaks([]);
      }
    };

    void buildPeaks();
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="w-full max-w-[430px]">
      <audio ref={audioRef} preload="auto">
        <source src={src} type={type || "audio/mpeg"} />
      </audio>

      <div className="px-0 py-1">
        <div className="flex items-center gap-3 rounded-2xl bg-neutral-800/60 border border-white/10 text-gray-100 px-3.5 py-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 shrink-0 rounded-full bg-white/10 border border-white/15 text-gray-100 hover:bg-white/20 transition"
            aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="w-4 h-4" />
          </button>

          <div className="relative flex-1 h-9 min-w-0">
            <canvas
              ref={canvasRef}
              width={220}
              height={40}
              className="w-full h-9"
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                seek(pct * duration);
              }}
            />
          </div>

          <span className="tabular-nums text-[13px] font-semibold tracking-wide text-gray-300 whitespace-nowrap">
            {duration > 0 ? formatTime(Math.max(0, duration - currentTime)) : "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
}

