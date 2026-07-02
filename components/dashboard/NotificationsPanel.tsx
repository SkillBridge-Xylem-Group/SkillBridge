import { CalendarCheck, Award, MessageCircle } from "lucide-react";

type Notification = {
  icon: typeof CalendarCheck;
  title: string;
  desc: string;
  highlighted?: boolean;
  iconBg: string;
  iconColor: string;
};

const notifications: Notification[] = [
  {
    icon: CalendarCheck,
    title: "Session Confirmed",
    desc: "Your session with Sarah is confirmed for 2 PM.",
    highlighted: true,
    iconBg: "bg-brand-light",
    iconColor: "text-brand",
  },
  {
    icon: Award,
    title: "New Badge Earned!",
    desc: "You've unlocked the 'React Pioneer' badge.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    icon: MessageCircle,
    title: "Review Received",
    desc: "Mark left you a 5-star review for your help.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
];

export default function NotificationsPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Notifications</h2>
        <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
          3 NEW
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.title}
              className={`flex gap-3 rounded-xl p-3 ${
                n.highlighted ? "border-l-4 border-brand bg-brand-light" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.iconBg} ${n.iconColor}`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-500">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}