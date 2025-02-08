import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        const { data, error } = await supabase.from("users").upsert({ email: user.email }, { onConflict: "email" })

        if (error) {
          console.error("Error upserting user:", error)
          return false
        }
      }
      return true
    },
  },
})

export { handler as GET, handler as POST }

