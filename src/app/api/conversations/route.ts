import {
  NextRequest,
  NextResponse
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest
) {
  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Authentication required"
      },
      {
        status: 401
      }
    );
  }

  const body =
    await request.json();

  const listingId = String(
    body.listingId || ""
  ).trim();

  if (!listingId) {
    return NextResponse.json(
      {
        error:
          "A listing ID is required."
      },
      {
        status: 400
      }
    );
  }

  const { data, error } =
    await supabase.rpc(
      "get_or_create_conversation",
      {
        p_listing_id: listingId
      }
    );

  if (error) {
    console.error(
      "Conversation creation error:",
      error.message
    );

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 400
      }
    );
  }

  return NextResponse.json({
    conversationId: data
  });
}