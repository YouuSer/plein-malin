import { auth } from "./auth";
import { headers } from "next/headers";

/** Get the current session user from request headers, or null if not authenticated */
export async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}
