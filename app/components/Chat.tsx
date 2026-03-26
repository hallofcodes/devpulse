"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faPaperPlane,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Conversations from "./chat/Conversations";
import Messages from "./chat/Messages";
import Image from "next/image";
import { toast } from "react-toastify";

export interface Conversation {
  id: string;
  users: { id: string; email: string }[];
  type: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  attachments: {
    filename: string;
    mimetype: string;
    filesize: number;
    public_url: string;
  }[];
  created_at: string;
}

export interface ChatUser {
  user_id: string;
  email: string;
}

export interface ConversationParticipant {
  id: string;
  users: {
    user_id: string;
  }[];
}

export interface ConversationParticipantRow {
  email: string;
  conversation: ConversationParticipant[];
}

type Attachment = File;

const supabase = createClient();

export default function Chat({ user }: { user: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [badgesByUserId, setBadgesByUserId] = useState<
    Record<string, { label: string; className: string }>
  >({});
  const badgeCacheRef = useRef<
    Record<string, { label: string; className: string }>
  >({});
  const channelRef = useRef<RealtimeChannel>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [badWords, setBadWords] = useState<string[]>([]);
  const creatingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "";

  const globalConversations = conversations.filter((c) => c.type === "global");
  const privateConversations = conversations.filter((c) => c.type !== "global");

  const getBadgeInfoFromHours = (hours: number) => {
    if (hours >= 160)
      return {
        label: "MISSION IMPOSSIBLE",
        className:
          "bg-gradient-to-r from-fuchsia-500/20 via-pink-500/40 to-fuchsia-500/20 border-fuchsia-500/60 text-fuchsia-200",
      };
    if (hours >= 130)
      return {
        label: "GOD LEVEL",
        className:
          "bg-gradient-to-r from-fuchsia-500/20 via-pink-400/40 to-fuchsia-500/20 border-fuchsia-400/60 text-fuchsia-200",
      };
    if (hours >= 100)
      return {
        label: "STARLIGHT",
        className:
          "bg-gradient-to-r from-sky-500/15 via-cyan-400/35 to-sky-500/15 border-sky-400/50 text-cyan-200",
      };
    if (hours >= 50)
      return {
        label: "ELITE",
        className:
          "bg-gradient-to-r from-rose-500/15 via-red-400/35 to-rose-500/15 border-red-400/50 text-rose-200",
      };
    if (hours >= 20)
      return {
        label: "PRO",
        className:
          "bg-gradient-to-r from-indigo-500/15 via-violet-500/35 to-indigo-500/15 border-indigo-400/50 text-indigo-200",
      };
    if (hours >= 5)
      return {
        label: "NOVICE",
        className:
          "bg-gradient-to-r from-emerald-500/15 via-green-400/35 to-emerald-500/15 border-emerald-400/45 text-emerald-200",
      };
    if (hours >= 1)
      return {
        label: "NEWBIE",
        className:
          "bg-gradient-to-r from-lime-500/15 via-yellow-400/35 to-lime-500/15 border-lime-400/45 text-lime-200",
      };

    return {
      label: "NONE",
      className: "bg-white/[0.03] border-white/10 text-gray-300",
    };
  };

  useEffect(() => {
    const fetchBadgesForParticipants = async () => {
      if (!conversations.length) return;

      const participantIds = new Set<string>();
      conversations.forEach((c) => {
        c.users.forEach((u) => {
          if (u.id) participantIds.add(u.id);
        });
      });
      participantIds.add(user.id);

      const ids = Array.from(participantIds).filter(Boolean);
      if (ids.length === 0) return;

      const cached: Record<string, { label: string; className: string }> = {};
      const missingIds: string[] = [];
      ids.forEach((id) => {
        const hit = badgeCacheRef.current[id];
        if (hit) cached[id] = hit;
        else missingIds.push(id);
      });

      if (Object.keys(cached).length > 0) {
        setBadgesByUserId((prev) => ({ ...prev, ...cached }));
      }

      if (missingIds.length === 0) return;

      const { data } = await supabase
        .from("top_user_stats")
        .select("user_id, email, total_seconds")
        .in("user_id", missingIds);

      if (!data) return;

      const next: Record<string, { label: string; className: string }> = {};
      for (const row of data) {
        if (!row.user_id || row.total_seconds === null) continue;
        const hours = Math.round((row.total_seconds || 0) / 3600);
        const badge = getBadgeInfoFromHours(hours);
        next[row.user_id] = { label: badge.label, className: badge.className };
      }

      badgeCacheRef.current = { ...badgeCacheRef.current, ...next };
      setBadgesByUserId((prev) => ({ ...prev, ...next }));
    };

    fetchBadgesForParticipants();
  }, [conversations, user.id]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/refs/heads/master/en",
    )
      .then((res) => res.text())
      .then((text) => {
        const wordsArray = text.split("\n").filter(Boolean);
        setBadWords(wordsArray);
      });
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const minHeight = 20;
      const maxHeight = minHeight * 6;
      el.style.height = `${minHeight}px`;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [input]);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation: conversations(
            id,
            users: conversation_participants!inner(user_id, email),
            type
          )
          `,
        )
        .eq("user_id", user.id);

      if (data) {
        const convs: Conversation[] = (data ?? []).map((row) => {
          const convo = Array.isArray(row.conversation)
            ? row.conversation[0]
            : row.conversation;

          return {
            id: convo.id,
            users: convo.users.map((u: { user_id: string; email: string }) => ({
              id: u.user_id,
              email: u.email,
            })),
            type: convo.type,
          };
        });

        const sortedConvs = convs.sort((a, b) =>
          a.type === "global" ? -1 : b.type === "global" ? 1 : 0,
        );
        setConversations(sortedConvs);
      }
    };
    fetchConversations();
  }, [user.id]);

  useEffect(() => {
    if (!user.id) return;

    const channel = supabase
      .channel(`conversations-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
        },
        (payload) => {
          const row = payload.new;
          if (row.user_id === user.id) return;

          supabase
            .from("conversations")
            .select(
              `
                id,
                users:conversation_participants!inner(user_id),
                type
              `,
            )
            .eq("id", row.conversation_id)
            .then(({ data }) => {
              if (!data || data.length === 0) return;
              const convo = data[0];
              if (
                !convo.users.some(
                  (u: { user_id: string }) => u.user_id === user.id,
                )
              )
                return;
              if (conversations.some((c) => c.id === convo.id)) return;

              setConversations((prev) => [
                ...prev,
                {
                  id: convo.id,
                  users: convo.users.map((u) => ({
                    id: u.user_id,
                    email: row.email,
                  })),
                  type: convo.type,
                },
              ]);
            });
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user.id, conversations]);

  useEffect(() => {
    if (!conversationId) return;

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [
            ...prev,
            {
              id: payload.new.id,
              conversation_id: payload.new.conversation_id,
              sender_id: payload.new.sender_id,
              text: payload.new.text,
              attachments: payload.new.attachments,
              created_at: payload.new.created_at,
            },
          ]);
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      )
      .subscribe();

    channelRef.current = channel;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data as Message[]);
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    fetchMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!showModal) return;

    const fetchUsers = async () => {
      const { data } = await supabase
        .from("top_user_stats")
        .select("user_id, email")
        .neq("user_id", user.id);
      if (data) {
        const users: ChatUser[] = data.filter(
          (u): u is { user_id: string; email: string } =>
            u.user_id !== null && u.email !== null,
        );

        setAllUsers(users);
      }
    };

    fetchUsers();
  }, [showModal, user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sanitizeInput = (input: string) => {
    if (!badWords.length) return input;

    const filter = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
    return input.replace(filter, "*-?;[]");
  };

  const createConversation = async (otherUser: ChatUser) => {
    if (creatingRef.current) return;
    creatingRef.current = true;

    const existing = conversations.find((conv) =>
      conv.users.some((u) => u.id === otherUser.user_id),
    );
    if (existing) {
      setConversationId(existing.id);
      setShowModal(false);
      return;
    }

    const { data: convData } = await supabase
      .from("conversations")
      .insert({})
      .select("*")
      .single();

    if (!convData) return;

    const convId = convData.id;

    await supabase.from("conversation_participants").upsert(
      [
        {
          conversation_id: convId,
          user_id: user.id,
          email: user.email,
        },
        {
          conversation_id: convId,
          user_id: otherUser.user_id,
          email: otherUser.email,
        },
      ],
      {
        onConflict: "conversation_id,user_id",
      },
    );

    setConversationId(convId);
    setConversations((prev) => [
      ...prev,
      {
        id: convId,
        users: [
          { id: user.id, email: user.email ?? "" },
          { id: otherUser.user_id, email: otherUser.email ?? "" },
        ],
        type: "private",
      },
    ]);

    setShowModal(false);
    creatingRef.current = false;
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || !conversationId) return;

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

          const filePath = `messages/${conversationId}/${Date.now()}-${file.name}`;

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

      const validAttachments = uploadedAttachments.filter(Boolean);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        text: sanitizeInput(input.slice(0, 1000)),
        attachments: validAttachments,
      });

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      setInput("");
      setAttachments([]);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-stretch gap-3 px-3 py-2 border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex-shrink-0 min-w-0">
          <Conversations
            conversations={globalConversations}
            user={user}
            conversationId={conversationId}
            setConversationId={setConversationId}
            showLabel={true}
          />
        </div>

        <div className="w-px self-stretch bg-white/[0.08] flex-shrink-0 my-1" />

        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex gap-2 items-start">
            <Conversations
              conversations={privateConversations}
              user={user}
              conversationId={conversationId}
              setConversationId={setConversationId}
              showLabel={true}
            />
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 self-center w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/25 transition"
          title="New conversation"
        >
          <FontAwesomeIcon icon={faPlus} className="text-indigo-300 w-3 h-3" />
        </button>
      </div>

      {conversationId ? (
        <>
          <Messages
            messages={messages}
            user={user}
            conversations={conversations}
            bottomRef={bottomRef}
            badgesByUserId={badgesByUserId}
          />

          <div className="sticky bottom-0 z-20 p-3 border-t border-neutral-700 bg-[#0a0a1a]/70 backdrop-blur-md">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="bg-neutral-900/40 border border-white/10 text-xs px-2 py-1 rounded-full flex items-center gap-2"
                  >
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded object-cover border border-white/10"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faFile}
                        className="w-4 h-4 text-gray-400"
                      />
                    )}
                    <span className="truncate max-w-[110px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300 rounded px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-neutral-900/35/80 backdrop-blur-sm flex items-center gap-1 px-2 py-0.5 pr-0.5 shadow-[0_6px_18px_rgba(0,0,0,0.22)] overflow-hidden">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 outline-none resize-none overflow-y-auto bg-transparent text-gray-100 placeholder:text-gray-500 px-1 py-0.5 leading-5 max-h-[150px]"
                placeholder="Message..."
                rows={1}
                style={{
                  lineHeight: "1.25rem",
                  maxHeight: "calc(1.25rem * 6)",
                }}
              />

              <button onClick={() => fileInputRef.current?.click()}>
                <FontAwesomeIcon
                  icon={faFile}
                  className="text-gray-500 hover:text-gray-200 transition p-1.5 rounded-xl hover:bg-white/5"
                />
              </button>

              <button
                onClick={sendMessage}
                className="h-9 w-10 rounded-r-xl rounded-l-lg bg-gradient-to-br from-indigo-500 to-violet-500 border border-indigo-300/25 flex items-center justify-center hover:brightness-110 transition shadow-[0_6px_14px_rgba(99,102,241,0.3)]"
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="text-white text-[13px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center h-full">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-500 shadow-inner">
            <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
          </div>
          <p className="text-gray-300 text-[15px] font-bold mb-1.5 tracking-tight">
            No Conversation Selected
          </p>
          <p className="text-gray-500 text-xs max-w-50 leading-relaxed">
            Select a conversation from the top or start a new one.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="glass-card p-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full mb-3 px-3 py-2 bg-transparent text-gray-100 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
            />

            {allUsers.length == 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-400">No users found.</p>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allUsers
                .filter((u) =>
                  u.email.toLowerCase().includes(search.toLowerCase()),
                )
                .map((u, idx) => (
                  <div
                    key={idx}
                    onClick={() => createConversation(u)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <div className="flex justify-center items-center w-10 h-8 rounded-full bg-neutral-600">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div className="w-full">
                      <span>{u.email.split("@")[0]}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 btn-secondary px-4 py-2 text-sm rounded-xl me-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
