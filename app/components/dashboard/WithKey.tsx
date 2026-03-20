"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUsers, faTimes } from "@fortawesome/free-solid-svg-icons";

type ModalState = "create" | "join" | "share" | null;

export default function DashboardWithKey() {
  const supabase = createClient();
  const [leaderboardName, setLeaderboardName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState<"code" | "url" | null>(null);

  const createLeaderboard = async () => {
    if (leaderboardName.trim().length === 0)
      return toast.error("Please enter a leaderboard name.");
    if (leaderboardName.trim().length < 3)
      return toast.error("Leaderboard name must be at least 3 characters.");    
    if (leaderboardName.length > 50)
      return toast.error("Leaderboard name must be under 50 characters.");      

    const createLeaderboard = new Promise<{ join_code: string }>(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const joinCode = crypto.randomUUID().slice(0, 8);
        const slug = leaderboardName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

        const { data, error } = await supabase
          .from("leaderboards")
          .insert({
            name: leaderboardName,
            description: "",
            slug,
            owner_id: user.id,
            join_code: joinCode,
            is_public: true,
          })
          .select()
          .single();

        if (error) return reject(error);

        await supabase.from("leaderboard_members").insert({
          leaderboard_id: data.id,
          user_id: user.id,
          role: "owner",
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(createLeaderboard, {
      pending: "Creating leaderboard...",
      success: "Leaderboard created!",
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "A leaderboard with that name already exists.";
          }
          return err?.message || "Failed to create. Please try again.";
        },
      },
    });

    createLeaderboard.then((data: unknown) => {
      const result = data as { join_code: string };
      setCreatedCode(result.join_code);
      setLeaderboardName("");
      setActiveModal("share");
    });
  };

  const joinLeaderboard = async () => {
    if (joinCode.trim().length === 0)
      return toast.error("Please enter a join code.");
    if (joinCode.trim().length !== 8)
      return toast.error("Join code must be 8 characters long.");

    const joinLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) return;

        const { data: board } = await supabase
          .from("leaderboards")
          .select("id")
          .eq("join_code", joinCode)
          .single();

        if (!board) throw new Error("Invalid join code");

        const { error } = await supabase.from("leaderboard_members").insert({   
          leaderboard_id: board.id,
          user_id: user.id,
        });

        if (error) return reject(error);

        resolve(board);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(joinLeaderboard, {
      pending: "Joining leaderboard...",
      success: {
        render() {
          window.location.reload();
          return "Joined leaderboard!";
        },
      },
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "You are already a member of this leaderboard.";
          }
          return err?.message || "Failed to join. Please try again.";
        },
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActiveModal("create")}
          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap transition-colors rounded-xl"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Create
        </button>
        <button 
          onClick={() => setActiveModal("join")}
          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap transition-colors rounded-xl"
        >
          <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5" />
          Join
        </button>
      </div>

      {activeModal && (
        <div className="fixed top-0 bottom-0 right-0 left-[68px] md:left-[240px] z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-[calc(100%-2rem)] max-w-sm relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border-white/10 shadow-2xl mx-auto">
            {activeModal === "share" ? (
              <>
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-500" />

                <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Share Server
                      </h3>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">
                        Invite your squad
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveModal(null); window.location.reload(); }}
                    className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 relative z-10 bg-black/20 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold ml-1">Join Code</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-lg tracking-[0.15em] text-white text-center">
                        {createdCode}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdCode);
                          setCopied("code");
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        className={`px-4 rounded-xl text-sm font-semibold transition-all border ${
                          copied === "code"
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {copied === "code" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold ml-1">Invite URL</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
                        {`${typeof window !== "undefined" ? window.location.origin : ""}/join?id=${createdCode}`}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/join?id=${createdCode}`);
                          setCopied("url");
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        className={`px-4 rounded-xl text-sm font-semibold transition-all border ${
                          copied === "url"
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {copied === "url" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveModal(null); window.location.reload(); }}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20 rounded-xl transition-all !bg-emerald-500 hover:!bg-emerald-600"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
                  activeModal === "create" ? "bg-indigo-500" : "bg-blue-500"
                }`} />

                <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      activeModal === "create" 
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    }`}>
                      <FontAwesomeIcon icon={activeModal === "create" ? faPlus : faUsers} className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {activeModal === "create" ? "Create Server" : "Join Server"}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">
                        {activeModal === "create" ? "Start a new leaderboard" : "Enter a join code"}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 relative z-10 bg-black/20">
                  {activeModal === "create" ? (
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold ml-1">Leaderboard Name</label> 
                        <input
                          placeholder="e.g., Top Coders"
                          className="input-field w-full px-4 text-sm py-3.5 bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all rounded-xl shadow-inner placeholder:text-gray-600"
                          value={leaderboardName}
                          onChange={(e) => setLeaderboardName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && createLeaderboard()}
                          autoFocus
                        />
                      </div>
                      <button 
                        onClick={createLeaderboard} 
                        className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 rounded-xl transition-all"
                      >
                        Build Server
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold ml-1">Join Code</label> 
                        <input
                          placeholder="8-character code..."
                          className="input-field w-full px-4 font-mono text-sm py-3.5 tracking-wider bg-white/[0.02] border border-white/10 focus:border-blue-500/50 focus:bg-white/[0.04] transition-all uppercase rounded-xl shadow-inner placeholder:text-gray-600"
                          maxLength={8}
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && joinLeaderboard()}
                          autoFocus
                        />
                      </div>
                      <button 
                        onClick={joinLeaderboard} 
                        className="btn-primary w-full py-3.5 text-sm font-bold !bg-blue-500 hover:!bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 rounded-xl !border-blue-400/50 transition-all"
                      >
                        Join Server
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
