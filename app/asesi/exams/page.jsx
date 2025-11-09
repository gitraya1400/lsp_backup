"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  mockGetExamStatus,
  mockMarkUnjukDiriCompleted,
  mockGetSoalPraktikumGabungan, // <-- Impor baru
  mockSubmitPraktikum         // <-- Impor baru
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  AlertCircle, CheckCircle2, Clock, FileUp, Lock, PlayCircle, 
  Download, Calendar, Loader2, FileText 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- Helper Components (Tidak Berubah) ---

const LockAlert = ({ message }) => (
  <Alert variant="destructive" className="bg-red-50 border-red-200">
    <Lock className="h-4 w-4 text-red-700" />
    <AlertTitle className="text-red-800">Ujian Terkunci</AlertTitle>
    <AlertDescription className="text-red-700">{message}</AlertDescription>
  </Alert>
);

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

const WaitAlert = ({ message }) => (
  <Alert>
    <Clock className="h-4 w-4" />
    <AlertTitle>Menunggu Jadwal</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const SuccessAlert = ({ message }) => (
  <Alert className="bg-green-50 border-green-200">
    <CheckCircle2 className="h-4 w-4 text-green-700" />
    <AlertTitle className="text-green-800">Selesai</AlertTitle>
    <AlertDescription className="text-green-900">{message}</AlertDescription>
  </Alert>
);

// --- Komponen Utama Halaman ---

export default function ExamsPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  // State untuk status ujian
  const [examStatus, setExamStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // State untuk Unjuk Diri
  const [isSubmittingUnjukDiri, setIsSubmittingUnjukDiri] = useState(false); 

  // --- State Baru (Digabung dari upload/page.jsx) ---
  const [soalPraktikum, setSoalPraktikum] = useState(null); 
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  // --- Batas State Baru ---

  useEffect(() => {
    if (isAuthLoading) return; 
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthLoading, router])

  // --- Fungsi loadData (Diperbarui) ---
  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true)
      const statusData = await mockGetExamStatus(user.id)
      setExamStatus(statusData)

      // Jika praktikum aktif, langsung ambil data soalnya
      if (statusData.praktikum.status === "AKTIF") {
        const soalData = await mockGetSoalPraktikumGabungan(user.skemaId)
        setSoalPraktikum(soalData)
      }
      
    } catch (error) {
      console.error("Error loading exam status:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // --- Handler Baru (Digabung dari upload/page.jsx) ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileType = selectedFile.type
      if (fileType === "application/vnd.ms-powerpoint" || fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
        setFile(selectedFile)
        setUploadError(null)
      } else {
        setFile(null)
        setUploadError("File harus berekstensi .ppt atau .pptx")
      }
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setUploadError("Silakan pilih file terlebih dahulu.")
      return
    }
    if (!user) {
      setUploadError("Sesi Anda berakhir. Silakan login kembali.");
      return;
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      await mockSubmitPraktikum(user.id, file.name)
      alert("File praktikum Anda berhasil diunggah!")
      await loadData(); // Muat ulang semua data
    } catch (err) {
      console.error("Gagal mengunggah file:", err)
      setUploadError("Terjadi kesalahan saat mengunggah file. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
    }
  }
  // --- Batas Handler Baru ---

  const handleMarkUnjukDiriComplete = async () => {
    if (!user || !confirm("Apakah Anda yakin sudah melaksanakan sesi Unjuk Diri? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    
    setIsSubmittingUnjukDiri(true);
    try {
      await mockMarkUnjukDiriCompleted(user.id);
      await loadData(); 
    } catch (error) {
      console.error("Gagal menandai unjuk diri selesai:", error);
      alert("Gagal menyimpan status. Silakan coba lagi.");
    } finally {
      setIsSubmittingUnjukDiri(false);
    }
  }

  if (loading || isAuthLoading || !examStatus || !user) {
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
          <h1 className="text-3xl font-bold">Ujian Kompetensi</h1>

        </div>

        <Tabs defaultValue="teori" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teori">Ujian Teori</TabsTrigger>
            <TabsTrigger value="praktikum">Ujian Praktikum</TabsTrigger>
            <TabsTrigger value="unjuk-diri">Unjuk Diri</TabsTrigger>
          </TabsList>

          {/* TAB UJIAN TEORI (Tidak Berubah) */}
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

          {/* TAB UJIAN PRAKTIKUM (REVISI TOTAL) */}
          <TabsContent value="praktikum" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ujian Praktikum (Online)</CardTitle>
                <CardDescription>Kerjakan studi kasus dan unggah file presentasi (.ppt) hasil analisis Anda.</CardDescription>
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
                    {/* Tampilkan Skeleton jika soal belum termuat */}
                    {!soalPraktikum ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <>
                        {/* 1. KARTU DEADLINE */}
                        {praktikum.deadline ? (
                          <Alert className="bg-yellow-50 border-yellow-300 text-yellow-900">
                            <Clock className="h-4 w-4 text-yellow-700" />
                            <AlertTitle className="text-yellow-900 font-semibold">Batas Waktu Pengumpulan</AlertTitle>
                            <AlertDescription>
                              Harap unggah file praktikum Anda sebelum H-1 Unjuk Diri, yaitu: 
                              <strong className="ml-1">
                                {new Date(praktikum.deadline).toLocaleDateString("id-ID", {
                                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </strong>
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert>
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Batas Waktu Belum Ditentukan</AlertTitle>
                             <AlertDescription>
                               Batas waktu pengumpulan akan muncul setelah sesi Unjuk Diri Anda dijadwalkan oleh admin.
                             </AlertDescription>
                          </Alert>
                        )}

                        {/* 2. KARTU INSTRUKSI & DOWNLOAD */}
                        <Card className="border-muted-foreground/30">
                          <CardHeader>
                            <CardTitle className="text-lg">{soalPraktikum.judul}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="font-semibold">Instruksi Pengerjaan</Label>
                              <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">
                                {soalPraktikum.teks}
                              </p>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">File Pendukung</Label>
                              <div className="space-y-2 mt-2">
                                {soalPraktikum.filePendukung.map((file) => (
                                  <a 
                                    key={file.id} 
                                    href={file.url} // <-- LINK BARU YANG AMAN
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-5 h-5 text-primary" />
                                      <div>
                                        <p className="font-medium text-sm">{file.nama}</p>
                                        <p className="text-xs text-muted-foreground">{file.size}</p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-muted-foreground" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* 3. KARTU UPLOAD */}
                        <Card className="border-muted-foreground/30">
                          <CardHeader>
                            <CardTitle className="text-lg">Unggah Jawaban</CardTitle>
                            <CardDescription>
                              Unggah 1 file presentasi (.ppt atau .pptx) yang berisi hasil akhir Anda.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
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

                              {uploadError && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>{uploadError}</AlertDescription>
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
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB UNJUK DIRI (Tidak Berubah) */}
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
                
                {unjukDiri.status === "SELESAI" && (
                   <SuccessAlert message="Anda telah dikonfirmasi menyelesaikan sesi Unjuk Diri." />
                )}
                
                {unjukDiri.status === "SIAP_DIJADWALKAN" && (
                   <div className="space-y-4">
                      <JadwalInfo jadwal={unjukDiri.jadwal} />
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Konfirmasi Kehadiran</AlertTitle>
                        <AlertDescription>
                          Setelah Anda selesai melaksanakan sesi presentasi Unjuk Diri sesuai jadwal di atas, 
                          silakan tekan tombol di bawah ini untuk menandai bahwa Anda telah menyelesaikan tahap ini.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        className="w-full" 
                        onClick={handleMarkUnjukDiriComplete}
                        disabled={isSubmittingUnjukDiri}
                      >
                        {isSubmittingUnjukDiri ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Tandai Selesai Telah Mengikuti Unjuk Diri
                      </Button>
                   </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}