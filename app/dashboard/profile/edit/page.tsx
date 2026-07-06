"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Elena Rodriguez");
  const [headline, setHeadline] = useState("Motion Designer & Tech Enthu");
  const [bio, setBio] = useState(
    "My career began in a small agency where I quickly learned that motion isn't just about movement; it's about storytelling and user engagement."
  );
  const [accepting, setAccepting] = useState(true);
  const [typicalHours, setTypicalHours] = useState("Tue-Thu, 6:00 PM - 8:00 PM");
  const [company, setCompany] = useState("Starlight Creative");
  const [yearsExp, setYearsExp] = useState("8+ years");

  const [teaching, setTeaching] = useState(["UX Design & Research", "Advanced Figma", "Design Systems"]);
  const [learning, setLearning] = useState(["Motion Design & After Effects", "Next.js 14", "Web3 Security"]);
  const [teachingInput, setTeachingInput] = useState("");
  const [learningInput, setLearningInput] = useState("");

  const [linkedin, setLinkedin] = useState("elenarod");
  const [twitter, setTwitter] = useState("@elena_motion");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");

  function addTag(
    e: KeyboardEvent<HTMLInputElement>,
    value: string,
    setValue: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void
  ) {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      setList([...list, value.trim()]);
      setValue("");
    }
  }

  function handleSave() {
    // TODO: kirim data ke API
    console.log({
      fullName,
      headline,
      bio,
      accepting,
      typicalHours,
      company,
      yearsExp,
      teaching,
      learning,
      linkedin,
      twitter,
      facebook,
      instagram,
      github,
    });
    router.push("/dashboard/profile");
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <Sidebar />

      <div className="flex-1 px-6 py-8 sm:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-teal-700 px-8 pb-8 pt-10">
          <div className="flex items-end gap-5">
            <div className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-slate-200" />
            <div>
              <h1 className="text-3xl font-extrabold text-white">{fullName}</h1>
              <p className="mt-1 text-white/80">Customize your professional identity</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-pill bg-brand px-6 py-2.5 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
          >
            Save Changes
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Personal Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Professional Headline</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Availability</h2>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Accepting Mentees</span>
              <button
                type="button"
                onClick={() => setAccepting((v) => !v)}
                className={`h-6 w-11 rounded-full transition ${accepting ? "bg-brand" : "bg-slate-200"}`}
              >
                <span
                  className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${
                    accepting ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Typical Hours</label>
              <input
                value={typicalHours}
                onChange={(e) => setTypicalHours(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-extrabold text-slate-900">Bio / Summary</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={2000}
              className="mt-4 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-2 text-right text-xs text-slate-400">{bio.length} / 2000 characters</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Professional Details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Years of Experience</label>
                <select
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {["0-2 years", "3-5 years", "5-8 years", "8+ years", "10+ years"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Teaching Expertise</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {teaching.map((t) => (
                <span key={t} className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  {t}
                  <button type="button" onClick={() => setTeaching(teaching.filter((x) => x !== t))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={teachingInput}
              onChange={(e) => setTeachingInput(e.target.value)}
              onKeyDown={(e) => addTag(e, teachingInput, setTeachingInput, teaching, setTeaching)}
              placeholder="Type a skill and press Enter"
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Learning Goals</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {learning.map((t) => (
                <span key={t} className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
                  {t}
                  <button type="button" onClick={() => setLearning(learning.filter((x) => x !== t))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={learningInput}
              onChange={(e) => setLearningInput(e.target.value)}
              onKeyDown={(e) => addTag(e, learningInput, setLearningInput, learning, setLearning)}
              placeholder="Type a skill and press Enter"
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-extrabold text-slate-900">Social Presence</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">LinkedIn</label>
                <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="text-slate-400">linkedin.com/</span>
                  <input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="ml-1 flex-1 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Twitter/X</label>
                <input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Facebook</label>
                <input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/username"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Instagram</label>
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">GitHub</label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/username"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}