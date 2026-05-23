import { User } from "@supabase/supabase-js";
import { Conversation, TypingState } from "../Chat";

export default function Conversations({
  conversations,
  user,
  conversationId,
  setConversationId,
  unreadCountByConversationId,
  onlineByUserId,
  typingByConversationId,
  showLabel = true,
}: {
  conversations: Conversation[];
  user: User;
  conversationId: string | null;
  setConversationId: (id: string) => void;
  unreadCountByConversationId?: Record<string, number>;
  onlineByUserId?: Record<string, boolean>;
  typingByConversationId?: Record<string, TypingState>;
  showLabel?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 mt-1">
      {conversations.map((conv, idx) => {
        const otherUser = conv.users.find((u) => u.id !== user.id);
        const isActive = conv.id === conversationId;
        const isGlobal = conv.type === "global";
        const unreadCount = unreadCountByConversationId?.[conv.id] ?? 0;
        const isOnline = !!otherUser?.id && !!onlineByUserId?.[otherUser.id];
        const typingState = typingByConversationId?.[conv.id];
        const isTyping = !!typingState;
        
        let label = "Global Chat";
        let sublabel = "Public Channel";
        let initials = "G";

        if (!isGlobal) {
          const name = otherUser?.email?.split("@")[0] || "Unknown";
          label = name;
          sublabel = otherUser?.email || "";
          initials = otherUser?.email?.[0]?.toUpperCase() ?? "?";
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => setConversationId(conv.id)}
            className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left ${
              isActive
                ? "bg-white/[0.05] border border-white/[0.08] shadow-sm"
                : "hover:bg-white/[0.02] border border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            <div className="relative flex-shrink-0">
              <div
                className={`flex justify-center items-center w-[38px] h-[38px] rounded-full text-[14px] font-bold transition-all border ${
                  isGlobal
                    ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                    : "bg-neutral-800 text-gray-200 border-white/10 shadow-sm"
                }`}
              >
                {initials}
              </div>
              {!isGlobal && isOnline && (
                <div className="absolute bottom-[-1px] right-0 w-2.5 h-2.5 bg-emerald-400 border-[2px] border-transparent rounded-full"></div>
              )}
            </div>

            {showLabel && (
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`text-[14px] font-semibold truncate tracking-tight ${
                      isActive ? "text-gray-100" : "text-gray-300"
                    }`}
                  >
                    {label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isGlobal && (
                      <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        All
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[12px] truncate font-medium ${
                    isTyping ? "text-indigo-300" : "text-gray-500"
                  }`}
                  title={sublabel}
                >
                  {isTyping
                    ? isGlobal
                      ? `${typingState?.label || "Someone"} is typing...`
                      : "Typing..."
                    : isGlobal
                      ? "Join the community..."
                      : isOnline
                        ? "Online"
                        : "Offline"}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

