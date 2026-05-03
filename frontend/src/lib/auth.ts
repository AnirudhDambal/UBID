import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Hardcoded users for the UBID project
const USERS = [
  {
    id: "1",
    email: "anirudh@ubid.gov",
    password: "password123",
    role: "ADMIN",
    name: "Anirudh",
  },
  {
    id: "2",
    email: "reviewer@ubid.gov",
    password: "password123",
    role: "REVIEWER",
    name: "Reviewer",
  },
  {
    id: "3",
    email: "auditor@ubid.gov",
    password: "password123",
    role: "AUDITOR",
    name: "Auditor",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = USERS.find((u) => u.email === credentials.email);

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
