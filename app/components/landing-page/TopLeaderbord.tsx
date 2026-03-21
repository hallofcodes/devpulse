export interface Category {
  name: string;
  text: string;
  hours: number;
  decimal: string;
  digital: string;
  minutes: number;
  percent: number;
  total_seconds: number;
}

export interface TopMember {
  email: string;
  total_seconds: number;
  categories?: Category[];
}

export default function TopLeaderboard({
  top_members,
}: {
  top_members: TopMember[];
}) {
  return (
    <>
      {top_members && top_members.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
          <div
            className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
            data-aos="fade-up"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Top Developers of the Week
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Celebrating the most dedicated coders in our community.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top_members.map(
                (
                  member: { email: string; total_seconds: number },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="stat-card flex flex-col items-center px-6 py-4 group bg-black/20 hover:bg-white/5 transition-all border border-white/5 rounded-xl rounded-tl-sm"
                    data-aos="fade-up"
                    data-aos-delay={(i * 50).toString()}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.8)] transition-all" />
                      <span className="text-gray-200 font-semibold group-hover:text-white transition">
                        {member.email.split("@")[0]}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm group-hover:text-yellow-400 transition">
                      {Math.floor(member.total_seconds / 3600)}h{" "}
                      {Math.floor((member.total_seconds % 3600) / 60)}m
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
