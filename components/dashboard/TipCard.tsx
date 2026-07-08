import { Lightbulb } from "lucide-react";

type TipCardProps = {
  message?: string;
};

export default function TipCard({
  message = "Complete your profile and add skills to get better recommendations!",
}: TipCardProps) {
  return (
    <div className="flex gap-3 rounded-2xl bg-brand-light p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand">
        <Lightbulb size={18} />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">Tip</p>
        <p className="mt-0.5 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}