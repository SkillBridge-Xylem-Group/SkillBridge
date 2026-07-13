const MIN_AUTH_DELAY_MS = 400;
const MAX_AUTH_DELAY_MS = 900;

/** Add jitter so failed auth responses are harder to time-attack. */
export function authResponseDelay(): Promise<void> {
  const delay = MIN_AUTH_DELAY_MS + Math.floor(Math.random() * (MAX_AUTH_DELAY_MS - MIN_AUTH_DELAY_MS));
  return new Promise((resolve) => setTimeout(resolve, delay));
}
