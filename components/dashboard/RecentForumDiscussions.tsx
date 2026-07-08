import { type LucideIcon, MessageSquareText, PenSquare, Sparkles, MessageCircle, ArrowBigUp } from "lucide-react";

type Discussion = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  askedBy: string;
  time: string;
  category: string;
  comments: number;
  upvotes: number;
};

const discussions: Discussion[] = [
  {
    icon: MessageSquareText,
    iconBg: "bg-brand-light",
    iconColor: "text-brand",
    title: "How do I center a div in CSS?",
    askedBy: "Michael",
    time: "2h ago",
    category: "Web Development",
    comments: 8,
    upvotes: 15,
  },
  {
    icon: PenSquare,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Best resources to learn Figma for beginners?",
    askedBy: "Anna",
    time: "5h ago",
    category: "Design",
    comments: 12,
    upvotes: 23,
  },
  {
    icon: Sparkles,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Tips for improving English conversation skills",
    askedBy: "Priya",
    time: "1d ago",
    category: "Languages",
    comments: 6,
    upvotes: 11,
  },
];

export default function RecentForumDiscussions() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Recent Forum Discussions</h2>
        <a href="/dashboard/forum" className="text-sm font-bold text-brand hover:underline">
          View all
        </a>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {discussions.map((d) => {
          const Icon = d.icon;
          return (
            <div key={d.title} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.iconBg} ${d.iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{d.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Asked by {d.askedBy} · {d.time} in {d.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} /> {d.comments}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowBigUp size={14} /> {d.upvotes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}