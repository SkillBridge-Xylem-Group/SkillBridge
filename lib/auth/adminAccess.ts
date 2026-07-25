import { getClientIp, getClientIpFromHeaders } from "@/lib/auth/rate-limit";

export { getClientIpFromHeaders };

export function getAdminAllowedIps(): string[] {
  const raw = process.env.ADMIN_ALLOWED_IPS?.trim();
  if (!raw) return [];
  return raw.split(",").map((ip) => ip.trim()).filter(Boolean);
}

/** When ADMIN_ALLOWED_IPS is set, only those IPs may access admin surfaces. */
export function isAdminIpAllowed(ip: string): boolean {
  const allowed = getAdminAllowedIps();
  if (allowed.length === 0) return true;
  return allowed.includes(ip);
}

export function isAdminIpAllowedForRequest(request: Request): boolean {
  return isAdminIpAllowed(getClientIp(request));
}

export function adminIpBlockedResponse() {
  return { error: "Access denied from this network." };
}
