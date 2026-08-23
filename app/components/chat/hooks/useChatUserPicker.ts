"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatUser } from "@/app/components/Chat";

type UseChatUserPickerParams = {
  userId: string;
  showModal: boolean;
  globalConversationId: string;
};

export function useChatUserPicker({
  userId,
  showModal,
  globalConversationId,
}: UseChatUserPickerParams) {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!showModal) return;

    const fetchUsers = async () => {
      const res = await fetch(
        `/api/users?conversationId=${globalConversationId}`,
      );

      if (!res.ok) {
        setAllUsers([]);
        return;
      }

      const users: ChatUser[] = await res.json();
      setAllUsers(users.filter((u) => u.user_id !== userId));
    };

    void fetchUsers();
  }, [globalConversationId, showModal, userId]);

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()),
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
