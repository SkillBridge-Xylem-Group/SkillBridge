"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { createBadgeAction, updateBadgeAction, deleteBadgeAction } from "@/lib/actions/admin-badges";
import { TIER_STYLE, TIER_LABEL, ICON_MAP, DEFAULT_ICON, type BadgeTier } from "@/lib/badges";

type BadgeRow = {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string;
  metric: string;
  target: number;
  sort_order: number;
  is_active: boolean;
};

const METRIC_OPTIONS = [
  { value: "skills_offered_count", label: "Skills offered (count)" },
  { value: "offered_and_wanted", label: "Has both offered & wanted skill" },
  { value: "sessions_completed", label: "Completed sessions" },
  { value: "review_count", label: "Reviews received" },
  { value: "level", label: "Account level" },
  { value: "trusted_teacher", label: "Trusted teacher (rating + reviews)" },
  { value: "member_days", label: "Days since joining" },
] as const;

type BadgeMetric = (typeof METRIC_OPTIONS)[number]["value"];

const ICON_OPTIONS = Object.keys(ICON_MAP);
const TIER_OPTIONS: BadgeTier[] = ["common", "rare", "epic", "legendary"];

type FormState = {
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string;
  metric: BadgeMetric;
  target: number;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  tier: "common",
  icon: "sparkles",
  metric: "level",
  target: 1,
  sort_order: 0,
  is_active: true,
};

export default function AdminBadgesTable({ badges: initial }: { badges: BadgeRow[] }) {
  const [badges, setBadges] = useState(initial.filter((b) => b.is_active));
  const [editing, setEditing] = useState<BadgeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(b: BadgeRow) {
    setForm({
      name: b.name,
      description: b.description,
      tier: b.tier,
      icon: b.icon,
      metric: b.metric as BadgeMetric,
      target: b.target,
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setEditing(b);
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
    setError("");
  }

  function submit() {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    startTransition(async () => {
      if (editing) {
        const result = await updateBadgeAction(editing.id, form);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setBadges((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...form } : b)));
      } else {
        const result = await createBadgeAction(form);
        if (result?.error) {
          setError(result.error);
          return;
        }
        window.location.reload();
        return;
      }
      closeForm();
    });
  }

  function handleDelete(b: BadgeRow) {
    if (
      !window.confirm(
        `Deactivate "${b.name}"? Members who already unlocked it keep it, but it stops showing as available.`
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteBadgeAction(b.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBadges((prev) => prev.filter((x) => x.id !== b.id));
    });
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--sb-gradient)" }}
        >
          <Plus size={16} />
          New Badge
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const tier = TIER_STYLE[b.tier];
          const Icon = ICON_MAP[b.icon] ?? DEFAULT_ICON;
          return (
            <div key={b.id} className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: tier.gradient }}
                >
                  <Icon size={18} />
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: tier.chipBg, color: tier.chipInk }}
                >
                  {TIER_LABEL[b.tier]}
                </span>
              </div>
              <p className="mt-3 font-bold" style={{ color: "var(--sb-ink)" }}>
                {b.name}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
                {b.description}
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--sb-muted)" }}>
                {METRIC_OPTIONS.find((m) => m.value === b.metric)?.label ?? b.metric} · target {b.target}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  disabled={isPending}
                  className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={13} /> Deactivate
                </button>
              </div>
            </div>
          );
        })}
        {badges.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
            No badges yet.
          </p>
        )}
      </div>

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6" style={{ boxShadow: "var(--sb-shadow-lg)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "var(--sb-ink)" }}>
                {editing ? "Edit Badge" : "New Badge"}
              </h2>
              <button onClick={closeForm} className="rounded-full p-1.5 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.tier}
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as BadgeTier }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {TIER_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {TIER_LABEL[t]}
                    </option>
                  ))}
                </select>
                <select
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {ICON_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={form.metric}
                onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value as BadgeMetric }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {METRIC_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Target"
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Sort order"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeForm}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: "var(--sb-gradient)" }}
              >
                {isPending ? "Saving..." : editing ? "Save Changes" : "Create Badge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}