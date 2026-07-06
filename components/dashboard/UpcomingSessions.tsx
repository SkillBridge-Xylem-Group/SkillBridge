type Session = {
  mentor: string;
  topic: string;
  time: string;
  action: "Join" | "Reschedule";
};

const sessions: Session[] = [
  { mentor: "Sarah Chen", topic: "Design Systems", time: "Today, 2:00 PM", action: "Join" },
  { mentor: "Mark Verhoven", topic: "Cloud Mastery", time: "Tomorrow, 10:30 AM", action: "Reschedule" },
];

export default function UpcomingSessions() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Upcoming Sessions</h2>
        <a href="#" className="text-sm font-bold text-brand hover:underline">
          View All
        </a>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-widest text-slate-400">
              <th className="pb-3 font-bold">Mentor</th>
              <th className="pb-3 font-bold">Topic</th>
              <th className="pb-3 font-bold">Time</th>
              <th className="pb-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.mentor}>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-200" />
                    <span className="font-bold text-slate-900">{s.mentor}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-600">{s.topic}</td>
                <td className="py-4 text-slate-600">{s.time}</td>
                <td className="py-4">
                  {s.action === "Join" ? (
                    <a href="#" className="font-bold text-brand hover:underline">
                      Join
                    </a>
                  ) : (
                    <a href="#" className="font-semibold text-slate-400 hover:text-slate-600">
                      Reschedule
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}