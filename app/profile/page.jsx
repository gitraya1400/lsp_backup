"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Shield, Hash, Star, Briefcase, KeyRound } from "lucide-react"

// Helper component untuk baris info
const InfoRow = ({ icon, label, value }) => {
  if (!value) return null // Jangan tampilkan jika datanya tidak ada (misal: Asesi tidak punya NIP)
  const Icon = icon
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// PASTIKAN TIDAK ADA 'async' DI SINI
export default function ProfilePage() { 
  const { user } = useAuth()

  if (!user) {
    return <MainLayout><p>Memuat data...</p></MainLayout> 
  }
  
  // Fungsi helper untuk nama role yang lebih ramah
  const getRoleDisplay = (role) => {
    const roleMap = {
      ASESI: "Peserta (Asesi)",
      ASESOR: "Penilai (Asesor)",
      ADMIN_LSP: "Admin LSP",
    }
    return roleMap[role] || role
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        
        {/* Header Profil */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-4xl">
              {user.nama ? user.nama.charAt(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{user.nama}</h1>
            <p className="text-xl text-muted-foreground">{getRoleDisplay(user.role)}</p>
          </div>
        </div>

        {/* Kartu Informasi Akun */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Shield} label="Role Sistem" value={getRoleDisplay(user.role)} />
              <InfoRow icon={Hash} label="NIM" value={user.nim} />
              <InfoRow icon={Briefcase} label="NIP" value={user.nip} />
              <InfoRow icon={Star} label="Skema" value={user.skemaId} />
              <InfoRow icon={User} label="Kelas" value={user.kelas} />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}