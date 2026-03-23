import { User } from "@supabase/supabase-js";
import { Conversation } from "../Chat";

export default function Conversations({
  conversations,
  user,
  conversationId,
  setConversationId,
  showLabel = true,
}: {
  conversations: Conversation[];
  user: User;
  conversationId: string | null;
  setConversationId: (id: string) => void;
  showLabel?: boolean;
}) {
  return (
    <>
      {conversations.map((conv, idx) => {
        const otherUser = conv.users.find((u) => u.id !== user.id);
        const isActive = conv.id === conversationId;
        const isGlobal = conv.type === "global";
        const label = isGlobal
          ? "Global"
          : (() => {
              const name = otherUser?.email?.split("@")[0] || "";
              return name.length > 10 ? name.slice(0, 8) + "…" : name;
            })();

        return (
          <button
            key={idx}
            type="button"
            onClick={() => setConversationId(conv.id)}
            title={label}
            className={`flex flex-col items-center gap-0.5 cursor-pointer select-none transition-opacity ${
              isActive ? "opacity-100" : "opacity-60 hover:opacity-90"
            }`}
          >
            <div
              className={`flex justify-center items-center w-8 h-8 rounded-full text-[13px] font-semibold transition-all border ${
                isActive
                  ? "bg-indigo-500 text-white border-indigo-400/60 shadow-sm shadow-indigo-500/20"
                  : isGlobal
                    ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/40"
                    : "bg-neutral-700/60 text-gray-300 border-white/10 hover:bg-neutral-700"
              }`}
            >
              {isGlobal ? "G" : otherUser?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span
              className={`text-[10px] leading-tight max-w-[44px] truncate min-h-[14px] ${
                isActive
                  ? "text-white"
                  : isGlobal
                    ? "text-indigo-300"
                    : "text-gray-400"
              } ${showLabel ? "opacity-100" : "opacity-0"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </>
  );
}
