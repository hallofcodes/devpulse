"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface KanbanIssue {
  id: string;
  column_id: string;
  issue_key: string;
  title: string;
  tag: string;
  type: string;
  priority: string;
  position: number;
  created_at: string;
}

interface KanbanColumn {
  id: string;
  board_id: string;
  title: string;
  position: number;
}

interface KanbanBoard {
  id: string;
  project_id: string;
  title: string;
  description: string;
}

interface KanbanProject {
  id: string;
  name: string;
  description: string;
  wakatime_project_name: string;
  created_at: string;
  board_count: number;
  column_count: number;
  issue_count: number;
  completed_issue_count: number;
  total_tracked_seconds: number;
}

interface WakaTimeProject {
  name: string;
  total_seconds: number;
}

function isKanbanProject(value: unknown): value is KanbanProject {
  if (!value || typeof value !== "object") return false;

  const project = value as Partial<KanbanProject>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.description === "string" &&
    typeof project.wakatime_project_name === "string" &&
    typeof project.created_at === "string" &&
    typeof project.board_count === "number" &&
    typeof project.column_count === "number" &&
    typeof project.issue_count === "number" &&
    typeof project.completed_issue_count === "number" &&
    typeof project.total_tracked_seconds === "number"
  );
}

function formatHours(seconds: number) {
  return `${(seconds / 3600).toFixed(seconds >= 36000 ? 0 : 1)}h`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isKanbanIssue(value: unknown): value is KanbanIssue {
  if (!value || typeof value !== "object") return false;

  const issue = value as Partial<KanbanIssue>;
  return (
    typeof issue.id === "string" &&
    typeof issue.column_id === "string" &&
    typeof issue.issue_key === "string" &&
    typeof issue.title === "string" &&
    typeof issue.tag === "string" &&
    typeof issue.type === "string" &&
    typeof issue.priority === "string" &&
    typeof issue.position === "number"
  );
}

function isIssueUpdate(
  value: unknown,
): value is Pick<KanbanIssue, "id" | "column_id" | "position"> {
  if (!value || typeof value !== "object") return false;

  const issue = value as Partial<KanbanIssue>;
  return (
    typeof issue.id === "string" &&
    typeof issue.column_id === "string" &&
    typeof issue.position === "number"
  );
}

export default function Kanban() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );
  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [issues, setIssues] = useState<KanbanIssue[]>([]);
  const [wakaProjects, setWakaProjects] = useState<WakaTimeProject[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [showRecentIssues, setShowRecentIssues] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: "",
    tag: "",
    type: "feature",
    priority: "p2",
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    wakatime_project_name: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kanban/data");
      if (!res.ok) throw new Error("Failed to load Kanban data.");

      const data = (await res.json()) as {
        projects?: KanbanProject[];
        boards?: KanbanBoard[];
        columns?: KanbanColumn[];
        issues?: KanbanIssue[];
        wakatime_projects?: WakaTimeProject[];
      };

      const nextProjects = data.projects ?? [];
      setProjects(nextProjects);
      setBoards(data.boards ?? []);
      setColumns(data.columns ?? []);
      setIssues(data.issues ?? []);
      setWakaProjects(data.wakatime_projects ?? []);

      setSelectedProject((current) => {
        if (current && nextProjects.some((project) => project.id === current)) {
          return current;
        }
        return nextProjects[0]?.id ?? "";
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load Kanban.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    const es = new EventSource("/api/sse/kanban");

    es.onmessage = (event: MessageEvent) => {
      const envelope = JSON.parse(event.data as string) as {
        type: string;
        data: Record<string, unknown>;
      };

      if (envelope.type === "issue_created" && isKanbanIssue(envelope.data)) {
        const issue = envelope.data;
        setIssues((prev) => {
          if (prev.some((item) => item.id === issue.id)) return prev;
          return [...prev, issue];
        });
      } else if (
        envelope.type === "issue_updated" &&
        isIssueUpdate(envelope.data)
      ) {
        const issueUpdate = envelope.data;
        setIssues((prev) =>
          prev.map((item) =>
            item.id === issueUpdate.id
              ? {
                  ...item,
                  column_id: issueUpdate.column_id,
                  position: issueUpdate.position,
                }
              : item,
          ),
        );
      }
    };

    return () => es.close();
  }, []);

  const currentProject = useMemo(
    () => projects.find((project) => project.id === selectedProject) ?? null,
    [projects, selectedProject],
  );

  const groupedBoards = useMemo(() => {
    return boards
      .filter((board) => board.project_id === selectedProject)
      .map((board) => ({
        ...board,
        columns: columns
          .filter((column) => column.board_id === board.id)
          .sort((a, b) => a.position - b.position)
          .map((column) => ({
            ...column,
            items: issues
              .filter((issue) => issue.column_id === column.id)
              .sort((a, b) => a.position - b.position),
          })),
      }));
  }, [boards, columns, issues, selectedProject]);

  const availableColumns = useMemo(
    () => groupedBoards.flatMap((board) => board.columns),
    [groupedBoards],
  );

  // Derive metrics from live issues state so they update on every drag
  const liveIssueCount = useMemo(() => {
    const colIds = new Set(availableColumns.map((c) => c.id));
    return issues.filter((issue) => colIds.has(issue.column_id)).length;
  }, [issues, availableColumns]);

  const liveCompletedCount = useMemo(() => {
    const doneColIds = new Set(
      availableColumns
        .filter((c) => c.title.toLowerCase() === "done")
        .map((c) => c.id),
    );
    return issues.filter((issue) => doneColIds.has(issue.column_id)).length;
  }, [issues, availableColumns]);

  const liveCompletionRate =
    liveIssueCount > 0
      ? Math.round((liveCompletedCount / liveIssueCount) * 100)
      : 0;

  const recentIssues = useMemo(() => {
    return issues
      .filter((issue) =>
        availableColumns.some((column) => column.id === issue.column_id),
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [availableColumns, issues]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const destinationColumnId = String(over.data.current?.column_id ?? "");
    if (!destinationColumnId) return;

    const destinationIssues = issues.filter(
      (issue) =>
        issue.column_id === destinationColumnId && issue.id !== issueId,
    );
    const position = destinationIssues.length;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, column_id: destinationColumnId, position }
          : issue,
      ),
    );

    const res = await fetch(`/api/kanban/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: destinationColumnId, position }),
    });

    if (!res.ok) {
      toast.error("Unable to move issue.");
      void load();
    }
  }

  async function createIssue() {
    if (!selectedColumn || !issueForm.title.trim()) return;

    const position = issues.filter(
      (issue) => issue.column_id === selectedColumn,
    ).length;

    setSubmittingIssue(true);

    try {
      const res = await fetch("/api/kanban/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_id: selectedColumn,
          title: issueForm.title,
          tag: issueForm.tag,
          type: issueForm.type,
          priority: issueForm.priority,
          position,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Unable to create issue.");
      }

      const newIssue = (await res.json()) as KanbanIssue;
      setIssues((prev) => {
        if (prev.some((item) => item.id === newIssue.id)) return prev;
        return [...prev, newIssue];
      });
      setIssueForm({ title: "", tag: "", type: "feature", priority: "p2" });
      setIssueModalOpen(false);
      toast.success("Issue created.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create issue.",
      );
    } finally {
      setSubmittingIssue(false);
    }
  }

  async function createProject() {
    if (!projectForm.name.trim()) return;

    setSubmittingProject(true);

    try {
      const res = await fetch("/api/kanban/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      const data = (await res.json()) as KanbanProject | { error?: string };

      if (!res.ok) {
        const errorMessage = "error" in data ? data.error : undefined;
        throw new Error(errorMessage || "Unable to create project.");
      }

      if (!isKanbanProject(data)) {
        throw new Error("Unable to create project.");
      }

      const project = data;
      setProjects((prev) => [...prev, project]);
      setSelectedProject(project.id);
      setProjectForm({
        name: "",
        description: "",
        wakatime_project_name: "",
      });
      setProjectModalOpen(false);
      toast.success("Kanban project created.");
      void load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create project.",
      );
    } finally {
      setSubmittingProject(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Metrics row */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <OverviewCard
          label="Kanban Projects"
          value={String(projects.length)}
          sub="User-owned workspaces"
        />
        <OverviewCard
          label="Open Issues"
          value={String(liveIssueCount - liveCompletedCount)}
          sub="Still in flight"
        />
        <OverviewCard
          label="Completion"
          value={`${liveCompletionRate}%`}
          sub="Done column progress"
        />
        <OverviewCard
          label="Tracked Time"
          value={formatHours(currentProject?.total_tracked_seconds ?? 0)}
          sub={
            currentProject?.wakatime_project_name
              ? "From linked WakaTime project"
              : "No WakaTime project linked"
          }
        />
      </div>

      {/* Workspace + Boards */}
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left sidebar — shown below boards on mobile, beside on xl */}
        <div className="order-2 space-y-4 xl:order-1">
          <div className="glass-card p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Project Workspace
                </h2>
                <p className="text-sm text-gray-500">
                  Switch context or create a new project.
                </p>
              </div>
              <button
                onClick={() => setProjectModalOpen(true)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Active Project
              </label>
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                className="input-field h-12 w-full"
              >
                {projects.length === 0 && (
                  <option value="">No projects yet</option>
                )}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              {currentProject ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {currentProject.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {currentProject.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      Linked WakaTime:
                      <span className="ml-2 font-medium text-gray-900">
                        {currentProject.wakatime_project_name || "Not linked"}
                      </span>
                    </p>
                    <p>
                      Boards:
                      <span className="ml-2 font-medium text-gray-900">
                        {currentProject.board_count}
                      </span>
                    </p>
                    <p>
                      Created:
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(currentProject.created_at)}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyPanel
                  title="No Kanban project yet"
                  body="Create your first Kanban project to start linking execution with WakaTime output."
                />
              )}
            </div>
          </div>

          <div className="glass-card p-4 md:p-5">
            <button
              className="flex w-full items-center justify-between gap-3 text-left xl:cursor-default"
              onClick={() => setShowRecentIssues((v) => !v)}
            >
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Recent Issues
                </h2>
                <p className="text-sm text-gray-500">
                  Latest cards for the active project.
                </p>
              </div>
              <span className="text-xs text-gray-400 xl:hidden">
                {showRecentIssues ? "▲" : "▼"}
              </span>
            </button>

            <div
              className={`mt-4 space-y-3 ${showRecentIssues ? "block" : "hidden xl:block"}`}
            >
              {recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span>{issue.issue_key}</span>
                      <span className="rounded-full border border-gray-200 px-2 py-1 uppercase">
                        {issue.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {issue.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                      {issue.tag ? (
                        <span className="rounded-full border border-gray-200 px-2 py-1">
                          {issue.tag}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-gray-200 px-2 py-1 uppercase">
                        {issue.type}
                      </span>
                      <span>{formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyPanel
                  title="No issues yet"
                  body="Use the active project board to add the first card."
                />
              )}
            </div>
          </div>
        </div>

        {/* Boards panel — shown first on mobile */}
        <div className="order-1 glass-card overflow-hidden p-4 md:p-5 xl:order-2">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Boards</h2>
              <p className="text-sm text-gray-500">
                {currentProject
                  ? "Delivery lanes for the active project."
                  : "Create a project first to open a board."}
              </p>
            </div>
            {currentProject?.wakatime_project_name ? (
              <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                Bound to {currentProject.wakatime_project_name}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading Kanban workspace...
            </div>
          ) : groupedBoards.length === 0 ? (
            <div className="py-16">
              <EmptyPanel
                title="No boards for this project"
                body="New Kanban projects create a default board automatically. If you are seeing this on an older project, create a new project or add board data directly."
              />
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="mt-5 space-y-6">
                {groupedBoards.map((board) => (
                  <section key={board.id} className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {board.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {board.description || "Execution board"}
                      </p>
                    </div>

                    {/* Horizontal scroll on mobile, grid on md+ */}
                    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                      {board.columns.map((column) => (
                        <div
                          key={column.id}
                          className="min-w-[260px] flex-none md:min-w-0"
                        >
                          <Column
                            column={column}
                            onAdd={() => {
                              setSelectedColumn(column.id);
                              setIssueModalOpen(true);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </DndContext>
          )}
        </div>
      </div>

      {projectModalOpen ? (
        <ModalShell
          title="Create Kanban Project"
          subtitle="Set up a project workspace and optionally bind it to a synced WakaTime project."
          onClose={() => setProjectModalOpen(false)}
        >
          <div className="space-y-3">
            <input
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="input-field w-full"
              placeholder="Project name"
            />

            <textarea
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="input-field min-h-28 w-full resize-none"
              placeholder="What is this project trying to ship?"
            />

            <select
              value={projectForm.wakatime_project_name}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  wakatime_project_name: event.target.value,
                }))
              }
              className="input-field w-full"
            >
              <option value="">No WakaTime binding</option>
              {wakaProjects.map((project) => (
                <option key={project.name} value={project.name}>
                  {project.name} ({formatHours(project.total_seconds)})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setProjectModalOpen(false)}
              className="rounded-xl px-3 py-2 text-sm text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={createProject}
              disabled={submittingProject || !projectForm.name.trim()}
              className={`btn-primary px-4 py-2 text-sm ${
                submittingProject || !projectForm.name.trim()
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              Create Project
            </button>
          </div>
        </ModalShell>
      ) : null}

      {issueModalOpen ? (
        <ModalShell
          title="Create Issue"
          subtitle="Drop a new card into the right delivery lane."
          onClose={() => setIssueModalOpen(false)}
        >
          <div className="space-y-3">
            <select
              value={selectedColumn ?? ""}
              onChange={(event) => setSelectedColumn(event.target.value)}
              className="input-field w-full"
            >
              {availableColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>

            <input
              placeholder="Issue title"
              value={issueForm.title}
              onChange={(event) =>
                setIssueForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="input-field w-full"
            />

            <input
              placeholder="Tag or scope"
              value={issueForm.tag}
              onChange={(event) =>
                setIssueForm((prev) => ({ ...prev, tag: event.target.value }))
              }
              className="input-field w-full"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={issueForm.type}
                onChange={(event) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
                }
                className="input-field w-full"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="chore">Chore</option>
              </select>

              <select
                value={issueForm.priority}
                onChange={(event) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    priority: event.target.value,
                  }))
                }
                className="input-field w-full"
              >
                <option value="p0">P0</option>
                <option value="p1">P1</option>
                <option value="p2">P2</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setIssueModalOpen(false)}
              className="rounded-xl px-3 py-2 text-sm text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={createIssue}
              disabled={submittingIssue || !issueForm.title.trim()}
              className={`btn-primary px-4 py-2 text-sm ${
                submittingIssue || !issueForm.title.trim()
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              Create Issue
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

function OverviewCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl border-gray-200 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Column({
  column,
  onAdd,
}: {
  column: { id: string; title: string; items: KanbanIssue[] };
  onAdd: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { column_id: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-3xl border border-gray-200 bg-gray-50 p-4 h-full"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-600">
            {column.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {column.items.length} card{column.items.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {column.items.map((item) => (
          <IssueCard key={item.id} item={item} columnId={column.id} />
        ))}
      </div>
    </div>
  );
}

function IssueCard({
  item,
  columnId,
}: {
  item: KanbanIssue;
  columnId: string;
}) {
  const { setNodeRef, listeners, attributes, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: { column_id: columnId },
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        zIndex: isDragging ? 50 : undefined,
      }}
      className={`cursor-grab rounded-2xl border border-gray-200 bg-white p-4 shadow-sm active:cursor-grabbing ${isDragging ? "shadow-lg opacity-95" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>{item.issue_key}</span>
        {item.tag ? (
          <span className="rounded-full border border-gray-200 px-2 py-1">
            {item.tag}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-medium text-gray-900">{item.title}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
        <span className="rounded-full border border-gray-200 px-2 py-1 uppercase">
          {item.type}
        </span>
        <span className="rounded-full border border-gray-200 px-2 py-1 uppercase">
          {item.priority}
        </span>
      </div>
    </div>
  );
}
