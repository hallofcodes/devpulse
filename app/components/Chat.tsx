"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPlus } from "@fortawesome/free-solid-svg-icons";
import Conversations from "./chat/Conversations";
import Messages from "./chat/Messages";
import { toast } from "react-toastify";

export interface Conversation {
  id: string;
  users: { id: string; email: string }[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
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

const supabase = createClient();

export default function Chat({ user }: { user: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const channelRef = useRef<RealtimeChannel>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 1.5 * 6 * 16)}px`;
      // 1.5rem line-height * 6 lines * 16px per rem
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
            users: conversation_participants!inner(user_id, email)
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
          };
        });
        setConversations(convs);
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
                users:conversation_participants!inner(user_id)
              `,
            )
            .eq("id", row.conversation_id)
            .then(({ data }) => {
              if (!data || data.length === 0) return;
              const convo = data[0];
              setConversations((prev) => [
                ...prev,
                {
                  id: convo.id,
                  users: convo.users.map((u) => ({
                    id: u.user_id,
                    email: row.email,
                  })),
                },
              ]);
            });
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user.id]);

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
        setMessages(data);
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

  const createConversation = async (otherUser: ChatUser) => {
    if (creatingConversation) return;

    setCreatingConversation(true);
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
      },
    ]);
    setCreatingConversation(false);
    setShowModal(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text: input.slice(0, 1000), // limit to 1000 chars
    });

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex gap-4 overflow-x-auto border-b border-neutral-700">
        <button
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center min-w-15"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faPlus} className="text-white" />
          </div>
          <span className="text-xs mt-1">New</span>
        </button>

        <Conversations
          conversations={conversations}
          user={user}
          setConversationId={setConversationId}
        />
      </div>

      {conversationId ? (
        <>
          <Messages
            messages={messages}
            user={user}
            conversations={conversations}
            bottomRef={bottomRef}
          />

          <div className="p-4 border-t border-neutral-700">
            <div className="bg-neutral-800 rounded flex">
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
                className="flex-1 px-4 py-2 outline-none resize-none overflow-auto bg-neutral-800"
                placeholder="Message..."
                rows={1}
                style={{
                  lineHeight: "1.5rem",
                  maxHeight: "calc(1.5rem * 6)",
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-500 px-4 rounded max-h-12"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-white" />
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
              className="w-full mb-3 px-3 py-2 rounded bg-neutral-800 outline-none"
            />
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
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
