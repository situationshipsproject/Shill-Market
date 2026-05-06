'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useUser } from '@/hooks/useUser'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, dbUser } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.replace('/admin/login')
      return
    }
    if (dbUser !== null && !dbUser.isAdmin) {
      router.replace('/')
    }
  }, [ready, authenticated, dbUser, router])

  if (!ready || !dbUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">VERIFYING ACCESS...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
