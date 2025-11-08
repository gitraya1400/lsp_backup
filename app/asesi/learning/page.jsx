"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  mockGetUnitsForSkema, 
  mockGetMateriForUnit, 
  mockMarkUnitCompleted, 
  mockGetProgressAsesi,
  mockMarkMateriViewed
} from "@/lib/api-mock"
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Lock, Check, BookOpen } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link" 
import { Spinner } from "@/components/ui/spinner"
import { Play } from "next/font/google"

export default function LearningPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  const [units, setUnits] = useState([])
  const [progress, setProgress] = useState(null)
  const [materiByUnit, setMateriByUnit] = useState({})
  const [loading, setLoading] = useState(true) // Loading untuk data halaman
  const [expandedUnits, setExpandedUnits] = useState(new Set())
  const [saving, setSaving] = useState(false) // Loading untuk tombol "Selesaikan Unit"
  const [viewedMateri, setViewedMateri] = useState(new Set())
  const [viewingMateriId, setViewingMateriId] = useState(null) // Loading per tombol "Buka"

  useEffect(() => {
    // 1. Tunggu 'auth-context' selesai mengecek localStorage
    if (isAuthLoading) {
      return; 
    }
    // 2. Jika tidak ada user setelah cek, tendang ke login
    if (!user) {
      router.push("/login");
      return;
    }
    // 3. Jika ada user, baru muat data halaman
    loadData()
    
  }, [user, isAuthLoading, router]) // Dependensi yang benar

  const loadData = async () => {
    try {
      setLoading(true)
      const userSkemaId = user?.skemaId || "ADS"
      
      const [unitsData, progressData] = await Promise.all([
        mockGetUnitsForSkema(userSkemaId),
        mockGetProgressAsesi(user.id)
      ])
      
      setUnits(unitsData)
      setProgress(progressData) // progressData.completedUnitIds adalah Array
      
      // Inisialisasi state 'viewedMateri' dari data progres (database)
      // progressData.viewedMateriIds adalah Array, kita ubah jadi Set
      setViewedMateri(new Set(progressData.viewedMateriIds || [])) 
      
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMateri = async (unit) => {
    // Lazy load materi, jangan panggil API jika sudah ada
    if (materiByUnit[unit.id]) return

    try {
      const materi = await mockGetMateriForUnit(unit.id)
      setMateriByUnit((prev) => ({ ...prev, [unit.id]: materi }))
    } catch (error) {
      console.error("Error loading materi:", error)
    }
  }

    // New: Complete current unit then open next unit (if ada)
  const handleCompleteAndNext = async (unitIndex, unit) => {
    // 1) selesaikan unit saat ini
    try {
      await handleMarkUnitCompleted(unit)
    } catch (e) {
      // jika gagal menyelesaikan, hentikan
      return
    }

    // 2) buka materi untuk unit berikutnya dan expand
    const nextUnit = units[unitIndex + 1]
    if (!nextUnit) return // tidak ada unit berikutnya

    try {
      await loadMateri(nextUnit)
      setExpandedUnits((prev) => {
        const next = new Set(prev)
        // tutup unit sekarang, buka berikutnya
        next.delete(unit.id)
        next.add(nextUnit.id)
        return next
      })

      // Scroll ke unit berikutnya agar terlihat
      setTimeout(() => {
        document.getElementById(`unit-${nextUnit.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 150)
    } catch (e) {
      console.error("Gagal buka unit berikutnya:", e)
    }
  }


  const toggleUnitExpand = async (unit) => {
    await loadMateri(unit)
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      if (next.has(unit.id)) {
        next.delete(unit.id)
      } else {
        next.add(unit.id)
      }
      return next
    })
  }
  
  // Fungsi ini memanggil API untuk menyimpan progres "viewed"
  const handleViewMateri = async (materi) => {
    if (viewingMateriId === materi.id || !user) return
    
    window.open(materi.urlKonten, "_blank");
    
    if (viewedMateri.has(materi.id)) {
      return // review, tidak perlu panggil API
    }

    try {
      setViewingMateriId(materi.id) // Set loading di tombol spesifik
      const updatedProgress = await mockMarkMateriViewed(user.id, materi.id);

      // Sinkronkan state lokal dengan data terbaru dari server
      setProgress(updatedProgress);
      setViewedMateri(new Set(updatedProgress.viewedMateriIds));
    } catch (error) {
      console.error("Error marking materi viewed:", error);
      alert("Gagal menyimpan progres materi. Silakan coba lagi.");
    } finally {
      setViewingMateriId(null) // Hentikan loading di tombol
    }
  }

  // Fungsi ini memanggil API untuk menyimpan progres "unit selesai"
  const handleMarkUnitCompleted = async (unit) => {
    if (!user) return

    try {
      setSaving(true)
      const updatedProgress = await mockMarkUnitCompleted(user.id, unit.id)
      setProgress(updatedProgress) 
      setViewedMateri(new Set(updatedProgress.viewedMateriIds || []))
    } catch (error) {
      console.error("Error marking unit completed:", error)
    } finally {
      setSaving(false)
    }
  }

  // Tampilkan Skeleton jika Auth sedang loading ATAU data halaman sedang loading
  if (isAuthLoading || loading || !progress) {
     return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    )
  }

  // progress.completedUnitIds adalah ARRAY dari API
  // Kita ubah jadi SET di sini agar fungsi .has() berfungsi
  const completedUnitIds = new Set(progress?.completedUnitIds || [])
  const progressPercentage = progress?.progressPembelajaran || 0

 const isUnitLocked = (unitIndex) => {
    if (!progress) return true;
    // jika pra-asesmen belum selesai, kunci semua unit
    if (progress.statusPraAsesmen !== "SELESAI") return true;

    // setelah pra-asesmen selesai: buka unit pertama; unit i hanya terbuka jika unit i-1 sudah selesai
    if (unitIndex === 0) return false;
    const prevUnit = units[unitIndex - 1];
    return !completedUnitIds.has(prevUnit?.id);
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Alur Pembelajaran</h1>
          <p className="text-muted-foreground mt-1">
            Pelajari materi secara berurutan. Setiap unit harus diselesaikan sebelum membuka unit berikutnya
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Silahkan  buka semua materi di setiap unit (tombol "Buka" akan berubah menjadi "Review") 
            untuk mengaktifkan tombol "Selesaikan Unit Ini".
          </AlertDescription>
        </Alert>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress Pembelajaran</span>
                <span className="font-medium">
                  {completedUnitIds.size}/{units.length || 0} Unit ({progressPercentage}%)
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Units List */}
        <div className="space-y-2">
          {units.map((unit, idx) => {
              const isLocked = isUnitLocked(idx)
              // .has() aman karena completedUnitIds sudah jadi Set
              const isCompleted = completedUnitIds.has(unit.id)
              const isExpanded = expandedUnits.has(unit.id)
              const materi = materiByUnit[unit.id] || []

              // .has() aman karena viewedMateri adalah Set
              const allMateriViewed = materi.length > 0 && materi.every(m => viewedMateri.has(m.id))

              return (
                <Collapsible key={unit.id} open={isExpanded} onOpenChange={() => !isLocked && toggleUnitExpand(unit)}>
                    {/* sebuah kartu untuk expanded dan collapsed */}
                    <Card id={`unit-${unit.id}`} className={isLocked ? "opacity-60 bg-gray-50" : "bg-white"}>
                    <CollapsibleTrigger asChild disabled={isLocked}>
                      <div className={isLocked ? "cursor-not-allowed" : "cursor-pointer"}>
                        <CardHeader className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : isLocked ? (
                                  <Lock className="w-6 h-6 text-muted-foreground" />
                                ) : (
                                  <div className="w-6 h-6 border-2 border-primary rounded-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base">
                                  Unit {unit.nomorUnit}: {unit.judul}
                                  {isLocked && <span className="text-xs text-muted-foreground ml-2">(Terkunci)</span>}
                                </CardTitle>
                                <CardDescription className="mt-1">{unit.deskripsi}</CardDescription>
                                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                  <span>{unit.materiCount} Materi</span>
                                  <span>{unit.durasiTeori} menit</span>
                                </div>
                              </div>
                            </div>
                            {!isLocked && (
                              <div className="flex-shrink-0">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Content */}
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-6 border-t space-y-4">
                        {materi.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Tidak ada materi tersedia</p>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {materi.map((m, midx) => {
                                // .has() aman karena viewedMateri adalah Set
                                const isMateriViewed = viewedMateri.has(m.id);
                                const isViewingThisMateri = viewingMateriId === m.id;

                                return (
                                  <div key={m.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/20 rounded">
                                      <span className="text-xs font-medium">{midx + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{m.judul}</p>
                                      <p className="text-xs text-muted-foreground">{m.jenis}</p>
                                    </div>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isLocked || isViewingThisMateri}
                                      onClick={() => handleViewMateri(m)}
                                      className={`w-28 ${isMateriViewed ? "text-green-600 border-green-200" : "text-gray-700 border-gray-300 hover:text-gray-900 hover:border-gray-400"}`}
                                    >
                                      {isViewingThisMateri ? (
                                        <Spinner className="w-4 h-4" />
                                      ) : isMateriViewed ? (
                                        <>
                                          <Check className="w-4 h-4 mr-2" />
                                          Review
                                        </>
                                      ) : (
                                        <>
                                         <BookOpen className="w-4 h-4 mr-2" />
                                          Buka
                                          </>
                                      )}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>

                            {!isLocked && !isCompleted && (
                              <>
                                <Button
                                  onClick={() => handleMarkUnitCompleted(unit)}
                                  disabled={saving || !allMateriViewed} 
                                  className="w-full mt-4"
                                  title={!allMateriViewed ? "Harap buka semua materi di unit ini terlebih dahulu" : "Selesaikan Unit"}
                                >
                                  {saving ? <Spinner className="w-4 h-4 mr-2" /> : "Selesaikan Unit Ini"}
                                </Button>

                                {/* Tombol tambahan: Lanjut ke unit berikutnya (hanya tampil ketika tombol Selesaikan aktif) */}
                                { /* Tampilkan hanya jika bukan unit terakhir */ }
                                { (idx < (units.length - 1)) && (
                                  <Button
                                    onClick={() => handleCompleteAndNext(idx, unit)}
                                    disabled={saving || !allMateriViewed}
                                    variant="ghost"
                                    className="w-full mt-2 text-sm"
                                    title="Selesaikan unit ini lalu lanjut ke unit berikutnya"
                                  >
                                    Lanjut ke unit berikutnya
                                  </Button>
                                )}
                              </>
                            )}
                            {isCompleted && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Unit ini telah diselesaikan</span>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })
          }
        </div>

        {/* Next Steps */}
        {progressPercentage === 100 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="font-medium text-green-900 mb-3">Selamat! Anda telah menyelesaikan semua pembelajaran</p>
              <Button asChild>
                <Link href="/asesi/tryout">Lanjut ke Tryout</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </MainLayout>
  )
}