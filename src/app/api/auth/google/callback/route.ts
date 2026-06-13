// Google OAuth Callback: Bridge NextAuth session → custom cookies → redirect home
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      // No session — redirect to home page
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || new URL("/", request.url).origin
      return NextResponse.redirect(new URL("/", appUrl))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUser = session.user as any
    const userId = sessionUser.id as string | undefined
    const email = session.user.email as string | undefined

    if (!userId || !email) {
      console.error("Google OAuth callback — missing user id or email in session")
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || new URL("/", request.url).origin
      return NextResponse.redirect(new URL("/", appUrl))
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || new URL("/", request.url).origin
    const response = NextResponse.redirect(new URL("/", appUrl))

    response.cookies.set("user-id", userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    response.cookies.set("user-email", email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || new URL("/", request.url).origin
    return NextResponse.redirect(new URL("/", appUrl))
  }
}
