"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faPaperPlane,
  faPlus,
  faSearch,
  faInfoCircle,
  faBellSlash,
  faChevronDown,
  faChevronUp,
  faXmark,
  faChevronLeft,
  faTrash,
  faPlay
} from "@fortawesome/free-solid-svg-icons";
import Conversations from "./chat/Conversations";
import Messages from "./chat/Messages";
import MediaViewerModal, { type MediaViewerPayload } from "./chat/MediaViewerModal";
import { useActiveConversationStream } from "./chat/hooks/useActiveConversationStream";
import { useChatAttachmentInput } from "./chat/hooks/useChatAttachmentInput";
import { useChatBadWords } from "./chat/hooks/useChatBadWords";
import { useChatBadges } from "./chat/hooks/useChatBadges";
import { useChatConversationActions } from "./chat/hooks/useChatConversationActions";
import { useChatConversationsRealtime } from "./chat/hooks/useChatConversationsRealtime";
import { useChatInputBehavior } from "./chat/hooks/useChatInputBehavior";
import { useChatMessageComposer } from "./chat/hooks/useChatMessageComposer";
import { useChatPresence } from "./chat/hooks/useChatPresence";
import { useChatTyping } from "./chat/hooks/useChatTyping";
import { useChatUserPicker } from "./chat/hooks/useChatUserPicker";
import Image from "next/image";
import { toast } from "react-toastify";

