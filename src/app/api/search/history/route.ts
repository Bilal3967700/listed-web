import {
  NextRequest,
  NextResponse
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest
) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        recorded: false,
        reason: "guest"
      },
      {
        status: 200
      }
    );
  }

  const body = await request.json();

  const query = String(
    body.query || ""
  )
    .trim()
    .slice(0, 200);

  if (!query) {
    return NextResponse.json(
      {
        error: "A search query is required."
      },
      {
        status: 400
      }
    );
  }

  const resultCount = Math.max(
    0,
    Number(body.resultCount || 0)
  );

  const filters =
    body.filters &&
    typeof body.filters === "object"
      ? body.filters
      : {};

  const { error } = await supabase
    .from("search_history")
    .insert({
      user_id: user.id,
      query,
      normalized_query: query.toLowerCase(),
      filters,
      result_count: resultCount
    });

  if (error) {
    console.error(
      "Search history insert error:",
      error.message
    );

    return NextResponse.json(
      {
        error: "Search history could not be recorded."
      },
      {
        status: 500
      }
    );
  }

  return NextResponse.json({
    recorded: true
  });
}

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      deleted: false,
      reason: "guest"
    });
  }

  const { error } = await supabase
    .from("search_history")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Search history delete error:",
      error.message
    );

    return NextResponse.json(
      {
        error: "Search history could not be deleted."
      },
      {
        status: 500
      }
    );
  }

  return NextResponse.json({
    deleted: true
  });
}