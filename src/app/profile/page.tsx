import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileRedirectPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (error || !profile?.username) {
    redirect("/account?message=Please choose a username to create your public profile");
  }

  redirect(`/u/${profile.username}`);
}