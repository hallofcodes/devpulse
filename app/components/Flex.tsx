"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faEllipsis,
  faExternalLink,
  faPencil,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { timeAgo } from "../utils/time";
import { useBadWords } from "@/app/hooks/useBadWords";
import { hasBlocklistedWord } from "@/app/utils/moderation";
import { toast } from "react-toastify";

export interface Projects {
  name: string;
  text: string;
  project_description: string;
  project_url: string;
  project_time: string;
  is_open_source: boolean;
  open_source_url?: string;
}

interface FlexRow {
  id: string;
  project_name: string;
  project_description: string;
  project_url: string;
  project_time: string;
  is_open_source: boolean;
  open_source_url: string;
  expires_at: string;
  created_at: string;
}

function toEditableFlex(row: FlexRow): Projects {
  return {
    name: row.project_name ?? "",
    text: row.project_time ?? "",
    project_description: row.project_description ?? "",
    project_url: row.project_url ?? "",
    project_time: row.project_time ?? "",
    is_open_source: row.is_open_source ?? false,
    open_source_url: row.open_source_url ?? "",
  };
}

export default function Flex() {
  const [loading, setLoading] = useState(false);
  const [flexes, setFlexes] = useState<Projects[]>([]);
  const [flex, setFlex] = useState<Projects | null>(null);
  const [userFlexes, setUserFlexes] = useState<FlexRow[]>([]);
  const [editingFlexId, setEditingFlexId] = useState<string | null>(null);
  const [activeMenuFlexId, setActiveMenuFlexId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const { badWords } = useBadWords();

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-flex-menu]")) {
        return;
      }

      setActiveMenuFlexId(null);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flex) return;

    const normalizedProjectName = flex.name.trim();
    const normalizedProjectDescription = (
      flex.project_description || ""
    ).trim();

    if (!normalizedProjectName) {
      toast.error("Project name cannot be empty.");
      return;
    }

    const containsBadWords =
      hasBlocklistedWord(normalizedProjectName, badWords) ||
      hasBlocklistedWord(normalizedProjectDescription, badWords);

    if (containsBadWords) {
      toast.error(
        "No bad words allowed. Please remove them before submitting.",
      );
      return;
    }

    const payload = {
      project_name: normalizedProjectName,
      project_description: normalizedProjectDescription,
      project_url: flex.project_url,
      project_time: flex.text,
      is_open_source: flex.is_open_source,
      open_source_url: flex.is_open_source ? (flex.open_source_url ?? "") : "",
    };

    const res = editingFlexId
      ? await fetch(`/api/flex/${editingFlexId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/flex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      toast.error("Failed to submit flex. Please try again.");
      return;
    }

    const data: FlexRow = await res.json();
    setUserFlexes((prev) =>
      editingFlexId
        ? prev.map((f) => (f.id === editingFlexId ? data : f))
        : [data, ...prev],
    );
    setFlex(null);
    setEditingFlexId(null);
    toast.success(editingFlexId ? "Flex updated!" : "Flex submitted!");
  };

  const expireAt = (expireAt: string) => {
    const expiresAt = new Date(expireAt);
    const now = new Date();

    const diffMs = expiresAt.getTime() - now.getTime();
    return Math.max(Math.floor(diffMs / (1000 * 60 * 60)), 0) + "hr";
  };

  const handleDeleteFlex = async (flexId: string) => {
    const res = await fetch(`/api/flex/${flexId}`, { method: "DELETE" });

    if (!res.ok) {
      toast.error("Failed to delete flex. Please try again.");
      return;
    }

    setUserFlexes((prev) => prev.filter((item) => item.id !== flexId));
    if (editingFlexId === flexId) {
      setFlex(null);
      setEditingFlexId(null);
    }
    setActiveMenuFlexId(null);
    toast.success("Flex deleted.");
  };

  useEffect(() => {
    async function fetchUserFlexes() {
      setLoading(true);
      const res = await fetch("/api/flex");
      if (res.ok) {
        const data: FlexRow[] = await res.json();
        setUserFlexes(data);
      }
      setLoading(false);
    }

    fetchUserFlexes();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    async function fetchProjects() {
      const res = await fetch("/api/flex/projects");
      if (!res.ok) return;

      const data: { projects: Projects[] } = await res.json();
      const projects: Projects[] = data.projects ?? [];
      const newProjects = projects.filter(
        (p) => !userFlexes.some((f) => f.project_name === p.name),
      );
      setFlexes(newProjects);
    }

    fetchProjects();
  }, [showModal, userFlexes]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="relative z-50 flex flex-row justify-between items-center w-full gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Flex
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">
            Share your projects with the community
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <button
            onClick={() => {
              setEditingFlexId(null);
              setShowModal(true);
            }}
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap transition-colors rounded-xl"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Flex
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Loading your flexes...</p>
        </div>
      )}

      {flex && (
        <div className="fixed p-5 inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold mb-2">{flex.name}</h2>
              <p>{flex.text}</p>

              <input
                type="text"
                value={flex.name || ""}
                onChange={(e) => setFlex({ ...flex, name: e.target.value })}
                className="w-full mt-4 px-3 py-2 bg-transparent text-gray-700 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
              />

              <textarea
                value={flex.project_description || ""}
                onChange={(e) =>
                  setFlex({ ...flex, project_description: e.target.value })
                }
                placeholder="Project Description"
                className="w-full mt-2 px-3 py-2 bg-transparent text-gray-700 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
                rows={4}
              ></textarea>

              <input
                type="url"
                value={flex.project_url || ""}
                onChange={(e) =>
                  setFlex({ ...flex, project_url: e.target.value })
                }
                placeholder="Project URL"
                className="w-full mt-2 px-3 py-2 bg-transparent text-gray-700 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
              />

              <div className="flex items-center mt-2 space-x-2">
                <input
                  type="checkbox"
                  checked={flex.is_open_source || false}
                  onChange={(e) =>
                    setFlex({ ...flex, is_open_source: e.target.checked })
                  }
                  className="rounded bg-neutral-800"
                />
                <label>Open Source?</label>
              </div>

              {flex.is_open_source && (
                <input
                  type="url"
                  value={flex.open_source_url || ""}
                  onChange={(e) =>
                    setFlex({ ...flex, open_source_url: e.target.value })
                  }
                  placeholder="Open Source URL"
                  className="w-full mt-2 px-3 py-2 bg-transparent text-gray-700 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
                />
              )}

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFlex(null);
                    setEditingFlexId(null);
                  }}
                  className="mt-4 btn-secondary px-4 py-2 text-sm rounded-xl me-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mt-4 btn-primary px-4 py-2 text-sm rounded-xl"
                >
                  {editingFlexId ? "Save Flex" : "Submit Flex"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userFlexes.length === 0 && !loading && (
        <div className="p-6 flex items-center justify-center">
          <p className="text-gray-500">
            You have no flexes yet. Start by sharing your first project!
          </p>
        </div>
      )}

      {userFlexes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userFlexes.map((f) => (
            <div key={f.id} className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{f.project_name}</h3>
                <div className="flex flex-col items-end">
                  <div className="relative" data-flex-menu>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuFlexId((prev) =>
                          prev === f.id ? null : f.id,
                        )
                      }
                      className="p-1 -m-1 text-gray-500 hover:text-gray-600 transition-colors leading-none"
                      title="Flex actions"
                      aria-label="Open flex actions"
                      aria-haspopup="menu"
                      aria-expanded={activeMenuFlexId === f.id}
                    >
                      <FontAwesomeIcon
                        icon={faEllipsis}
                        className="w-3.5 h-3.5"
                      />
                    </button>

                    {activeMenuFlexId === f.id && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-1 w-24 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-xl shadow-xl py-1 z-20"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setEditingFlexId(f.id);
                            setFlex(toEditableFlex(f));
                            setActiveMenuFlexId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FontAwesomeIcon
                            icon={faPencil}
                            className="w-3 h-3"
                          />
                          Edit
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => void handleDeleteFlex(f.id)}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-300 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 text-sm text-gray-600 leading-none">
                    {f.project_time}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">{f.project_description}</p>
              <a
                className="text-sm text-gray-500 truncate"
                href={f.project_url}
                title="Click to view project"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faExternalLink}
                  className="w-3 h-3 text-gray-500 me-1"
                />
                {f.project_url}
              </a>
              {f.is_open_source && (
                <a
                  className="text-sm text-green-600 truncate"
                  href={f.open_source_url}
                >
                  <FontAwesomeIcon
                    icon={faCode}
                    className="w-3 h-3 text-green-600 me-1"
                  />
                  {f.open_source_url}
                </a>
              )}
              <span className="text-xs">
                Expires in {expireAt(f.expires_at || "")} • Posted{" "}
                {timeAgo(f.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="glass-card p-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full mb-3 px-3 py-2 bg-transparent text-gray-700 placeholder:text-gray-500 border border-neutral-800 rounded-xl outline-none"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {flexes.length === 0 && !loading && (
                <p className="text-gray-500 text-sm text-center">
                  You have no projects to flex yet.
                </p>
              )}

              {flexes
                .filter((u) =>
                  u.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((u, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setEditingFlexId(null);
                      setFlex({
                        ...u,
                        open_source_url: u.open_source_url || "",
                      });
                      setShowModal(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <div className="flex justify-center items-center w-10 h-8 rounded-full bg-neutral-600">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="w-full flex flex-col">
                      <span>{u.name}</span>
                      <span>{u.text}</span>
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
