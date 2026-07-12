// Node 15+ terminates the whole process on any unhandled promise
// rejection. A single visitor with a stale/invalid refresh-token cookie
// can trigger one deep inside the Supabase client's internal token-refresh
// logic (outside our own try/catch reach), which would otherwise crash
// the server for every other user too. Log it and keep the process alive
// instead — Supabase Auth calls throughout this app already inspect the
// returned `error` themselves, so this is a safety net, not a substitute.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

export {};
