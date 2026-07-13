import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Returns the admin session or null. Use in API route handlers to guard
 * mutations. (Middleware also protects /admin pages, but API routes under
 * /api/admin must guard themselves.)
 */
export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session?.user);
}
