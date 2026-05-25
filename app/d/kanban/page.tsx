export default function Kanban() {
  const projects = ["Devpulse", "Client Portal", "Internal Tools"];

  const groups = [
    {
      id: "status",
      title: "Status",
      description: "Workflow states",
      columns: [
        {
          id: "backlog",
          title: "Backlog",
          count: 6,
          items: [
            { id: "DP-12", title: "Revamp billing page", tag: "UI" },
            { id: "DP-18", title: "Audit auth edge cases", tag: "Security" },
            { id: "DP-23", title: "Design audit logs", tag: "Design" },
          ],
        },
        {
          id: "in-progress",
          title: "In Progress",
          count: 3,
          items: [
            { id: "DP-31", title: "Realtime status service", tag: "Backend" },
            { id: "DP-34", title: "Kanban board layout", tag: "Frontend" },
          ],
        },
        {
          id: "review",
          title: "In Review",
          count: 2,
          items: [{ id: "DP-38", title: "OAuth callback flow", tag: "Auth" }],
        },
        {
          id: "done",
          title: "Done",
          count: 8,
          items: [{ id: "DP-05", title: "Setup rate limiter", tag: "Infra" }],
        },
      ],
    },
    {
      id: "type",
      title: "Type",
      description: "Track by issue type",
      columns: [
        {
          id: "bug",
          title: "Bug",
          count: 4,
          items: [{ id: "DP-14", title: "Email confirm loop", tag: "Auth" }],
        },
        {
          id: "feature",
          title: "Feature",
          count: 7,
          items: [{ id: "DP-22", title: "Team invite flow", tag: "Growth" }],
        },
        {
          id: "chore",
          title: "Chore",
          count: 5,
          items: [{ id: "DP-29", title: "Upgrade UI kit", tag: "UI" }],
        },
      ],
    },
    {
      id: "priority",
      title: "Priority",
      description: "Delivery focus",
      columns: [
        {
          id: "p0",
          title: "P0",
          count: 1,
          items: [
            { id: "DP-41", title: "Service outage recovery", tag: "Ops" },
          ],
        },
        {
          id: "p1",
          title: "P1",
          count: 3,
          items: [{ id: "DP-27", title: "Role-based access", tag: "Security" }],
        },
        {
          id: "p2",
          title: "P2",
          count: 6,
          items: [{ id: "DP-35", title: "Improve docs", tag: "Docs" }],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Top header */}
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
              <select className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-200">
                {projects.map((project) => (
                  <option key={project}>{project}</option>
                ))}
              </select>

              <button className="h-10 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-gray-200 hover:bg-white/10 transition">
                Filter
              </button>
              <button className="h-10 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm text-indigo-300 hover:bg-indigo-500/20 transition">
                + New Issue
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-white/10 px-3 py-1 bg-white/5">
              View: Kanban
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 bg-white/5">
              Group: Status
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 bg-white/5">
              Sort: Priority
            </span>
          </div>
        </div>
      </div>

      {/* Kanban viewport */}
      <div className="mx-auto max-w-[1400px] px-6 pb-8">
        <div className="h-[calc(100vh-190px)] overflow-x-auto overflow-y-hidden">
          <div className="flex w-max gap-10 pr-10">
            {groups.map((group) => (
              <section key={group.id} className="min-w-[740px]">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-100">
                      {group.title}
                    </h2>
                    <p className="text-xs text-gray-500">{group.description}</p>
                  </div>
                  <button className="text-xs text-indigo-300 hover:text-indigo-200">
                    + Add column
                  </button>
                </div>

                <div className="mt-4 flex gap-4">
                  {group.columns.map((col) => (
                    <div
                      key={col.id}
                      className="w-72 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-100">
                          {col.title}
                        </h3>
                        <span className="text-xs rounded-full bg-white/10 px-2 py-0.5 text-gray-300">
                          {col.count}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {col.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-white/10 bg-[#0f0f20] p-3 hover:border-white/20 transition"
                          >
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{item.id}</span>
                              <span className="rounded-full border border-white/10 px-2 py-0.5">
                                {item.tag}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-200">
                              {item.title}
                            </p>
                          </div>
                        ))}

                        <button className="w-full rounded-lg border border-dashed border-white/15 py-2 text-xs text-gray-400 hover:text-gray-200 hover:border-white/30 transition">
                          + Add card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
