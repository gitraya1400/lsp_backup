"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle, FileText, Download, NotebookText, Mic, Brain } from "lucide-react"
import { mockGetHasilAkhir } from "@/lib/api-mock" 

export default function ResultsPage() {
  const { user } = useAuth()
  const [hasil, setHasil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadResults()
    }
  }, [user])

  const loadResults = async () => {
    try {
      setLoading(true)
      const hasilData = await mockGetHasilAkhir(user.id) // Panggil API baru
      setHasil(hasilData)
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper component biar rapi
  const StatusBadge = ({ status }) => {
    const isKompeten = status === "KOMPETEN"
    return (
      <div className={`flex items-center gap-2 ${isKompeten ? "text-green-600" : "text-red-600"}`}>
        {isKompeten ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        <span className="text-2xl font-bold">{status}</span>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Hasil Penilaian</h1>
          <p className="text-muted-foreground mt-1">Lihat hasil ujian dan status kompetensi Anda</p>
        </div>

        {/* Overall Status */}
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card
            className={`border-2 ${hasil?.statusAkhir === "KOMPETEN" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status Akhir</p>
                  <p className={`text-4xl font-bold ${hasil?.statusAkhir === "KOMPETEN" ? "text-green-700" : "text-red-700"}`}>
                    {hasil?.statusAkhir}
                  </p>
                </div>
                <div>
                  {hasil?.statusAkhir === "KOMPETEN" ? (
                    <CheckCircle2 className="w-20 h-20 text-green-600" />
                  ) : (
                    <AlertCircle className="w-20 h-20 text-red-600" />
                  )}
                </div>
              </div>

              {/* --- (BLOK INI TELAH DIREVISI) --- */}
              {hasil?.statusAkhir === "KOMPETEN" && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    Selamat! Anda telah dinyatakan KOMPETEN berdasarkan seluruh rangkaian asesmen.
                  </p>
                </div>
              )}
              {/* --- (BATAS REVISI) --- */}

              {hasil?.statusAkhir === "BELUM KOMPETEN" && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-700">
                    Anda dinyatakan BELUM KOMPETEN. Silakan hubungi admin untuk info lebih lanjut.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Rincian Penilaian</CardTitle>
            <CardDescription>Status kompetensi Anda berdasarkan 3 komponen ujian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <NotebookText className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">Ujian Praktikum</CardTitle>
                  <CardDescription>Penilaian studi kasus (upload file .ppt)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-10 w-32" /> : <StatusBadge status={hasil?.hasilPraktikum} />}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                 <Mic className="w-8 h-8 text-purple-600" />
                <div>
                  <CardTitle className="text-lg">Unjuk Diri</CardTitle>
                  <CardDescription>Penilaian presentasi di hadapan asesor</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-10 w-32" /> : <StatusBadge status={hasil?.hasilUnjukDiri} />}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Brain className="w-8 h-8 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">Ujian Teori (Akumulasi)</CardTitle>
                  <CardDescription>Akumulasi kelulusan dari semua unit kompetensi.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 {loading ? <Skeleton className="h-10 w-32" /> : (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <StatusBadge status={hasil?.hasilTeori.statusAkumulasi} />
                        <div className="text-right">
                            <p className="text-lg font-bold">{hasil?.hasilTeori.totalUnitLulus} / {hasil?.hasilTeori.totalUnitSkema}</p>
                            <p className="text-sm text-muted-foreground">Unit Lulus (Minimal 75%)</p>
                        </div>
                    </div>
                 )}
                 
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <p className="text-sm font-medium mb-2">Rincian Kelulusan per Unit (Minimal 75% Soal "SESUAI"):</p>
                    {loading ? <Skeleton className="h-20 w-full" /> : 
                      hasil?.hasilTeori.rincianUnit.map((unit) => (
                      <div key={unit.unitId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{unit.judul}</p>
                           <p className="text-xs text-muted-foreground">
                             {unit.soalSesuai} dari {unit.soalTotal} soal dinyatakan "SESUAI"
                           </p>
                        </div>
                        <p className={`text-sm font-bold ${unit.status === "KOMPETEN" ? "text-green-600" : "text-red-600"}`}>
                          {unit.status}
                        </p>
                      </div>
                    ))}
                  </div>

              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}