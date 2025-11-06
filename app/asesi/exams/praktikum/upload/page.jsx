"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { FileUp, Check, AlertCircle, Loader2 } from "lucide-react"

import { 
  mockGetProgressAsesi, 
  mockSubmitPraktikum // Ganti dari mockSubmitUjianTeori
} from "@/lib/api-mock"

export default function UploadPraktikumPage() {
  const { user, loading: isAuthLoading } = useAuth() // Ambil isAuthLoading
  const router = useRouter()
  
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true) // Loading untuk cek prasyarat
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    
    // 1. Tunggu auth pulih
    if (isAuthLoading) {
      return; 
    }
    // 2. Jika tidak ada user, tendang
    if (!user) {
      router.push("/login");
      return;
    }
    
    // 3. Jika user ada, cek prasyarat
    const checkPrerequisites = async () => {
      try {
        setLoading(true)
        const progressData = await mockGetProgressAsesi(user.id)
        setProgress(progressData)

        if (!progressData.tryoutSelesai) {
          alert("Anda harus menyelesaikan tryout terlebih dahulu sebelum mengunggah praktikum.")
          router.push("/asesi/exams")
          return
        }

        // Cek jika sudah pernah upload
        if (progressData.ujianPraktikumSelesai) {
          alert("Anda sudah pernah mengunggah file praktikum.")
          router.push("/asesi/exams")
          return
        }

      } catch (err) {
        console.error(err)
        setError("Gagal memuat status progres Anda.")
      } finally {
        setLoading(false)
      }
    }

    checkPrerequisites()
    
  }, [user, isAuthLoading, router])
  // --- (BATAS PERBAIKAN 2) ---

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validasi simpel untuk file .ppt atau .pptx
      const fileType = selectedFile.type
      if (fileType === "application/vnd.ms-powerpoint" || fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
        setFile(selectedFile)
        setError(null)
      } else {
        setFile(null)
        setError("File harus berekstensi .ppt atau .pptx")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("Silakan pilih file terlebih dahulu.")
      return
    }
    if (!user) {
      setError("Sesi Anda berakhir. Silakan login kembali.");
      return;
    }

    setIsUploading(true)
    setError(null)

    try {
      await mockSubmitPraktikum(user.id, file.name)

      alert("File praktikum Anda berhasil diunggah!")
      router.push("/asesi/exams") // Kembali ke hub ujian

    } catch (err) {
      console.error("Gagal mengunggah file:", err)
      setError("Terjadi kesalahan saat mengunggah file. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
    }
  }

  // Tampilkan skeleton jika auth atau data sedang loading
  if (loading || isAuthLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Unggah Hasil Ujian Praktikum</CardTitle>
            <CardDescription>
              Unggah file presentasi (.ppt atau .pptx) hasil analisis studi kasus Anda. 
              File ini akan digunakan untuk sesi Unjuk Diri.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Pilih File (.ppt / .pptx)</Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  disabled={isUploading}
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 rounded-md">
                  <Check className="w-4 h-4" />
                  File siap diunggah: <span className="font-medium">{file.name}</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isUploading || !file}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4 mr-2" />
                    Unggah dan Selesaikan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}