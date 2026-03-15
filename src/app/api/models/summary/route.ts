import { NextResponse } from "next/server";
import { buildModelsSummary } from "@/lib/models-summary";
import { cachedResponse } from "@/lib/api-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await cachedResponse("models-summary", 15_000, () =>
    buildModelsSummary(),
  );
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "no-store" },
  });
}
