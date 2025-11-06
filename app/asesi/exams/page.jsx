"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGetExamStatus } from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, Clock, FileUp, Lock, PlayCircle, Download, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Helper untuk Alert Terkunci
const LockAlert = ({ message }) => (
  <Alert variant="destructive" className="bg-red-50 border-red-200">
    <Lock className="h-4 w-4 text-red-700" />
    <AlertTitle className="text-red-800">Ujian Terkunci</AlertTitle>
    <AlertDescription className="text-red-700">{message}</AlertDescription>
  </Alert>
);

// Helper untuk menampilkan jadwal
const JadwalInfo = ({ jadwal }) => (
  <Alert className="bg-blue-50 border-blue-200">
    <Calendar className="h-4 w-4 text-blue-700" />
    <AlertTitle className="text-blue-800">Ujian Telah Dijadwalkan</AlertTitle>
    <AlertDescription className="text-blue-900 mt-2">
      Sesi Anda akan dilaksanakan pada: <br />
      <span className="font-semibold">{new Date(jadwal.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}</span><br />
      Pukul <span className="font-semibold">{jadwal.waktu}</span> di <span className="font-semibold">{jadwal.ruangan}</span>.
    </AlertDescription>
  </Alert>
);

// Helper untuk Alert Menunggu
const WaitAlert = ({ message }) => (
  <Alert>
    <Clock className="h-4 w-4" />
    <AlertTitle>Menunggu Jadwal</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

// Helper untuk Alert Selesai
const SuccessAlert = ({ message }) => (
  <Alert className="bg-green-50 border-green-200">
    <CheckCircle2 className="h-4 w-4 text-green-700" />
    <AlertTitle className="text-green-800">Selesai</AlertTitle>
    <AlertDescription className="text-green-900">{message}</AlertDescription>
  </Alert>
);


export default function ExamsPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [examStatus, setExamStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Perbaikan untuk bug refresh
    if (isAuthLoading) return; 
    if (!user) {
      router.push("/login");
      return;
    }
    // Jika user ada, baru load data
    loadStatus();
  }, [user, isAuthLoading, router])

  const loadStatus = async () => {
    if (!user) return;
    try {
      setLoading(true)
      const statusData = await mockGetExamStatus(user.id)
      setExamStatus(statusData)
    } catch (error) {
      console.error("Error loading exam status:", error)
    } finally {
      setLoading(false)
    }
  }

  // Tampilkan Skeleton saat auth atau data sedang loading
  if (loading || isAuthLoading || !examStatus) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    )
  }
  
  const { teori, praktikum, unjukDiri } = examStatus;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ujian Sertifikasi</h1>
          <p className="text-muted-foreground mt-1">
            Ikuti ujian teori, praktikum, dan unjuk diri sesuai jadwal dan prasyarat.
          </p>
        </div>

        <Tabs defaultValue="teori" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teori">Ujian Teori</TabsTrigger>
            <TabsTrigger value="praktikum">Ujian Praktikum</TabsTrigger>
            <TabsTrigger value="unjuk-diri">Unjuk Diri</TabsTrigger>
          </TabsList>

          {/* TAB UJIAN TEORI */}
          <TabsContent value="teori" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ujian Teori (Offline Terjadwal)</CardTitle>
                <CardDescription>Ujian ini dilaksanakan di kampus menggunakan LMS sesuai jadwal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teori.status === "TERKUNCI" && (
                  <LockAlert message="Anda harus menyelesaikan Pembelajaran dan Tryout terlebih dahulu." />
                )}
                
                {teori.status === "MENUNGGU_JADWAL" && (
                  <WaitAlert message="Anda sudah siap. Silakan tunggu Admin menjadwalkan sesi Ujian Teori Anda." />
                )}
                
                {teori.status === "SELESAI" && (
                  <SuccessAlert message="Anda telah menyelesaikan Ujian Teori." />
                )}

                {teori.status === "SIAP_DIJADWALKAN" && (
                  <div className="space-y-4">
                    <JadwalInfo jadwal={teori.jadwal} />
                    <div className="p-4 bg-muted rounded-lg flex items-center justify-between gap-4">
                       <div>
                         <h4 className="font-medium">Ujian Teori Skema {user.skemaId}</h4>
                         <p className="text-sm text-muted-foreground mt-1">
                           Tombol 'Mulai' hanya akan aktif di lokasi dan jam ujian.
                         </p>
                       </div>
                       <Button asChild>
                         <Link href="/asesi/exams/teori/run">
                           <PlayCircle className="w-4 h-4 mr-2" />
                           Mulai Ujian Teori
                         </Link>
                       </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB UJIAN PRAKTIKUM (ROMBAK LOGIKA) */}
          <TabsContent value="praktikum" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ujian Praktikum (Online)</CardTitle>
                <CardDescription>Download soal & data, lalu unggah 1 file presentasi (.ppt) hasil analisis Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {praktikum.status === "TERKUNCI" && (
                  <LockAlert message="Anda harus menyelesaikan Pembelajaran dan Tryout terlebih dahulu." />
                )}
                
                {praktikum.status === "SELESAI" && (
                  <SuccessAlert message="Anda telah mengunggah file jawaban. Silakan tunggu jadwal Unjuk Diri." />
                )}

                {praktikum.status === "AKTIF" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Silakan unduh soal dan data studi kasus. Kerjakan analisis secara offline
                      sesuai instruksi, lalu unggah hasil akhir Anda.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" asChild>
                        <a href="https://example.com/soal-praktikum-skema-ds.zip" target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download Soal & Data (.zip)
                        </a>
                      </Button>
                      <Button asChild>
                        <Link href="/asesi/exams/praktikum/upload">
                          <FileUp className="w-4 h-4 mr-2" />
                          Unggah File PPT
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB UNJUK DIRI */}
          <TabsContent value="unjuk-diri" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Unjuk Diri (Offline Terjadwal)</CardTitle>
                <CardDescription>
                  Presentasikan hasil analisis praktikum Anda di hadapan asesor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unjukDiri.status === "TERKUNCI" && (
                  <LockAlert message="Anda harus mengunggah hasil Ujian Praktikum terlebih dahulu." />
                )}

                {unjukDiri.status === "MENUNGGU_JADWAL" && (
                  <WaitAlert message="Anda sudah siap (hasil praktikum terkirim). Silakan tunggu Admin menjadwalkan sesi Unjuk Diri Anda." />
                )}
                
                {unjukDiri.status === "SIAP_DIJADWALKAN" && (
                   <JadwalInfo jadwal={unjukDiri.jadwal} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}