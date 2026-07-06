"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

const steps = ["Title", "Level", "Detail"];

const categories = [
  "Software Engineering",
  "UI/UX Design",
  "Business & Marketing",
  "Data & Analytics",
  "Photography",
  "Music",
  "Language",
  "Other",
];

const levels = [
  { key: "beginner", title: "Beginner-Friendly", desc: "For those just starting out" },
  { key: "intermediate", title: "Intermediate", desc: "Some prior experience expected" },
  { key: "advanced", title: "Advanced", desc: "For experienced practitioners" },
  { key: "expert", title: "Expert", desc: "Deep, specialized mastery" },
];

export default function AddSkillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") === "skills-teaching" ? "skills-teaching" : "skills-learning";
  const backHref = `/dashboard/profile?tab=${from}`;

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");

  function handlePublish() {
    // TODO: kirim data ke API
    console.log({ title, category: category === "Other" ? customCategory : category, level, description });
    router.push(backHref);
  }

  return (
    <DashboardShell>
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Publish a New Skill</h1>

        <div className="mt-8 flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    i <= step ? "bg-brand text-white" : "border border-slate-200 text-slate-400"
                  }`}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`mt-2 text-sm font-semibold ${i <= step ? "text-brand" : "text-slate-400"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-3 h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-900">Skill Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced React & Design Systems"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <p className="mt-2 text-sm text-slate-400">
                  Choose a specific title that clearly defines your expertise.
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-900">Primary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {category === "Other" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type your category"
                    className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">Quick Preview</p>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{title || "New Skill Slot"}</p>
                    <p className="text-sm text-slate-400">Listing will appear in Search results</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm font-bold text-slate-900">Expertise Level</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {levels.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setLevel(l.key)}
                    className={`rounded-xl border p-5 text-left transition ${
                      level === l.key ? "border-brand bg-brand-light" : "border-slate-200 hover:border-brand/40"
                    }`}
                  >
                    <p className="font-bold text-slate-900">{l.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-sm font-bold text-slate-900">Skill Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what mentees will learn in this session..."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Link href={backHref} className="text-sm font-bold text-slate-700 hover:text-red-600">
              Cancel
            </Link>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-pill flex items-center gap-2 border-2 border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-pill flex items-center gap-2 bg-brand px-6 py-2.5 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="btn-pill flex items-center gap-2 bg-brand px-6 py-2.5 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
                >
                  Publish Skill
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}