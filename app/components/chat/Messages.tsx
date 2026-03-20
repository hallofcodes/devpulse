import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Conversation, Message } from "../Chat";
import { timeAgo } from "@/app/utils/time";

export default function Messages({
  messages,
  user,
  conversations,
}: {
  messages: Message[];
  user: User;
  conversations: Conversation[];
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${
              msg.sender_id === user.id ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender_id !== user.id && (
              <div className="mb-5 flex justify-center items-center w-8 h-8 rounded-full bg-neutral-600">
                {conversations
                  .find((conv) => conv.id === msg.conversation_id)
                  ?.users.find((u) => u.id === msg.sender_id)
                  ?.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  msg.sender_id === user.id ? "bg-indigo-500" : "bg-neutral-700"
                }`}
              >
                {/*{msg.text}*/}
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      if (inline) {
                        return (
                          <code className="px-1 rounded font-mono" {...props}>
                            {children}
                          </code>
                        );
                      } else {
                        return (
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match ? match[1] : "text"}
                            PreTag="pre"
                            className="rounded-md text-sm"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        );
                      }
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              <div className="text-muted text-sm">{timeAgo(msg.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
