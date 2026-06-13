// Dataghmart Data Bundles — NextAuth.js Options
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Ensure NEXTAUTH_URL is set
if (!process.env.NEXTAUTH_URL) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_APP_URL
  } else if (process.env.PUBLIC_APP_URL) {
    process.env.NEXTAUTH_URL = process.env.PUBLIC_APP_URL
  } else if (process.env.APP_URL) {
    process.env.NEXTAUTH_URL = process.env.APP_URL
  }
}

interface GoogleProfile {
  name?: string
  picture?: string
  sub?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  basePath: "/api/auth/nextauth",
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email?.trim().toLowerCase()
        if (!email) return false

        const gProfile = profile as GoogleProfile | undefined
        const googleName = gProfile?.name || user.name || ""
        const googlePicture = gProfile?.picture || null

        try {
          const existing = await db.user.findUnique({
            where: { email },
            include: { agentProfile: true },
          })

          if (existing) {
            if (existing.suspended) return false

            await db.user.update({
              where: { id: existing.id },
              data: {
                signInCount: existing.signInCount + 1,
                lastSignInAt: new Date(),
                ...(googlePicture && { avatarUrl: googlePicture }),
              },
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const u = user as any
            u.dbUserId = existing.id
            u.dbFullName = existing.fullName
            u.dbRole = existing.role
            u.dbAvatarUrl = googlePicture || existing.avatarUrl
            u.dbBalance = existing.balance
            u.dbAgentProfile = existing.agentProfile
          } else {
            const newUser = await db.user.create({
              data: {
                email,
                fullName: googleName,
                avatarUrl: googlePicture,
                password: null,
                role: "customer",
                signInCount: 1,
                lastSignInAt: new Date(),
              },
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const u = user as any
            u.dbUserId = newUser.id
            u.dbFullName = newUser.fullName
            u.dbRole = newUser.role
            u.dbAvatarUrl = newUser.avatarUrl
            u.dbBalance = newUser.balance
            u.dbAgentProfile = null
          }
        } catch (error) {
          console.error("Google OAuth — signIn callback error:", error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any
        token.dbUserId = u.dbUserId || user.id
        token.dbFullName = u.dbFullName || user.name || ""
        token.dbRole = u.dbRole || "customer"
        token.dbAvatarUrl = u.dbAvatarUrl || null
        token.dbBalance = u.dbBalance || 0
        token.dbAgentProfile = u.dbAgentProfile || null
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const su = session.user as any
        su.id = token.dbUserId
        su.fullName = token.dbFullName
        su.role = token.dbRole
        su.avatarUrl = token.dbAvatarUrl
        su.balance = token.dbBalance
        su.agentProfile = token.dbAgentProfile
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}
