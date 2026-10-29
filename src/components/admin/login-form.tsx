"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";

import type { AuthFormState } from "@/app/admin/login/actions";
import { signInLocalAction, signInWithPasswordAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

interface AdminLoginFormProps {
  mode: "supabase" | "local";
}

export function AdminLoginForm({ mode }: AdminLoginFormProps) {
  const [supabaseState, supabaseAction, supabasePending] = useActionState(
    signInWithPasswordAction,
    initialState,
  );
  const [localState, localAction, localPending] = useActionState(
    signInLocalAction,
    initialState,
  );

  const state = mode === "supabase" ? supabaseState : localState;
  const pending = mode === "supabase" ? supabasePending : localPending;

  return (
    <form
      action={mode === "supabase" ? supabaseAction : localAction}
      className="space-y-4"
    >
      {mode === "supabase" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@banglesbybeauty.com"
              className="h-11 sm:h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 sm:h-11"
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="passphrase">Admin passphrase</Label>
          <Input
            id="passphrase"
            name="passphrase"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Set via ADMIN_LOCAL_PASSPHRASE"
            className="h-11 sm:h-11"
          />
        </div>
      )}

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full gap-2 text-base">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Lock className="size-4" aria-hidden="true" />
        )}
        {mode === "supabase" ? "Sign in" : "Unlock admin"}
      </Button>
    </form>
  );
}
