import { env } from "cloudflare:workers";

const CREATE_TRIP_STATE = `
  CREATE TABLE IF NOT EXISTS trip_state (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

export type StoredTrip = {
  data: string;
  updated_at: number;
  version: number;
};

async function ensureTripTable() {
  await env.DB.prepare(CREATE_TRIP_STATE).run();
}

export async function readTrip(id: string): Promise<StoredTrip | null> {
  await ensureTripTable();
  return env.DB.prepare(
    "SELECT data, updated_at, version FROM trip_state WHERE id = ?",
  )
    .bind(id)
    .first<StoredTrip>();
}

export async function writeTrip(id: string, data: string, updatedAt: number) {
  await ensureTripTable();
  await env.DB.prepare(
    `INSERT INTO trip_state (id, data, updated_at, version)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at,
       version = trip_state.version + 1`,
  )
    .bind(id, data, updatedAt)
    .run();
}
