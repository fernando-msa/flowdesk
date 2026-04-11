// FlowDesk — NextAuth v5 configuration
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: UserRole }).role
        token.companyId = (user as { companyId: string }).companyId
        token.unitId = (user as { unitId?: string }).unitId
        token.sectorId = (user as { sectorId?: string }).sectorId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string
        session.user.unitId = token.unitId as string | undefined
        session.user.sectorId = token.sectorId as string | undefined
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuthPage = nextUrl.pathname.startsWith('/login') ||
                           nextUrl.pathname.startsWith('/forgot-password')

      if (isOnAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl))
      }

      return true
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
            isActive: true,
            companyId: true,
            unitId: true,
            sectorId: true,
          },
        })

        if (!user || !user.password || !user.isActive) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          companyId: user.companyId,
          unitId: user.unitId ?? undefined,
          sectorId: user.sectorId ?? undefined,
        }
      },
    }),
  ],
})
