import cloudbase from "@cloudbase/js-sdk";

export type SyncMode = "cloud" | "local" | "error";

const COLLECTION_NAME = "travel_plans";
const DOCUMENT_ID = "beijing-weekend-2026";
const SHARE_CODE = "BEIJING-WEEKEND";
const LOCAL_STORAGE_KEY = "manxing:beijing-weekend-2026";

const environmentId = import.meta.env.VITE_CLOUDBASE_ENV_ID?.trim();
const region = import.meta.env.VITE_CLOUDBASE_REGION?.trim() || "ap-shanghai";
const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY?.trim();

type StoredTrip<T> = {
  shareCode: string;
  trip: T;
  updatedAt: number;
};

let databasePromise: Promise<ReturnType<
  ReturnType<typeof cloudbase.init>["database"]
> | null> | null = null;

function readLocalTrip<T>(fallback: T): T {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalTrip<T>(trip: T) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trip));
  } catch {
    // Private browsing or a full storage quota should not block the UI.
  }
}

async function getDatabase() {
  if (!environmentId) return null;

  if (!databasePromise) {
    databasePromise = (async () => {
      const app = cloudbase.init({
        env: environmentId,
        region,
        ...(accessKey ? { accessKey } : {}),
      });
      const auth = app.auth();
      const loginState = await auth.getLoginState();

      if (!loginState) {
        await auth.anonymousAuthProvider().signIn();
      }

      return app.database();
    })();
  }

  return databasePromise;
}

export function isCloudbaseConfigured() {
  return Boolean(environmentId);
}

export async function loadTrip<T>(fallback: T): Promise<{
  trip: T;
  mode: SyncMode;
  error?: string;
}> {
  const localTrip = readLocalTrip(fallback);
  const database = await getDatabase();

  if (!database) {
    return { trip: localTrip, mode: "local" };
  }

  try {
    const result = await database
      .collection(COLLECTION_NAME)
      .doc(DOCUMENT_ID)
      .get();
    const stored = result.data?.[0] as StoredTrip<T> | undefined;

    if (stored?.trip) {
      writeLocalTrip(stored.trip);
      return { trip: stored.trip, mode: "cloud" };
    }

    await database.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
      shareCode: SHARE_CODE,
      trip: localTrip,
      updatedAt: Date.now(),
    });
    return { trip: localTrip, mode: "cloud" };
  } catch (error) {
    return {
      trip: localTrip,
      mode: "error",
      error: error instanceof Error ? error.message : "CloudBase 数据读取失败",
    };
  }
}

export async function saveTrip<T extends { updatedAt: number }>(
  trip: T,
): Promise<SyncMode> {
  writeLocalTrip(trip);
  const database = await getDatabase();

  if (!database) return "local";

  await database.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
    shareCode: SHARE_CODE,
    trip,
    updatedAt: trip.updatedAt,
  });
  return "cloud";
}

export async function subscribeTrip<T>(
  onTrip: (trip: T) => void,
  onError: (error: Error) => void,
): Promise<() => void> {
  const database = await getDatabase();

  if (!database) {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_KEY || !event.newValue) return;
      try {
        onTrip(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore malformed data written by another tab.
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }

  const watcher = database
    .collection(COLLECTION_NAME)
    .doc(DOCUMENT_ID)
    .watch({
      onChange(snapshot) {
        const stored = snapshot.docs?.[0] as StoredTrip<T> | undefined;
        if (stored?.trip) {
          writeLocalTrip(stored.trip);
          onTrip(stored.trip);
        }
      },
      onError(error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      },
    });

  return () => {
    void watcher.close();
  };
}
