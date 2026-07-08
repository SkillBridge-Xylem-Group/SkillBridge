import { CheckCircle2, Circle } from "lucide-react";

type Task = {
  label: string;
  done: boolean;
};

const tasks: Task[] = [
  { label: "Complete your profile", done: true },
  { label: "Add skills you offer", done: false },
  { label: "Add skills you want to learn", done: false },
  { label: "Send your first swap request", done: false },
];

export default function GettingStarted() {
  const completed = tasks.filter((t) => t.done).length;
  const progress = (completed / tasks.length) * 100;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Getting Started</h2>
        <span className="text-sm font-bold text-brand">
          {completed} of {tasks.length} completed
        </span>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 space-y-3">
        {tasks.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            {t.done ? (
              <CheckCircle2 size={20} className="shrink-0 text-brand" />
            ) : (
              <Circle size={20} className="shrink-0 text-slate-300" />
            )}
            <span className={`text-sm font-semibold ${t.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
