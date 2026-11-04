import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin sign in · Bangles by Beauty",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  redirect("/login/admin");
}
