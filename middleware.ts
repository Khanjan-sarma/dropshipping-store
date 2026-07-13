export { default } from "next-auth/middleware";

// Protect all /admin routes except the login page. next-auth/middleware
// redirects unauthenticated users to the configured signIn page.
export const config = {
  matcher: ["/admin/((?!login).*)"],
};
