import { Check, X } from "lucide-react";

type Request = {
  initials: string;
  name: string;
  message: string;
};

const requests: Request[] = [{ initials: "JD", name: "John Doe", message: "Wants to learn React" }];

export default function PendingRequests() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-900">Pending Requests</h2>

      <div className="mt-5 space-y-4">
        {requests.map((r) => (
          <div key={r.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {r.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{r.name}</p>
                <p className="text-sm text-slate-500">{r.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Accept"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 text-emerald-500 hover:bg-emerald-50"
              >
                <Check size={16} />
              </button>
              <button
                aria-label="Decline"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 hover:bg-red-50"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}