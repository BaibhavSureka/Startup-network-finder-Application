import NextAuth, { NextAuthOptions } from "next-auth";
import { NextApiHandler } from "next";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import { Session, User } from "next-auth/core/types"; // Import necessary types

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Required for encryption (production)
  callbacks: {
    async signIn({ user }: { user: User }) {
      try {
        if (!user.email) return false;

        const { error } = await supabase.from("users").upsert(
          { email: user.email },
          { onConflict: "email" }
        );

        if (error) {
          console.error("Error upserting user:", error);
          return false;
        }
        return true;
      } catch (err) {
        console.error("Sign-in error:", err);
        return false;
      }
    },
    async session({ session }: { session: Session }) {
      if (!session?.user?.email) return session;

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
      }

      session.user = user || session.user;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};

const handler: NextApiHandler = NextAuth(authOptions);

export { handler as GET, handler as POST };
