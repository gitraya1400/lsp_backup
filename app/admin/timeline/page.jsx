"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Users, Home as HomeIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockGetSesiUjianOffline, mockCreateSesiUjianOffline, mockGetAllSkema } from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

function CreateSesiModal({ onSesiCreated }) {
  const [open, setOpen] = useState(false)
  const [skemaId, setSkemaId] = useState("")
  const [tipeUjian, setTipeUjian] = useState("")
  const [tanggal, setTanggal] = useState(null)
  const [waktu, setWaktu] = useState("")
  const [ruangan, setRuangan] = useState("")
  const [kapasitas, setKapasitas] = useState("")
  const [skemaOptions, setSkemaOptions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      mockGetAllSkema().then(setSkemaOptions)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!skemaId || !tipeUjian || !tanggal || !waktu || !ruangan || !kapasitas) {
      setError("Semua field wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const sesiData = {
        skemaId,
        tipeUjian,
        tanggal,
        waktu,
        ruangan,
        kapasitas: parseInt(kapasitas),
      }
      const newSesi = await mockCreateSesiUjianOffline(sesiData)
      onSesiCreated(newSesi)
      setOpen(false)
      // Reset form
      setSkemaId("")
      setTipeUjian("")
      setTanggal(null)
      setWaktu("")
      setRuangan("")
      setKapasitas("")
    } catch (err) {
      setError(err.message || "Gagal membuat sesi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Buat Sesi Ujian Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Sesi Ujian Offline</DialogTitle>
          <DialogDescription>
            Buat jadwal untuk ujian yang dilaksanakan secara tatap muka (Ujian Teori / Unjuk Diri).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skema">Skema</Label>
            <Select value={skemaId} onValueChange={setSkemaId}>
              <SelectTrigger id="skema">
                <SelectValue placeholder="Pilih skema" />
              </SelectTrigger>
              <SelectContent>
                {skemaOptions.map((skema) => (
                  <SelectItem key={skema.id} value={skema.id}>{skema.judul}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipe-sesi">Tipe Sesi Ujian</Label>
            <Select value={tipeUjian} onValueChange={setTipeUjian}>
              <SelectTrigger id="tipe-sesi">
                <SelectValue placeholder="Pilih tipe sesi" />
              </SelectTrigger>
              <SelectContent>
                {/* --- (INI PERBAIKANNYA) --- */}
                <SelectItem value="TEORI">Ujian Teori (Offline)</SelectItem>
                <SelectItem value="UNJUK_DIRI">Ujian Unjuk Diri</SelectItem> 
                {/* --- (BATAS PERBAIKAN - TYPO DIHAPUS) --- */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="tanggal"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggal ? tanggal.toLocaleDateString("id-ID") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tanggal}
                  onSelect={setTanggal}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waktu">Waktu (WIB)</Label>
              <Input id="waktu" value={waktu} onChange={(e) => setWaktu(e.target.value)} placeholder="Contoh: 09:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitas">Kapasitas</Label>
              <Input id="kapasitas" type="number" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} placeholder="Contoh: 50" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ruangan">Ruangan</Label>
            <Input id="ruangan" value={ruangan} onChange={(e) => setRuangan(e.target.value)} placeholder="Contoh: Auditorium STIS" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Sesi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TimelinePage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [sesiUjian, setSesiUjian] = useState([])
  const [loading, setLoading] = useState(true)
  const [skemaOptions, setSkemaOptions] = useState([])
  const [selectedSkema, setSelectedSkema] = useState("")

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login")
      return;
    }
    
    mockGetAllSkema().then(options => {
      setSkemaOptions(options)
      if (options.length > 0) {
        setSelectedSkema(options[0].id)
      }
    })
  }, [user, isAuthLoading, router])

  useEffect(() => {
    if (selectedSkema) {
      loadSesiUjian(selectedSkema)
    }
  }, [selectedSkema])

  const loadSesiUjian = async (skemaId) => {
    try {
      setLoading(true)
      const data = await mockGetSesiUjianOffline(skemaId)
      setSesiUjian(data)
    } catch (error) {
      console.error("Error loading sesi ujian:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSesiCreated = (newSesi) => {
    // Jika sesi baru sesuai skema yang dipilih, tambahkan ke list
    if (newSesi.skemaId === selectedSkema) {
      setSesiUjian(prev => [newSesi, ...prev])
    }
  }

  const getTipeUjianLabel = (tipe) => {
    if (tipe === "UNJUK_DIRI") return "Unjuk Diri"
    if (tipe === "TEORI") return "Ujian Teori"
    return tipe
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Jadwal Ujian</h1>
            <p className="text-muted-foreground mt-1">Buat dan kelola sesi ujian offline (Ujian Teori & Unjuk Diri).</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Select value={selectedSkema} onValueChange={setSelectedSkema}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih skema" />
              </SelectTrigger>
              <SelectContent>
                {skemaOptions.map((skema) => (
                  <SelectItem key={skema.id} value={skema.id}>{skema.judul}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateSesiModal onSesiCreated={handleSesiCreated} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Sesi Ujian (Skema: {selectedSkema})</CardTitle>
            <CardDescription>Klik sesi untuk melihat dan mengatur peserta (plotting).</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : sesiUjian.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Belum ada sesi ujian yang dibuat untuk skema ini.</p>
            ) : (
              <div className="space-y-4">
                {sesiUjian.map((sesi) => (
                  <Card 
                    key={sesi.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/admin/offline-exam/${sesi.id}`)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sesi.tipeUjian === "TEORI" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                          {getTipeUjianLabel(sesi.tipeUjian)}
                        </span>
                        <h3 className="font-semibold text-lg">{sesi.ruangan}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {new Date(sesi.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {sesi.waktu} WIB
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{/* (plottingDb.get(sesi.id) || []).length */}</span>
                        <p className="text-sm text-muted-foreground">/ {sesi.kapasitas} Peserta</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}