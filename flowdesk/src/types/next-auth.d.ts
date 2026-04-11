import type { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: UserRole
      companyId: string
      unitId?: string
      sectorId?: string
    }
  }

  interface User {
    role: UserRole
    companyId: string
    unitId?: string
    sectorId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    companyId: string
    unitId?: string
    sectorId?: string
  }
}
