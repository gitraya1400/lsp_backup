// Ini adalah halaman pertama yang akan dilihat Asesi setelah login pertama kali

"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockSubmitPraAsesmen, mockGetProgressAsesi } from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, User, FileUp, CheckCircle2 } from "lucide-react"

export default function PraAsesmenPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    telepon: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamat: "",
  })
  const [foto, setFoto] = useState(null)
  const [ktp, setKtp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cek, kalau sudah mengisi, langsung redirect ke dashboard
  useEffect(() => {
    if (user) {
      mockGetProgressAsesi(user.id).then(progress => {
        if (progress.statusPraAsesmen === "SELESAI") {
          router.push("/asesi/dashboard")
        } else {
          setLoading(false)
        }
      })
    }
  }, [user, router])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!foto || !ktp) {
      alert("Harap unggah Foto Diri dan KTP")
      return
    }

    try {
      setIsSubmitting(true)
      await mockSubmitPraAsesmen(user.id, { ...formData, foto: foto.name, ktp: ktp.name })
      alert("Data Pra-Asesmen berhasil disimpan!")
      router.push("/asesi/dashboard") // Redirect ke dashboard setelah sukses
    } catch (error) {
      console.error("Error submitting pra-asesmen:", error)
      alert("Gagal menyimpan data.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
     return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Pra-Asesmen</h1>
          <p className="text-muted-foreground mt-1">Harap lengkapi data diri dan dokumen Anda sebelum memulai.</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data Anda akan digunakan untuk keperluan sertifikasi. Pastikan semua data diisi dengan benar.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Diri dan Dokumen
              </CardTitle>
              <CardDescription>
                Data dengan tanda (*) diambil otomatis dari akun Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Read-only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama Lengkap (*)</Label>
                  <Input id="nama" value={user?.nama || ""} readOnly disabled className="mt-1 bg-gray-100" />
                </div>
                <div>
                  <Label htmlFor="email">Email (*)</Label>
                  <Input id="email" value={user?.email || ""} readOnly disabled className="mt-1 bg-gray-100" />
                </div>
                <div>
                  <Label htmlFor="nim">NIM (*)</Label>
                  <Input id="nim" value={user?.nim || ""} readOnly disabled className="mt-1 bg-gray-100" />
                </div>
                <div>
                  <Label htmlFor="kelas">Kelas</Label>
                  <Input id="kelas" value={user?.kelas || "N/A"} readOnly disabled className="mt-1 bg-gray-100" />
                </div>
                <div>
                  <Label htmlFor="skema">Skema (*)</Label>
                  <Input id="skema" value={user?.skemaId || ""} readOnly disabled className="mt-1 bg-gray-100" />
                </div>
              </div>

              <hr />

              {/* Data Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telepon">Nomor Telepon / WA</Label>
                  <Input id="telepon" placeholder="08xxxxxxxxxx" value={formData.telepon} onChange={handleInputChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                  <Input id="tempatLahir" placeholder="Jakarta" value={formData.tempatLahir} onChange={handleInputChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input id="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleInputChange} required className="mt-1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="alamat">Alamat Lengkap (Sesuai KTP)</Label>
                <Textarea id="alamat" placeholder="Jl. Otto Iskandardinata No.64C..." value={formData.alamat} onChange={handleInputChange} required className="mt-1" />
              </div>

              {/* Upload Dokumen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Foto */}
                <div className="space-y-2">
                  <Label htmlFor="foto">Upload Foto Diri (3x4)</Label>
                  <Input id="foto" type="file" accept="image/jpeg, image/png" onChange={(e) => setFoto(e.target.files[0])} required className="text-sm" />
                  {foto && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" /> {foto.name}
                    </div>
                  )}
                </div>
                {/* Upload KTP */}
                <div className="space-y-2">
                  <Label htmlFor="ktp">Upload Scan KTP</Label>
                  <Input id="ktp" type="file" accept="image/jpeg, image/png, application/pdf" onChange={(e) => setKtp(e.target.files[0])} required className="text-sm" />
                   {ktp && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" /> {ktp.name}
                    </div>
                  )}
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Data dan Lanjut"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  )
}