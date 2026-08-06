"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

interface KanbanIssue {
  id: string;
  column_id: string;
  issue_key: string;
  title: string;
  tag: string;
  type: string;
  priority: string;
  position: number;
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
  const sensors = useSensors(useSensor(PointerSensor));

  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [issues, setIssues] = useState<KanbanIssue[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    tag: "",
    type: "feature",
    priority: "p2",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/kanban/data");
    if (!res.ok) return;
    const data = await res.json();
    setProjects(data.projects ?? []);
    setBoards(data.boards ?? []);
    setColumns(data.columns ?? []);
    setIssues(data.issues ?? []);
    if (!selectedProject && data.projects?.length) {
      setSelectedProject(data.projects[0].id);
    }
  }, [selectedProject]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const es = new EventSource("/api/sse/kanban");

    es.onmessage = (event: MessageEvent) => {
      const envelope = JSON.parse(event.data as string) as {
        type: string;
        data: Record<string, unknown>;
      };

      if (envelope.type === "issue_created" && isKanbanIssue(envelope.data)) {
        const d = envelope.data;
        setIssues((prev) => {
          if (prev.some((i) => i.id === d.id)) return prev;
          return [...prev, d];
        });
      } else if (
        envelope.type === "issue_updated" &&
        isIssueUpdate(envelope.data)
      ) {
        const d = envelope.data;
        setIssues((prev) =>
          prev.map((i) =>
            i.id === d.id
              ? { ...i, column_id: d.column_id, position: d.position }
              : i,
          ),
        );
      }
    };

    return () => es.close();
  }, []);

  const grouped = useMemo(() => {
    return boards
      .filter((board) => board.project_id === selectedProject)
      .map((board) => ({
        ...board,
        columns: columns
          .filter((c) => c.board_id === board.id)
          .sort((a, b) => a.position - b.position)
          .map((column) => ({
            ...column,
            items: issues
              .filter((i) => i.column_id === column.id)
              .sort((a, b) => a.position - b.position),
          })),
      }));
  }, [boards, columns, issues, selectedProject]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const destinationColumnId = over.data.current?.columnId;
    if (!destinationColumnId) return;

    const position = issues.filter(
      (i) => i.column_id === destinationColumnId,
    ).length;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, column_id: destinationColumnId, position }
          : issue,
      ),
    );

    await fetch(`/api/kanban/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: destinationColumnId, position }),
    });
  }

  async function createIssue() {
    if (!selectedColumn || !form.title.trim()) return;

    const count = issues.length + 1;
    const position = issues.filter(
      (i) => i.column_id === selectedColumn,
    ).length;

    const res = await fetch("/api/kanban/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columnId: selectedColumn,
        issueKey: `DP-${count}`,
        title: form.title,
        tag: form.tag,
        type: form.type,
        priority: form.priority,
        position,
      }),
    });

    if (res.ok) {
      const newIssue: KanbanIssue = await res.json();
      setIssues((prev) => [...prev, newIssue]);
    }

    setForm({ title: "", tag: "", type: "feature", priority: "p2" });
    setIsOpen(false);
  }

  return (
    <div className="min-h-screen ">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0a1a]/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-400/80">
                Project Kanban
              </p>
              <h1 className="text-2xl font-semibold">Boards</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-200"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSelectedColumn(columns?.[0]?.id || null);
                  setIsOpen(true);
                }}
                className="h-10 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm text-indigo-300"
              >
                + New Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mx-auto max-w-[1400px] px-6 pb-8">
          <div className="h-[calc(100vh-190px)] overflow-x-auto overflow-y-hidden">
            <div className="flex w-max gap-10 pr-10">
              {grouped.map((board) => (
                <section key={board.id} className="min-w-[740px]">
                  <div>
                    <h2 className="text-sm font-semibold">{board.title}</h2>
                    <p className="text-xs text-gray-500">{board.description}</p>
                  </div>

                  <div className="mt-4 flex gap-4">
                    {board.columns.map((column) => (
                      <Column
                        key={column.id}
                        column={column}
                        onAdd={() => {
                          setSelectedColumn(column.id);
                          setIsOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </DndContext>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-xl border border-white/10 bg-[#0f0f20] p-5">
            <h2 className="text-lg font-semibold">Create Issue</h2>

            <div className="mt-4 space-y-3">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
              />

              <input
                placeholder="Tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
              />

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="chore">Chore</option>
              </select>

              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
              >
                <option value="p0">P0</option>
                <option value="p1">P1</option>
                <option value="p2">P2</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={createIssue}
                className="rounded-lg bg-indigo-500 px-3 py-1 text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
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
    data: { columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-72 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
          {column.items.length}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {column.items.map((item) => (
          <IssueCard key={item.id} item={item} columnId={column.id} />
        ))}

        <button
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-white/15 py-2 text-xs text-gray-400"
        >
          + Add card
        </button>
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
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: item.id,
    data: { columnId },
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
      }}
      className="cursor-grab rounded-lg border border-white/10 bg-[#0f0f20] p-3 active:cursor-grabbing"
    >
      <div className="flex justify-between text-xs text-gray-400">
        <span>{item.issue_key}</span>
        <span className="rounded border border-white/10 px-2">{item.tag}</span>
      </div>

      <p className="mt-2 text-sm">{item.title}</p>

      <div className="mt-2 flex gap-2 text-[10px] text-gray-400">
        <span className="rounded border border-white/10 px-2">{item.type}</span>
        <span className="rounded border border-white/10 px-2">
          {item.priority}
        </span>
      </div>
    </div>
  );
}
