/**
 * Shared state shape for the admin server actions. Kept in a plain module
 * because a `"use server"` file may only export async functions.
 */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialActionState: ActionState = { status: "idle" };
