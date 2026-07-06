import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <div className="flex items-center gap-4 px-6 py-6 sm:px-10">
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search skills, mentors..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <button
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <Bell size={20} />
      </button>

      <div className="h-10 w-10 shrink-0 rounded-full bg-brand-light" />
    </div>
  );
}