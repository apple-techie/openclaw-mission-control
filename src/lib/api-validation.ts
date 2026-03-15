import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

type ParseSuccess<T> = { data: T; error?: never };
type ParseFailure = { data?: never; error: NextResponse };
type ParseResult<T> = ParseSuccess<T> | ParseFailure;

export async function parseBody<T>(
  request: NextRequest,
  schema: ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => i.message)
      .join("; ");
    return {
      error: NextResponse.json({ error: message }, { status: 400 }),
    };
  }

  return { data: result.data };
}
