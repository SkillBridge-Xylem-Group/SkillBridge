export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-slate-500 sm:flex-row sm:px-10">
        <span className="font-extrabold tracking-wide text-slate-900">SKILL BRIDGE</span>
        <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}