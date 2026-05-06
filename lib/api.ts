import { auth } from "./firebase";

/**
 * Authenticated fetch — automatically attaches Firebase ID token.
 * Use this instead of raw fetch() for all API calls from the client.
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Attach Firebase ID token if user is logged in
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    } catch (err) {
      console.warn("[api] Failed to get ID token:", err);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
