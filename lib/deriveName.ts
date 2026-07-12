// Google/email signups don't always populate a display name, so fall back to
// turning the email's local part (e.g. "diah.pane") into "Diah Pane".
export function deriveNameFromEmail(email: string) {
  return email
    .split("@")[0]
    .replace(/[._]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
