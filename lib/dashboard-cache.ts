/**
 * Shared cache for institute dashboard stats.
 * All institute pages (Overview, Exams, Repository, Analytics) fetch from the
 * same `/api/institute/dashboard-stats` endpoint. This utility caches the
 * response in sessionStorage so navigating between pages is instant.
 *
 * Cache TTL: 2 minutes (120 seconds). After that, a fresh fetch is made.
 * Call `invalidateDashboardCache()` after mutations (create exam, toggle status, etc.)
 */

const CACHE_KEY = "abhyas_dashboard_cache";
const CACHE_TTL = 120_000; // 2 minutes

interface CachedData {
  data: any;
  timestamp: number;
}

function getCache(): CachedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCache(data: any): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // sessionStorage full — ignore
  }
}

/**
 * Fetch dashboard stats with caching.
 * Returns cached data instantly if available and fresh, otherwise fetches from API.
 */
export async function fetchDashboardStats(user: any, isDemo = false): Promise<any> {
  // Check cache first
  const cached = getCache();
  if (cached) return cached.data;

  // Fetch from API
  let headers: Record<string, string> = {};
  let url = "/api/institute/dashboard-stats";

  if (isDemo) {
    url += "?demo=true";
  } else if (user) {
    const token = await user.getIdToken();
    headers = { Authorization: `Bearer ${token}` };
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  const data = await res.json();

  // Cache the response
  setCache(data);
  return data;
}

/**
 * Invalidate the cache. Call after mutations like creating/updating/toggling exams.
 */
export function invalidateDashboardCache(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
}
