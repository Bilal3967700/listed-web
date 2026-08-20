import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      unreadCount: 0
    });
  }

  const {
    count,
    error
  } = await supabase
    .from("messages")
    .select("id", {
      count: "exact",
      head: true
    })
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error(
      "Unread message count error:",
      error.message
    );

    return NextResponse.json(
      {
        unreadCount: 0
      },
      {
        status: 500
      }
    );
  }

  return NextResponse.json({
    unreadCount: count || 0
  });
}