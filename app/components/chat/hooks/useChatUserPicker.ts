"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import type { ChatUser } from "@/app/components/Chat";

type UseChatUserPickerParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  showModal: boolean;
  globalConversationId: string;
};

export function useChatUserPicker({
  supabase,
  userId,
  showModal,
  globalConversationId,
}: UseChatUserPickerParams) {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!showModal) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("user_id, email")
        .eq("conversation_id", globalConversationId)
        .neq("user_id", userId);

      if (error) {
        console.error("Failed to load chat users:", error);
        setAllUsers([]);
        return;
      }

      if (!data) return;

      const users: ChatUser[] = data
        .filter(
        (user): user is { user_id: string; email: string } =>
          user.user_id !== null && user.email !== null,
        )
        .sort((a, b) => a.email.localeCompare(b.email));

      setAllUsers(users);
    };

    void fetchUsers();
  }, [globalConversationId, showModal, supabase, userId]);

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [allUsers, search],
  );

  return {
    search,
    setSearch,
    allUsers,
    filteredUsers,
  };
}