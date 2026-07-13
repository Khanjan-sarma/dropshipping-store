import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Admin-only credentials auth. The single store owner logs in with an email +
// password checked against the AdminUser table (bcrypt hash).
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (admin) {
          const ok = await bcrypt.compare(
            credentials.password,
            admin.passwordHash,
          );
          if (ok) return { id: admin.id, email: admin.email, name: "Admin" };
          return null;
        }

        // Fallback to env-based admin (useful before the DB is seeded).
        const envEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const envHash = process.env.ADMIN_PASSWORD_HASH;
        if (envEmail && envHash && email === envEmail) {
          const ok = await bcrypt.compare(credentials.password, envHash);
          if (ok) return { id: "env-admin", email: envEmail, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
};
