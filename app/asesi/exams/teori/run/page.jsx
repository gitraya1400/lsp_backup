"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Clock, Home, Loader2, MonitorOff } from "lucide-react"
import { 
  mockGetSoalForUnit, 
  mockGetUnitsForSkema, 
  mockSubmitUjianTeori,
  mockGetExamStatus // API BARU UNTUK KEAMANAN
} from "@/lib/api-mock"

// Fungsi helper untuk kunci localStorage yang unik per user & skema
const getExamStorageKey = (userId, skemaId) => `teori_exam_progress_${userId}_${skemaId}`;

export default function TeoriExamRunPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [units, setUnits] = useState([])
  const [soal, setSoal] = useState([])
  const [unitDetails, setUnitDetails] = useState([]) 
  
  const [isLoadingData, setIsLoadingData] = useState(true) // Ganti nama 'loading'
  const [isChecking, setIsChecking] = useState(true) // State untuk cek jadwal
  const [authError, setAuthError] = useState(null) // State untuk error jadwal

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // State yang akan di-persist (disimpan)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExamActive, setIsExamActive] = useState(false)
  
  const [isRestored, setIsRestored] = useState(false)
  //fullscreen
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  const storageKey = useMemo(() => {
    if (!user) return null
    return getExamStorageKey(user.id, user.skemaId)
  }, [user])

  const clearExamState = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // --- (FUNGSI BARU HELPER FULLSCREEN) ---
  const openFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        // Gagal otomatis, minta manual
        console.warn(`Gagal masuk fullscreen: ${err.message}. Meminta aksi user.`);
        setShowFullscreenWarning(true); // Tampilkan modal peringatan jika gagal
      });
    }
  }
  const closeFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error("Gagal keluar fullscreen:", err));
    }
  }
  const handleSubmitExam = useCallback(async () => {
    if (!user) return;
    
    setIsExamActive(false)
    
    console.log("Ujian Teori submitted with answers:", answers)
    await mockSubmitUjianTeori(user.id, answers);
    
    clearExamState(); 
    
    alert("Ujian Teori selesai! Jawaban Anda telah dikirim untuk dinilai.")
    router.push("/asesi/exams")
  }, [answers, user, router, clearExamState])

  // Efek Samping: Timer Ujian (Tidak berubah, sudah benar)
  useEffect(() => {
    if (!isExamActive || !isRestored) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isExamActive, isRestored, handleSubmitExam])

