/**
 * SkillBridge API smoke tests (Node.js, no extra deps).
 * Maps to selected rows in api-test-cases.csv / Postman collection.
 *
 * Usage:
 *   node --env-file=.env.local scripts/api-smoke.mjs
 *   # or:
 *   set BASE_URL=http://localhost:3000
 *   set TEST_EMAIL=you@example.com
 *   set TEST_PASSWORD=ValidPass1!
 *   node scripts/api-smoke.mjs
 *
 * Requires a confirmed email/password account. Cookie jar is handled manually.
 */

const BASE_URL = (process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "ValidPass1!";
const TEST_NAME = process.env.TEST_FULL_NAME || "API Tester";

/** @type {Map<string, string>} */
const cookieJar = new Map();

function storeCookies(res) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const list = raw.length ? raw : [];
  // Node may expose multiple Set-Cookie via getSetCookie; fallback single header
  if (!list.length) {
    const single = res.headers.get("set-cookie");
    if (single) list.push(single);
  }
  for (const line of list) {
    const pair = line.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function request(method, path, { body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && cookieJar.size) headers.Cookie = cookieHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  storeCookies(res);
  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json, text };
}

function assert( cond, message) {
  if (!cond) throw new Error(message);
}

const results = [];

async function test(id, title, fn) {
  try {
    await fn();
    results.push({ id, title, ok: true });
    console.log(`PASS  ${id}  ${title}`);
  } catch (err) {
    results.push({ id, title, ok: false, error: err.message });
    console.error(`FAIL  ${id}  ${title}`);
    console.error(`      ${err.message}`);
  }
}

const formGuard = () => ({
  website: "",
  formStartedAt: Date.now() - 5000,
});

async function main() {
  console.log(`Base URL: ${BASE_URL}\n`);

  await test("TC-AUTH-02", "Register invalid payload → 400", async () => {
    const { status, json } = await request("POST", "/api/auth/register", {
      auth: false,
      body: {
        fullName: "A",
        email: "bad",
        password: "weak",
        confirmPassword: "weak",
        ...formGuard(),
      },
    });
    assert(status === 400, `expected 400 got ${status}`);
    assert(json?.error === "Validation failed", `unexpected body ${JSON.stringify(json)}`);
  });

  await test("TC-AUTH-04", "Register honeypot → 400", async () => {
    const { status } = await request("POST", "/api/auth/register", {
      auth: false,
      body: {
        fullName: TEST_NAME,
        email: `bot${Date.now()}@example.com`,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        website: "http://spam.example",
        formStartedAt: Date.now() - 5000,
      },
    });
    assert(status === 400, `expected 400 got ${status}`);
  });

  await test("TC-AUTH-01", "Register valid → 201", async () => {
    const email = `api.tester+${Date.now()}@example.com`;
    const { status, json } = await request("POST", "/api/auth/register", {
      auth: false,
      body: {
        fullName: TEST_NAME,
        email,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        ...formGuard(),
      },
    });
    assert(status === 201, `expected 201 got ${status}: ${JSON.stringify(json)}`);
    assert(typeof json?.message === "string", "missing message");
  });

  await test("TC-AUTH-06", "Login wrong password → 401", async () => {
    if (!TEST_EMAIL) throw new Error("Set TEST_EMAIL for login tests");
    const { status, json } = await request("POST", "/api/auth/login", {
      auth: false,
      body: { email: TEST_EMAIL, password: "WrongPass1!", remember: false, ...formGuard() },
    });
    assert(status === 401, `expected 401 got ${status}`);
    assert(json?.error === "Invalid email or password", JSON.stringify(json));
  });

  await test("TC-AUTH-05", "Login valid → 200 + cookies", async () => {
    if (!TEST_EMAIL) throw new Error("Set TEST_EMAIL for login tests");
    cookieJar.clear();
    const { status } = await request("POST", "/api/auth/login", {
      auth: false,
      body: { email: TEST_EMAIL, password: TEST_PASSWORD, remember: true, ...formGuard() },
    });
    assert(status === 200, `expected 200 got ${status}`);
    assert(cookieJar.size > 0, "expected Set-Cookie session cookies");
  });

  await test("TC-AUTH-07", "GET /api/auth/me authenticated → 200", async () => {
    const { status, json } = await request("GET", "/api/auth/me");
    assert(status === 200, `expected 200 got ${status}`);
    assert(json?.user?.id, "missing user.id");
    assert(json?.user?.email, "missing user.email");
  });

  await test("TC-PROF-01", "POST /api/profile → 200", async () => {
    const { status, json } = await request("POST", "/api/profile", {
      body: { name: TEST_NAME, bio: "Updated from smoke test" },
    });
    assert(status === 200, `expected 200 got ${status}: ${JSON.stringify(json)}`);
  });

  await test("TC-PROF-03", "POST /api/profile/skills → 200", async () => {
    const { status, json } = await request("POST", "/api/profile/skills", {
      body: { offered: ["Photography"], wanted: ["Web Development"] },
    });
    assert(status === 200, `expected 200 got ${status}: ${JSON.stringify(json)}`);
    assert(json?.success === true, JSON.stringify(json));
  });

  await test("TC-MATCH-01", "GET /api/users/browse real ratings", async () => {
    const { status, json } = await request("GET", "/api/users/browse");
    assert(status === 200, `expected 200 got ${status}`);
    assert(Array.isArray(json?.people), "people must be array");
    for (const p of json.people) {
      if (p.reviewCount === 0) {
        assert(p.rating === 0, `${p.name} has reviewCount 0 but rating ${p.rating}`);
      }
    }
  });

  await test("TC-MATCH-04", "GET /api/users/matches ≤ 3", async () => {
    const { status, json } = await request("GET", "/api/users/matches");
    assert(status === 200, `expected 200 got ${status}`);
    assert(Array.isArray(json?.matches), "matches must be array");
    assert(json.matches.length <= 3, `expected ≤3 got ${json.matches.length}`);
  });

  await test("TC-NOTIF-01", "GET /api/notifications", async () => {
    const { status, json } = await request("GET", "/api/notifications");
    assert(status === 200, `expected 200 got ${status}`);
    assert(Array.isArray(json?.notifications), "notifications array");
    assert(typeof json?.unreadCount === "number", "unreadCount");
  });

  await test("TC-MSG-01", "GET /api/messages", async () => {
    const { status } = await request("GET", "/api/messages");
    assert(status === 200, `expected 200 got ${status}`);
  });

  await test("TC-FORUM-01", "GET /api/forum/recent-questions", async () => {
    const { status, json } = await request("GET", "/api/forum/recent-questions", { auth: false });
    assert(status === 200, `expected 200 got ${status}`);
    const list = json?.questions ?? json;
    assert(Array.isArray(list), "expected questions array");
  });

  await test("TC-AUTH-10", "Forgot password anti-enumeration → 200", async () => {
    const { status } = await request("POST", "/api/auth/forgot-password", {
      auth: false,
      body: { email: "anyone@example.com", ...formGuard() },
    });
    assert(status === 200, `expected 200 got ${status}`);
  });

  await test("TC-AUTH-09", "Logout → 200 then me unauthorized", async () => {
    const out = await request("POST", "/api/auth/logout");
    assert(out.status === 200, `logout expected 200 got ${out.status}`);
    cookieJar.clear();
    const me = await request("GET", "/api/auth/me");
    assert(me.status === 401, `me after logout expected 401 got ${me.status}`);
  });

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
