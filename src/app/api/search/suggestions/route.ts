import {
  NextRequest,
  NextResponse
} from "next/server";

import { getSearchSuggestions } from "@/lib/search";

export async function GET(
  request: NextRequest
) {
  const query =
    request.nextUrl.searchParams
      .get("q")
      ?.trim()
      .slice(0, 100) || "";

  if (query.length < 2) {
    return NextResponse.json({
      suggestions: []
    });
  }

  const suggestions =
    await getSearchSuggestions(query);

  return NextResponse.json(
    {
      suggestions
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=30, stale-while-revalidate=120"
      }
    }
  );
}