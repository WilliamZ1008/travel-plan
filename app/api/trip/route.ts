import { NextResponse } from "next/server";
import { readTrip, writeTrip } from "../../../db/trip-store";

export async function GET() {
  const stored = await readTrip("beijing-weekend-2026");
  if (!stored) {
    return NextResponse.json({ trip: null, version: 0 });
  }

  return NextResponse.json({
    trip: JSON.parse(stored.data),
    version: stored.version,
  });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { trip?: unknown };
  const serialized = JSON.stringify(body.trip ?? null);

  if (serialized.length > 200_000) {
    return NextResponse.json({ error: "行程数据过大" }, { status: 413 });
  }

  const updatedAt =
    typeof body.trip === "object" &&
    body.trip !== null &&
    "updatedAt" in body.trip &&
    typeof body.trip.updatedAt === "number"
      ? body.trip.updatedAt
      : Date.now();

  await writeTrip("beijing-weekend-2026", serialized, updatedAt);
  return NextResponse.json({ ok: true, updatedAt });
}
