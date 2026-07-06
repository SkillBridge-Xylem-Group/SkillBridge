const columns = [
  { title: "Platform", links: ["Browse Skills", "How it Works", "For Teams", "Pricing"] },
  { title: "Company", links: ["About Us", "Contact", "Careers", "Press Kit"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
];

export default function Footer() {
  return (
    <footer className="bg-white pt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-100 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-extrabold text-brand">SkillBridge</p>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              The professional network for knowledge exchange. Build your reputation, master new skills, and
              connect with global experts.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-600 hover:text-brand">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 text-sm text-slate-400">
          <p>© 2026 SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}