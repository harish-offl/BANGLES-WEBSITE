/* Promote the existing Supabase auth user(s) to admin by
 * creating (or re-creating) the matching public.profiles row with role='admin'.
 * Run once per admin: node scripts/promote-admin.mjs [email]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim();

const supabase = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const targetEmail = process.argv[2]?.trim().toLowerCase() || null;

const { data: usersRes, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) throw listErr;

const users = usersRes.users.filter((u) => (targetEmail ? u.email?.toLowerCase() === targetEmail : true));
if (users.length === 0) {
  console.error("No matching auth user found.");
  process.exit(1);
}

for (const user of users) {
  const displayName =
    user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Admin";
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("profiles")
      .insert({ id: user.id, display_name: displayName, role: "admin" });
    if (error) throw error;
  } else {
    // A plain role UPDATE is silently reverted by the guard_profile_role
    // trigger because auth.uid() is null for the service role. Verify the
    // change and, if it did not stick, re-create the row as admin.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);
    if (updateError) throw updateError;

    const { data: after } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (after?.role !== "admin") {
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id, display_name: existing.display_name ?? displayName, role: "admin" });
      if (insertError) throw insertError;
    }
  }

  console.log(`Promoted ${user.email} (${user.id}) to admin.`);
}