export interface Conversation {
  id: string;
  users: { id: string; email: string }[];
  type: string;
  created_at?: string;
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
  optimistic?: boolean;
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

interface ParticipantPresence {
  last_seen_at: string | null;
  last_read_at: string | null;
}

export interface TypingState {
  user_id: string;
  label: string;
}

const GLOBAL_CONVERSATION_ID = "00000000-0000-0000-0000-000000000001";
const ONLINE_TIMEOUT_MS = 2 * 60 * 1000;
const MAX_PRESENCE_FUTURE_SKEW_MS = 30_000;
const PRESENCE_HEARTBEAT_MS = 45_000;
const READ_RECEIPT_THROTTLE_MS = 1_500;
const TYPING_INACTIVE_TIMEOUT_MS = 1_800;
const TYPING_REMOTE_EXPIRE_MS = 2_500;
const PRESENCE_UNSEEN_AT_ISO = "1970-01-01T00:00:00.000Z";

const supabase = createClient();

export default function Chat({ user }: { user: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [unreadCountByConversationId, setUnreadCountByConversationId] = useState<
    Record<string, number>
  >({});
  const [, setParticipantMetaByConversationId] = useState<
    Record<string, ParticipantPresence>
  >({});
  const conversationIdsRef = useRef<Set<string>>(new Set());
  const activeConversationIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [dmSortOrder, setDmSortOrder] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [isDmSortOpen, setIsDmSortOpen] = useState(false);
  const creatingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<MediaViewerPayload | null>(
    null,
  );
  const lastReadSyncAtRef = useRef<Record<string, number>>({});

  const {
    setLastSeenByUserId,
    onlineByUserId,
    fetchUnreadCountsForConversations,
    markConversationAsRead,
  } = useChatPresence({
    supabase,
    userId: user.id,
    onlineTimeoutMs: ONLINE_TIMEOUT_MS,
    maxPresenceFutureSkewMs: MAX_PRESENCE_FUTURE_SKEW_MS,
    presenceHeartbeatMs: PRESENCE_HEARTBEAT_MS,
    readReceiptThrottleMs: READ_RECEIPT_THROTTLE_MS,
    setParticipantMetaByConversationId,
    setUnreadCountByConversationId,
    lastReadSyncAtRef,
  });

  const {
    typingByConversationId,
    setRemoteTypingState,
    stopTyping,
    markTypingFromInput,
  } = useChatTyping({
    channelRef,
    userId: user.id,
    userEmail: user.email ?? "",
    typingInactiveTimeoutMs: TYPING_INACTIVE_TIMEOUT_MS,
    typingRemoteExpireMs: TYPING_REMOTE_EXPIRE_MS,
  });

  const {
    attachments,
    setAttachments,
    isDraggingOver,
    handleFileChange,
    handleDrop,
    handleDragOver,
    onDragLeave,
    handlePaste,
    removeAttachment,
  } = useChatAttachmentInput();

  const { search, setSearch, allUsers, filteredUsers } = useChatUserPicker({
    supabase,
    userId: user.id,
    showModal,
    globalConversationId: GLOBAL_CONVERSATION_ID,
  });

  const { badgesByUserId } = useChatBadges({
    supabase,
    userId: user.id,
    conversations,
  });

  const { badWords } = useChatBadWords();

  useEffect(() => {
    conversationIdsRef.current = new Set(conversations.map((conv) => conv.id));
  }, [conversations]);

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  useChatConversationsRealtime({
    supabase,
    userId: user.id,
    userEmail: user.email ?? "",
    globalConversationId: GLOBAL_CONVERSATION_ID,
    conversationIdsRef,
    activeConversationIdRef,
    setConversations,
    setParticipantMetaByConversationId,
    setLastSeenByUserId,
    fetchUnreadCountsForConversations,
    markConversationAsRead,
  });

  useActiveConversationStream({
    supabase,
    conversationId,
    userId: user.id,
    channelRef,
    bottomRef,
    setMessages,
    markConversationAsRead,
    setRemoteTypingState,
    stopTyping,
  });

  const {
    createConversation,
    openPrivateChatFromGlobalProfile,
    handleDeleteConversation,
  } = useChatConversationActions({
    supabase,
    userId: user.id,
    userEmail: user.email,
    conversationId,
    conversations,
    creatingRef,
    unseenPresenceIso: PRESENCE_UNSEEN_AT_ISO,
    setConversationId,
    setShowModal,
    setShowRightSidebar,
    setConversations,
    setUnreadCountByConversationId,
    setParticipantMetaByConversationId,
  });

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "";

  const { sendMessage, isSendingMessage } = useChatMessageComposer({
    supabase,
    userId: user.id,
    channelRef,
    conversationId,
    input,
    attachments,
    badWords,
    bucketName,
    bottomRef,
    setInput,
    setAttachments,
    setMessages,
    stopTyping,
    markConversationAsRead,
  });

  const { textareaRef, handleInputChange, handleInputKeyDown } =
    useChatInputBehavior({
      input,
      isSendingMessage,
      conversationId,
      attachmentsCount: attachments.length,
      setInput,
      markTypingFromInput,
      sendMessage,
      maxChars: 1000,
    });

  const canSendMessage =
    !isSendingMessage && (input.trim().length > 0 || attachments.length > 0);

  const globalConversations = conversations.filter((c) => c.type === "global");
  const privateConversations = conversations
    .filter((c) => c.type !== "global")
    .sort((a, b) => {
      if (dmSortOrder === "newest") {
        return (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0);
      }
      if (dmSortOrder === "oldest") {
        return (a.created_at ? new Date(a.created_at).getTime() : 0) - (b.created_at ? new Date(b.created_at).getTime() : 0);
      }
      
      const aName = a.users.find((u) => u.id !== user.id)?.email?.split("@")[0] || "";
      const bName = b.users.find((u) => u.id !== user.id)?.email?.split("@")[0] || "";
      
      if (dmSortOrder === "az") {
        return aName.localeCompare(bName);
      }
      if (dmSortOrder === "za") {
        return bName.localeCompare(aName);
      }
      return 0;
    });

  const activeConversation = conversations.find((c) => c.id === conversationId);
  const activeOtherUser = activeConversation?.users.find((u) => u.id !== user.id);
  const isGlobalActive = activeConversation?.type === "global";
  const activeOtherUserOnline =
    !!activeOtherUser?.id && !!onlineByUserId[activeOtherUser.id];
  const activeTypingState = conversationId
    ? typingByConversationId[conversationId]
    : undefined;
  
  const activeLabel = isGlobalActive 
    ? "Global Chat" 
    : activeOtherUser?.email?.split("@")[0] || "Unknown";
  
  const activeSublabel = isGlobalActive 
    ? "Public Channel"
    : activeOtherUserOnline
      ? "Online"
      : "Offline";

  const activeSublabelClass = activeOtherUserOnline || isGlobalActive
    ? "text-emerald-400"
    : "text-gray-500";

  const typingIndicatorText = activeTypingState
    ? isGlobalActive
      ? `${activeTypingState.label} is typing...`
      : "Typing..."
    : "";

  const activeInitials = isGlobalActive 
    ? "G" 
    : activeOtherUser?.email?.[0]?.toUpperCase() ?? "?";

  const allMediaAttachments = useMemo(() => {
    return messages
      .flatMap((m) => m.attachments || [])
      .filter(
        (a) =>
          a?.mimetype?.startsWith("image/") || a?.mimetype?.startsWith("video/"),
      )
      .reverse();
  }, [messages]);

  // Performance optimization: Memoize the filtered messages to avoid O(N) string manipulation on every keystroke
  // when typing a message (which triggers a re-render of Chat.tsx). This significantly improves typing latency
  // in conversations with many messages.
  const filteredMessages = useMemo(() => {
    if (!messageSearch) return messages;
    const lowerSearch = messageSearch.toLowerCase();
    return messages.filter((m) => (m.text || "").toLowerCase().includes(lowerSearch));
  }, [messages, messageSearch]);

  return (
    <>
      <MediaViewerModal
        viewer={mediaViewer}
        attachments={allMediaAttachments}
        onChange={setMediaViewer}
      />
    <div className="flex h-screen w-full bg-transparent text-white overflow-hidden relative">
      
      {/* Left Sidebar */}
      <div className={`w-full md:w-[300px] flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0a0a1a] md:bg-transparent z-20 absolute md:relative h-full transition-transform duration-300 ${conversationId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-100 tracking-tight">Message category</h2>
            <button
              onClick={() => setShowModal(true)}
              className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500/20 transition"
              title="New conversation"
            >
              <FontAwesomeIcon icon={faPlus} className="text-indigo-400 w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input
              id="message-search"
              type="text"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder="Search Message..."
              className="w-full bg-[rgba(10,10,30,0.6)] border border-transparent rounded-xl py-2 pl-9 pr-4 text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:border-indigo-500/50 transition-colors shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 mb-2 tracking-wider">ROOMS</h3>
            <Conversations
              conversations={globalConversations}
              user={user}
              conversationId={conversationId}
              setConversationId={setConversationId}
              unreadCountByConversationId={unreadCountByConversationId}
              onlineByUserId={onlineByUserId}
              typingByConversationId={typingByConversationId}
              showLabel={true}
            />
          </div>

          <div>
            <div className="flex justify-between items-center px-2 mb-2 relative">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DIRECT MESSAGE</h3>
              <div className="relative">
                <span
                  onClick={() => setIsDmSortOpen(!isDmSortOpen)}
                  className="text-[10px] text-gray-500 bg-[rgba(10,10,30,0.6)] px-2 py-0.5 rounded cursor-pointer hover:bg-white/5 flex items-center gap-1 select-none"
                >
                  {dmSortOrder === "newest" && "Newest"}
                  {dmSortOrder === "oldest" && "Oldest"}
                  {dmSortOrder === "az" && "A-Z"}
                  {dmSortOrder === "za" && "Z-A"}
                  <FontAwesomeIcon icon={isDmSortOpen ? faChevronUp : faChevronDown} className="w-2 h-2 ml-1" />
                </span>
                
                {isDmSortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-24 bg-[#0F0F23]/95 backdrop-blur-xl border border-white/10 rounded-md shadow-xl overflow-hidden z-[100] py-1 text-xs">
                    <button
                      onClick={() => { setDmSortOrder("newest"); setIsDmSortOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${dmSortOrder === "newest" ? "text-indigo-400 bg-white/5" : "text-gray-300"}`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => { setDmSortOrder("oldest"); setIsDmSortOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${dmSortOrder === "oldest" ? "text-indigo-400 bg-white/5" : "text-gray-300"}`}
                    >
                      Oldest
                    </button>
                    <button
                      onClick={() => { setDmSortOrder("az"); setIsDmSortOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${dmSortOrder === "az" ? "text-indigo-400 bg-white/5" : "text-gray-300"}`}
                    >
                      A-Z
                    </button>
                    <button
                      onClick={() => { setDmSortOrder("za"); setIsDmSortOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${dmSortOrder === "za" ? "text-indigo-400 bg-white/5" : "text-gray-300"}`}
                    >
                      Z-A
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Conversations
              conversations={privateConversations}
              user={user}
              conversationId={conversationId}
              setConversationId={setConversationId}
              unreadCountByConversationId={unreadCountByConversationId}
              onlineByUserId={onlineByUserId}
              typingByConversationId={typingByConversationId}
              showLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Middle Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative bg-white/[0.01] ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {conversationId ? (
          <>
            {/* Header */}
            <div className="h-[72px] flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-white/[0.01] z-10 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3.5">
                <button 
                  onClick={() => setConversationId(null)}
                  className="md:hidden w-9 h-9 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <div className={`flex justify-center items-center w-11 h-11 rounded-full text-[16px] font-bold shadow-sm ${isGlobalActive ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" : "bg-neutral-800 text-gray-200 border border-white/10"}`}>
                    {activeInitials}
                  </div>
                  {!isGlobalActive && activeOtherUserOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-[2px] border-transparent rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-gray-100 leading-tight">{activeLabel}</h2>
                  <p className={`text-xs font-medium ${activeSublabelClass}`}>{activeSublabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowRightSidebar(!showRightSidebar)}
                  className={`w-9 h-9 rounded-full ${showRightSidebar ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/[0.02] text-gray-400 border-white/5'} border hover:bg-white/10 flex items-center justify-center transition`}
                  title="Toggle Info"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden z-10 min-h-0">
              <Messages
                messages={filteredMessages}
                user={user}
                conversations={conversations}
                bottomRef={bottomRef}
                badgesByUserId={badgesByUserId}
                onUserProfileClick={openPrivateChatFromGlobalProfile}
              />
            </div>

            {activeTypingState && (
              <div className="px-4 pb-1.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[12px] text-indigo-300">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse [animation-delay:300ms]" />
                  </div>
                  <span className="font-medium">{typingIndicatorText}</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01] z-10 flex-shrink-0 pb-6 w-full">
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 px-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="bg-neutral-800/80 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
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
                        <FontAwesomeIcon icon={faFile} className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="truncate max-w-[120px] text-gray-200 font-medium">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md px-1.5 py-0.5 ml-1 transition"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div
                onPaste={handlePaste}
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={onDragLeave}
                className={`${
                  isDraggingOver 
                    ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10" 
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 focus-within:border-indigo-500/50 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                } transition-all duration-300 rounded-[24px] border flex items-end gap-2 p-2 shadow-sm backdrop-blur-md`}
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSendingMessage}
                  className="w-10 h-10 mb-[2px] rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center transition-all duration-300 flex-shrink-0 group"
                  title="Attach file"
                >
                  <div className="w-[28px] h-[28px] rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-300 text-gray-400 transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                  </div>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />

                <div className="flex-1 py-[11px]">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="w-full block outline-none resize-none overflow-y-auto bg-transparent text-gray-100 placeholder:text-gray-500/80 leading-relaxed max-h-[150px] text-[15px] pt-0 pb-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
                    placeholder="Type a message..."
                    rows={1}
                  />
                </div>

                <div className="mb-[2px] pr-1">
                  <button
                    onClick={sendMessage}
                    disabled={!canSendMessage}
                    className={`h-10 px-5 rounded-[20px] font-semibold text-[14px] flex items-center gap-2.5 transition-all duration-300 flex-shrink-0
                      ${canSendMessage
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-md shadow-indigo-500/25 active:scale-95" 
                        : "bg-white/5 text-gray-500 cursor-not-allowed"}
                    `}
                  >
                    <span className="hidden sm:inline">
                      {isSendingMessage ? "Sending..." : "Send"}
                    </span>
                    <FontAwesomeIcon icon={faPaperPlane} className={`w-[14px] h-[14px] transition-transform ${canSendMessage ? "translate-x-0.5" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center h-full">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
              <FontAwesomeIcon icon={faPaperPlane} className="w-6 h-6" />
            </div>
            <p className="text-gray-200 text-lg font-bold mb-2">
              It&apos;s quiet here
            </p>
            <p className="text-gray-500 text-sm max-w-sm">
              Select a conversation from the left sidebar or start a new one to begin chatting.
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      {conversationId && (
        <div className={`w-full sm:w-[320px] flex-shrink-0 border-l border-white/5 flex flex-col absolute right-0 top-0 bottom-0 h-full z-40 bg-[rgba(10,10,30,0.95)] md:bg-[#0a0a1a] xl:bg-transparent xl:relative xl:transform-none transition-transform duration-300 ${showRightSidebar ? 'translate-x-0' : 'translate-x-full xl:translate-x-0 xl:hidden'}`}>
          <div className="absolute top-4 right-4 xl:hidden">
            <button onClick={() => setShowRightSidebar(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white">
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center p-8 border-b border-transparent">
            <div className={`flex justify-center items-center w-[100px] h-[100px] rounded-full text-4xl font-bold mb-5 shadow-lg ${isGlobalActive ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-neutral-800 text-gray-200 border border-white/10"}`}>
              {activeInitials}
            </div>
            <h2 className="text-[18px] font-bold text-gray-100 tracking-tight">{activeLabel}</h2>
            <p className="text-[13px] text-gray-500 font-medium mt-1">{isGlobalActive ? "Community channel" : activeOtherUser?.email}</p>
            
            <div className="flex items-center gap-3 mt-6 w-full justify-center">
              <button onClick={() => { const input = document.getElementById("message-search"); if(input) { input.focus(); } }} className="w-11 h-11 rounded-2xl bg-[rgba(10,10,30,0.6)] flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-white/5 transition shadow-sm" title="Search Message">
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
              </button>
              <button disabled={isGlobalActive} onClick={handleDeleteConversation} className={`w-11 h-11 rounded-2xl bg-[rgba(10,10,30,0.6)] flex items-center justify-center text-gray-400 hover:bg-white/5 transition shadow-sm ${isGlobalActive ? "opacity-50 cursor-not-allowed" : "hover:text-red-400"}`} title="Delete Conversation">
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
              <button onClick={() => toast.info("Channel info")} className="w-11 h-11 rounded-2xl bg-[rgba(10,10,30,0.6)] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition shadow-sm" title="Info">
                <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
              </button>
              <button onClick={() => toast.success("Notifications muted")} className="w-11 h-11 rounded-2xl bg-[rgba(10,10,30,0.6)] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition shadow-sm" title="Mute">
                <FontAwesomeIcon icon={faBellSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30 border-t border-white/5">
            <div>
              <div className="flex items-center justify-between cursor-pointer group mb-4">
                <h3 className="text-[14px] font-semibold text-gray-300 group-hover:text-white transition tracking-wide">Shared Media</h3>
                <FontAwesomeIcon icon={faChevronDown} className="text-gray-500 w-3.5 h-3.5 group-hover:text-gray-300 transition" />
              </div>
              
              {allMediaAttachments.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {allMediaAttachments.slice(0, showAllMedia ? undefined : 9).map((att, i) => (
                      <div key={i} className="aspect-square bg-neutral-900 rounded-xl overflow-hidden border border-transparent shadow-sm relative group cursor-pointer" onClick={() => setMediaViewer({ type: att.mimetype?.startsWith("video/") ? "video" : "image", url: att.public_url, filename: att.filename || "Media" })}>
                        {att.mimetype?.startsWith("video/") ? (
                          <>
                            <video
                              src={att.public_url}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300 pointer-events-none"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faPlay} className="w-3 h-3 text-white ml-0.5" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <Image
                            src={att.public_url}
                            alt={att.filename || "Media"}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300 pointer-events-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {allMediaAttachments.length > 9 && !showAllMedia && (
                    <button 
                      onClick={() => setShowAllMedia(true)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[13px] font-bold hover:from-indigo-400 hover:to-violet-400 transition shadow-sm"
                    >
                      View All ({allMediaAttachments.length})
                    </button>
                  )}
                  {showAllMedia && (
                    <button 
                      onClick={() => setShowAllMedia(false)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-[13px] font-bold hover:bg-white/10 transition shadow-sm"
                    >
                      Show Less
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-white/[0.02] rounded-xl border border-indigo-500/15 border-dashed">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <FontAwesomeIcon icon={faFile} className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">No media shared yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="glass-card w-[400px] p-6">
            <h3 className="text-lg font-bold text-white mb-4">New Message</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full mb-4 px-4 py-2.5 input-field"
            />

            {allUsers.length == 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-gray-500 text-sm">No users found.</p>
              </div>
            )}

            <div className="space-y-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 pr-1">
              {filteredUsers
                .map((u, idx) => (
                  <div
                    key={idx}
                    onClick={() => createConversation(u)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="flex justify-center items-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold shadow-sm">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div className="w-full flex flex-col">
                      <span className="text-sm font-semibold text-gray-200">{u.email.split("@")[0]}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-end mt-5 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-semibold rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}



