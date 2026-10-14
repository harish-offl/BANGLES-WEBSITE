import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getIdentity, type AuthIdentity } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/data/driver";

export const LOCAL_ADMIN_COOKIE = "bb_local_admin";

export type AdminMode = "supabase" | "local";

export type AdminAccess =
  | {
      ok: true;
      mode: AdminMode;
      identity: AuthIdentity | null;
      displayName: string;
    }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_configured" };

/**
 * Local, credential-free admin mode is available only when:
 *   * Supabase is not configured,
 *   * `ALLOW_LOCAL_ADMIN=true` is set explicitly, and
 *   * we are not running a production build.
 *
 * This exists so the panel can be developed and demoed without a database. It
 * can never be enabled accidentally in production.
 */
export function isLocalAdminAvailable(): boolean {
  return (
    !isSupabaseConfigured() &&
    process.env.ALLOW_LOCAL_ADMIN === "true" &&
    process.env.NODE_ENV !== "production" &&
    Boolean(process.env.ADMIN_LOCAL_PASSPHRASE)
  );
}

/** Stable token compared against the local admin cookie. */
export function localAdminToken(): string | null {
  const passphrase = process.env.ADMIN_LOCAL_PASSPHRASE;
  if (!passphrase) return null;
  return createHash("sha256").update(`bb-local:${passphrase}`).digest("hex");
}

export function isCorrectLocalPassphrase(candidate: string): boolean {
  const passphrase = process.env.ADMIN_LOCAL_PASSPHRASE;
  if (!passphrase) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(passphrase);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function hasLocalAdminSession(): Promise<boolean> {
  const token = localAdminToken();
  if (!token) return false;
  const store = await cookies();
  const cookie = store.get(LOCAL_ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const a = Buffer.from(cookie);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Resolves whether the current request may use the admin panel.
 *
 * In Supabase mode the role is read from `profiles.role` on the server — never
 * from anything the client supplies. In local mode a signed-in-equivalent
 * cookie is required, on top of the explicit env flags above.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  if (isSupabaseConfigured()) {
    const identity = await getIdentity();
    if (!identity) {
      return { ok: false, reason: "unauthenticated" };
    }
    if (identity.role !== "admin") {
      return { ok: false, reason: "forbidden" };
    }
    return {
      ok: true,
      mode: "supabase",
      identity,
      displayName: identity.displayName ?? identity.email,
    };
  }

  if (isLocalAdminAvailable() && (await hasLocalAdminSession())) {
    return { ok: true, mode: "local", identity: null, displayName: "Local admin" };
  }

  return { ok: false, reason: "not_configured" };
}

export class AdminAccessError extends Error {
  readonly status = 403;
  constructor(message = "Administrator access required.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

/** Server Action / route-handler guard. Throws when access is not permitted. */
export async function requireAdminAccess(): Promise<Extract<AdminAccess, { ok: true }>> {
  const access = await getAdminAccess();
  if (!access.ok) throw new AdminAccessError();
  return access;
}
