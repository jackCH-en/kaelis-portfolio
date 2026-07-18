import { env } from "cloudflare:workers";

const OWNER_EMAIL_SHA256 =
  "af85614473563fa8f5cdf44ec1ba51adf3305aecf9826553999cc310d6009ebc";

function configuredOwnerEmail() {
  return (env as typeof env & { OWNER_EMAIL?: string }).OWNER_EMAIL
    ?.trim()
    .toLowerCase();
}

export async function isOwnerEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const configuredEmail = configuredOwnerEmail();
  if (configuredEmail) return normalizedEmail === configuredEmail;

  const bytes = new TextEncoder().encode(normalizedEmail);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return hex === OWNER_EMAIL_SHA256;
}
