"use client";

import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Conversation, Message } from "../Chat";
import { timeAgo } from "@/app/utils/time";
import { useEffect, useState } from "react";
import Image from "next/image";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  return (
    <>
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

          const badgePillClass = isSelf
            ? `bg-indigo-500/10 text-indigo-200 ring-1 ${rankBorder.border} ${rankBorder.ring}`
            : badge?.className ?? "bg-white/[0.03] border-white/10 text-gray-400";

          // long msg = avatar up a lil, no cap.
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
                            return (
                              <SyntaxHighlighter
                                style={atomDark as { [key: string]: React.CSSProperties }}
                                language={match ? match[1] : "text"}
                                PreTag="pre"
                                className="rounded-xl text-xs border border-white/10 !bg-neutral-900/60"
                                {...(props as Record<string, unknown>)}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
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
                      <div key={i}>{getAttachments(att)}</div>
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

function getAttachments(attachment: {
  mimetype: string;
  public_url: string;
  filename: string;
}) {
  switch (attachment.mimetype.split("/")[0]) {
    case "image":
      return (
        <Image
          src={attachment.public_url}
          alt={attachment.filename}
          className="max-w-full rounded-xl border border-white/10"
          width={320}
          height={240}
        />
      );
    case "video":
      return (
        <video controls className="max-w-full rounded-xl border border-white/10">
          <source src={attachment.public_url} type={attachment.mimetype} />
        </video>
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
