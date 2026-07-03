type Message = {
  name: string;
  preview: string;
  time: string;
};

const messages: Message[] = [
  { name: "Sarah Chen", preview: "I've shared the feedback on your l...", time: "5m ago" },
  { name: "Jordan Lee", preview: "Are we still on for the Figma revie...", time: "2h ago" },
];

export default function RecentMessages() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-900">Recent Messages</h2>

      <div className="mt-5 space-y-4">
        {messages.map((m) => (
          <div key={m.name} className="flex items-start gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                <span className="shrink-0 text-xs text-slate-400">{m.time}</span>
              </div>
              <p className="truncate text-sm text-slate-500">{m.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}