// --- (EFEK SAMPING BARU: FULLSCREEN HANDLER) ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Cek jika user keluar fullscreen saat ujian masih aktif
      if (!document.fullscreenElement && isExamActive) {
        setIsExamActive(false); // Jeda ujian (timer berhenti)
        setShowFullscreenWarning(true); // Tampilkan modal peringatan
      }
    };

    if (isExamActive && isRestored) {
      // Jika ujian dimulai (atau dilanjutkan), paksa fullscreen
      openFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isExamActive, isRestored]);

  // Ini diperlukan agar bisa jadi dependensi useEffect dengan aman
  const loadExamData = useCallback(async () => {
    if (!user || !storageKey) return; // Safety check

    try {
      setIsLoadingData(true)
      const skemaId = user.skemaId || "ADS"
      const unitsData = await mockGetUnitsForSkema(skemaId)
      setUnits(unitsData)

      const totalDurasiMenit = unitsData.reduce((sum, unit) => sum + (unit.durasiTeori || 15), 0)
      const totalDurationInSeconds = totalDurasiMenit * 60
      
      const allSoalPromises = unitsData.map(unit => mockGetSoalForUnit(unit.id, "UJIAN_TEORI"))
      const allSoalArrays = await Promise.all(allSoalPromises)
      const combinedSoal = allSoalArrays.flat()
      setSoal(combinedSoal)
      
      const details = unitsData.map((unit, index) => ({
        ...unit,
        soalCount: allSoalArrays[index].length
      }))
      setUnitDetails(details)

      // Logika Pemulihan (Robustness)
      const savedStateJSON = localStorage.getItem(storageKey)
      
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON)
        setAnswers(savedState.answers || {})
        setTimeLeft(savedState.timeLeft || totalDurationInSeconds)
        setIsExamActive(true) // Langsung masuk ke ujian
      } else {
        setAnswers({})
        setTimeLeft(totalDurationInSeconds)
        setIsExamActive(false) // Tampilkan layar Pre-Start
      }
      
    } catch (error) {
      console.error("Error loading exam:", error)
      setAuthError("Gagal memuat data soal ujian.") // Set error jika load gagal
    } finally {
      setIsLoadingData(false)
      setIsRestored(true)
    }
  }, [user, storageKey]); // Dependensi useCallback


  // Efek Samping: Cek Keamanan & Jadwal
  useEffect(() => {
    if (isAuthLoading) return; // 1. Tunggu auth
    if (!user) { // 2. Cek user
      router.push("/login");
      return;
    }
    if (!storageKey) return; // 3. Tunggu key siap

    const checkScheduleAndLoad = async () => {
      try {
        setIsChecking(true);
        setAuthError(null);
        const status = await mockGetExamStatus(user.id);

        // 4. Cek Prasyarat Dasar
        if (status.teori.status === "TERKUNCI") {
          setAuthError("Anda belum memenuhi prasyarat (menyelesaikan Tryout) untuk ujian ini.");
          return;
        }
        if (status.teori.status === "MENUNGGU_JADWAL") {
          setAuthError("Ujian Teori Anda belum dijadwalkan oleh Admin.");
          return;
        }

        // 5. Cek Jadwal (Ini adalah *offline guard*)
        const jadwal = status.teori.jadwal;
        if (!jadwal) {
          setAuthError("Jadwal ujian tidak ditemukan (Error: ST-JNF).");
          return;
        }

        // 6. Cek Tanggal
        const isToday = new Date().toDateString() === new Date(jadwal.tanggal).toDateString();
        
        // (CATATAN: Di development, kita longgarkan cek tanggal ini)
        if (!isToday) {
          console.warn("DEV_MODE: Cek tanggal ujian diabaikan.");
          // Jika ingin ketat di production, uncomment baris di bawah:
          // setAuthError(`Ujian ini hanya bisa diakses pada ${new Date(jadwal.tanggal).toLocaleDateString("id-ID")}.`);
          // return;
        }

        // --- Lolos Cek Keamanan ---
        setAuthError(null);
        // Panggil fungsi pemuat data yang sudah di-wrap useCallback
        loadExamData(); 

      } catch (error) {
        console.error("Gagal cek status ujian:", error);
        setAuthError("Gagal memverifikasi status ujian Anda.");
      } finally {
        setIsChecking(false);
      }
    }

    checkScheduleAndLoad();
  }, [user, isAuthLoading, router, storageKey, loadExamData]); // Tambah loadExamData


  // Efek Samping: Simpan Jawaban (Tidak berubah, sudah benar)
  useEffect(() => {
    if (!isExamActive || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}"
      const currentState = JSON.parse(stateJSON)
      currentState.answers = answers
      localStorage.setItem(storageKey, JSON.stringify(currentState))
    } catch (e) { console.error("Gagal simpan jawaban:", e) }
  }, [answers, isExamActive, isRestored, storageKey])

  // Efek Samping: Simpan Waktu (Tidak berubah, sudah benar)
  useEffect(() => {
    if (!isExamActive || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}"
      const currentState = JSON.parse(stateJSON)
      if (currentState.timeLeft !== timeLeft) {
        currentState.timeLeft = timeLeft
        localStorage.setItem(storageKey, JSON.stringify(currentState))
      }
    } catch (e) { console.error("Gagal simpan waktu:", e) }
  }, [timeLeft, isExamActive, isRestored, storageKey])


  // --- Handlers (Tidak berubah) ---
  const handleStartExam = () => setIsExamActive(true)
  const handleAnswerChange = (value) => {
    const currentSoalId = soal[currentQuestionIndex]?.id;
    if (!currentSoalId) return;
    setAnswers((prev) => ({ ...prev, [currentSoalId]: value }))
  }
  const handleNextQuestion = () => {
    if (currentQuestionIndex < soal.length - 1) setCurrentQuestionIndex((prev) => prev + 1)
  }
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1)
  }
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  // --- Batas Handlers ---


  if (isAuthLoading || isChecking) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memverifikasi jadwal ujian Anda...</p>
        </div>
      </MainLayout>
    )
  }

  // Jika GAGAL cek keamanan
  if (authError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/asesi/exams">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Halaman Ujian
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  // Tampilkan skeleton B HANYA jika data soal sedang dimuat
  if (isLoadingData) {
     return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    )
  }

  if ((!units || units.length === 0 || !soal || soal.length === 0) && !isLoadingData) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Soal ujian teori tidak ditemukan untuk skema Anda.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  const currentSoal = soal[currentQuestionIndex];
  const currentUnit = units.find(u => u.id === currentSoal?.unitId);
  const answeredCount = Object.keys(answers).length;
  const totalDurationMinutes = Math.floor(units.reduce((sum, unit) => sum + (unit.durasiTeori || 15), 0));

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {!isExamActive ? (
          // Layar Pre-exam (Tidak berubah)
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                Ujian Teori Skema {user?.skemaId}
              </CardTitle>
              <CardDescription>
                Rincian soal dan durasi per unit kompetensi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
                {unitDetails.map(unit => (
                  <div key={unit.id} className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">
                      Unit {unit.nomorUnit}: {unit.judul}
                    </p>
                    <p className="font-medium">{unit.soalCount} Soal ({unit.durasiTeori} Menit)</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Soal</p>
                  <p className="text-2xl font-bold mt-2">{soal.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Durasi Ujian</p>
                  <p className="text-2xl font-bold mt-2">{totalDurationMinutes} menit</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ujian akan dimulai segera. Pastikan Anda siap dan koneksi internet stabil. Waktu tidak dapat dijeda
                  atau diulang setelah dimulai.
                </AlertDescription>
              </Alert>

              <Button onClick={handleStartExam} size="lg" className="w-full">
                Mulai Ujian
              </Button>
            </CardContent>
          </Card>

        ) : (
          // Layar Ujian Aktif (Tidak berubah)
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Ujian Teori Skema {user?.skemaId}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soal {currentQuestionIndex + 1} dari {soal.length}
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-destructive" : ""}`}>
                      <Clock className="w-5 h-5 inline mr-2" />
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  {currentUnit && (
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-2">
                      Unit {currentUnit.nomorUnit}: {currentUnit.judul}
                    </div>
                  )}
                  <CardTitle className="text-base">
                    {currentSoal.teks}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ketik jawaban esai Anda di sini..."
                    value={answers[currentSoal?.id] || ""} 
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="min-h-40"
                  />
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === soal.length - 1}
                  className="flex-1 bg-transparent"
                >
                  Selanjutnya
                </Button>
                {currentQuestionIndex === soal.length - 1 && (
                  <Button onClick={() => setShowConfirmSubmit(true)} className="flex-1">
                    Selesaikan Ujian
                  </Button>
                )}
              </div>
            </div>
            <Card className="lg:sticky lg:top-6 h-fit">
              <CardHeader>
                <CardTitle className="text-base">
                  Daftar Soal ({answeredCount}/{soal.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {soal.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-full aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors ${
                        currentQuestionIndex === idx
                          ? "bg-primary text-primary-foreground"
                          : answers[s.id] 
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog Konfirmasi (Tidak berubah) */}
        <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Selesaikan Ujian</DialogTitle>
              <DialogDescription>
                Anda telah menjawab {answeredCount} dari {soal.length} soal. Yakin ingin menyelesaikan ujian?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Lanjut Menjawab
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmSubmit(false)
                  handleSubmitExam()
                }}
              >
                Ya, Selesaikan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}