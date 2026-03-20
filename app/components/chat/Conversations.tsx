import { User } from "@supabase/supabase-js";
import { Conversation } from "../Chat";

export default function Conversations({
  conversations,
  user,
  setConversationId,
}: {
  conversations: Conversation[];
  user: User;
  setConversationId: (id: string) => void;
}) {
  return (
    <>
      {conversations.map((conv, idx) => {
        const otherUser = conv.users.find((u) => u.id !== user.id);
        return (
          <div
            key={idx}
            onClick={() => setConversationId(conv.id)}
            className="flex flex-col items-center min-w-15 cursor-pointer"
          >
            <div className="flex justify-center items-center w-12 h-12 rounded-full bg-neutral-600">
              {otherUser?.email[0].toUpperCase()}
            </div>
            <span className="text-xs mt-1">
              {otherUser?.email.split("@")[0]}
            </span>
          </div>
        );
      })}
    </>
  );
}
