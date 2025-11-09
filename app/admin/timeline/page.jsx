"use client"

import React, { useEffect, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Users, Video, Info, UserCheck, Edit2, User as UserIcon, Presentation } from "lucide-react"
// --- (PERBAIKAN 1: Impor CalendarDayButton) ---
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  mockGetSesiUjianOffline, 
  mockCreateSesiUjianOffline, 
  mockGetAllSkema,
  mockGetLinimasa, 
  mockCreateLinimasa,
  mockGetAsesorUsers
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils" 

// ===============================================================
// --- (PERBAIKAN 2: Komponen Kalender Kustom) ---
// ===============================================================

const EventTag = ({ event }) => {
  let Icon = Info;
  let colors = "bg-blue-500 text-white";
  let label = event.type || "Info";

  switch (event.type) {
    case "announcement":
      Icon = AlertCircle;
      colors = "bg-yellow-500 text-white";
      label = "Info";
      break;
    case "exam":
      Icon = UserCheck;
      colors = "bg-purple-600 text-white";
      label = "Ujian";
      break;
    case "event": 
      Icon = Video;
      colors = "bg-blue-500 text-white";
      label = "Sesi";
      break;
    default:
      Icon = Info;
      break;
  }
  
  const titleWord = event.title.split(' ').find(word => word.length > 2 && !word.startsWith('[')) || label;

  return (
    <div className={cn("event-tag", colors)}>
      <Icon className="w-3 h-3" />
      <span className="truncate">{titleWord.length > 10 ? label : titleWord}</span>
    </div>
  );
};

// --- Ganti DayButton jadi CalendarDayButton ---
const CustomDayButton = ({ linimasa = [], ...props }) => {
  const day = props.day;
  const eventsForDay = useMemo(() => {
    if (!Array.isArray(linimasa)) {
      return [];
    }
    return linimasa.filter(
      (event) => event.date === day.date.toDateString()
    );
  }, [linimasa, day.date]);

  return (
    // --- Ganti dari <DayButton> ke <CalendarDayButton> ---
    <CalendarDayButton {...props}>
      {props.children}
      {eventsForDay.length > 0 && (
        <div className="event-tag-container">
          {eventsForDay.slice(0, 2).map((event) => ( 
            <EventTag key={event.id} event={event} />
          ))}
          {eventsForDay.length > 2 && (
             <div className="event-tag-more">
              +{eventsForDay.length - 2} lagi
            </div>
          )}
        </div>
      )}
    </CalendarDayButton>
    // --- Batas Ganti ---
  );
};

// ===============================================================
// --- BATAS KODE BARU ---
// ===============================================================


// Modal 1: CreateSesiModal (Tidak Berubah)
function CreateSesiModal({ skemaOptions, onSesiCreated }) {
  const [open, setOpen] = useState(false)
  const [skemaId, setSkemaId] = useState("")
  const [tipeUjian, setTipeUjian] = useState("")
  const [tanggal, setTanggal] = useState(null)
  const [waktu, setWaktu] = useState("")
  const [ruangan, setRuangan] = useState("")
  const [kapasitas, setKapasitas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

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
        <Button variant="outline">
          <UserCheck className="w-4 h-4 mr-2" />
          Buat Sesi Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Sesi Ujian Offline</DialogTitle>
          <DialogDescription>
            Buat jadwal untuk ujian tatap muka (Ujian Teori / Unjuk Diri).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skema-sesi">Skema</Label>
            <Select value={skemaId} onValueChange={setSkemaId}>
              <SelectTrigger id="skema-sesi">
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
                <SelectItem value="TEORI">Ujian Teori (Offline)</SelectItem>
                <SelectItem value="UNJUK_DIRI">Ujian Unjuk Diri</SelectItem> 
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggal-sesi">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="tanggal-sesi" variant={"outline"} className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggal ? tanggal.toLocaleDateString("id-ID") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waktu-sesi">Waktu (WIB)</Label>
              <Input id="waktu-sesi" value={waktu} onChange={(e) => setWaktu(e.target.value)} placeholder="Contoh: 09:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitas-sesi">Kapasitas</Label>
              <Input id="kapasitas-sesi" type="number" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} placeholder="Contoh: 50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruangan-sesi">Ruangan</Label>
            <Input id="ruangan-sesi" value={ruangan} onChange={(e) => setRuangan(e.target.value)} placeholder="Contoh: Auditorium STIS" />
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

// Modal 2: CreateLinimasaModal (Tidak Berubah, sudah fix)
function CreateLinimasaModal({ skemaOptions, asesorList, onEventCreated }) {
  const [open, setOpen] = useState(false)
  const [skemaId, setSkemaId] = useState("UMUM")
  const [tipe, setTipe] = useState("PEMBELAJARAN")
  const [judul, setJudul] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [tanggal, setTanggal] = useState(null)
  const [waktu, setWaktu] = useState("")
  const [urlZoom, setUrlZoom] = useState("")
  const [pemateriAsesorId, setPemateriAsesorId] = useState("") 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!judul || !deskripsi || !tanggal) {
      setError("Judul, Deskripsi, dan Tanggal wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const finalPemateriId = (tipe === "PEMBELAJARAN" && pemateriAsesorId !== "NONE" && pemateriAsesorId !== "") 
        ? pemateriAsesorId 
        : "";

      const eventData = {
        skemaId,
        tipe,
        judul,
        deskripsi,
        tanggal,
        waktu: waktu || "Sepanjang hari",
        urlZoom: tipe === "PEMBELAJARAN" ? urlZoom : "",
        pemateriAsesorId: finalPemateriId, 
      }
      const newEvent = await mockCreateLinimasa(eventData)
      onEventCreated(newEvent)
      setOpen(false)
      // Reset form
      setSkemaId("UMUM"); setTipe("PEMBELAJARAN"); setJudul(""); setDeskripsi("");
      setTanggal(null); setWaktu(""); setUrlZoom("");
      setPemateriAsesorId(""); 
    } catch (err) {
      setError(err.message || "Gagal membuat kegiatan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Buat Kegiatan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Kegiatan Linimasa</DialogTitle>
          <DialogDescription>
            Buat jadwal non-ujian (Sesi Zoom, Pengumuman, dll) untuk Asesi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="linimasa-form" className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="judul-kegiatan">Judul Kegiatan</Label>
            <Input id="judul-kegiatan" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Sosialisasi Skema ADS" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Deskripsi</Label>
            <Textarea id="deskripsi-kegiatan" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat kegiatan..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipe-kegiatan">Tipe Kegiatan</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger id="tipe-kegiatan"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMBELAJARAN">Sesi Pembelajaran (Zoom)</SelectItem>
                  <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="skema-kegiatan">Untuk Skema</Label>
              <Select value={skemaId} onValueChange={setSkemaId}>
                <SelectTrigger id="skema-kegiatan"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">Semua Skema (Umum)</SelectItem>
                  {skemaOptions.map((skema) => (
                    <SelectItem key={skema.id} value={skema.id}>{skema.judul}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal-kegiatan">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="tanggal-kegiatan" variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tanggal ? tanggal.toLocaleDateString("id-ID") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktu-kegiatan">Waktu (WIB)</Label>
              <Input id="waktu-kegiatan" value={waktu} onChange={(e) => setWaktu(e.target.value)} placeholder="Contoh: 09:00" />
            </div>
          </div>
           {tipe === 'PEMBELAJARAN' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url-zoom">URL Zoom (Opsional)</Label>
                <Input id="url-zoom" value={urlZoom} onChange={(e) => setUrlZoom(e.target.value)} placeholder="https://zoom.us/j/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemateri-asesor">Pemateri (Opsional)</Label>
                <Select value={pemateriAsesorId} onValueChange={setPemateriAsesorId}>
                  <SelectTrigger id="pemateri-asesor">
                    <SelectValue placeholder="-- Pilih Pemateri --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Tidak Ditugaskan --</SelectItem>
                    {asesorList.map((asesor) => (
                      <SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
           )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="linimasa-form" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AdminEventCard (Tidak Berubah)
const AdminEventCard = ({ event, onEdit }) => {
  const router = useRouter();
  
  let Icon = Info;
  let colors = "bg-blue-50 border-blue-200 text-blue-800";
  let skemaLabel = event.skemaId === "UMUM" ? "Semua Skema" : event.skemaId;

  if (event.type === "announcement") {
    Icon = Info;
    colors = "bg-yellow-50 border-yellow-200 text-yellow-800";
  } else if (event.type === "event") {
    Icon = Video;
    colors = "bg-blue-50 border-blue-200 text-blue-800";
  } else if (event.type === "exam") {
    Icon = UserCheck;
    colors = "bg-purple-50 border-purple-200 text-purple-800";
  }

  return (
    <div className={`p-4 rounded-lg border ${colors} flex items-start gap-4`}>
      <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
      <div className="flex-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors} border border-current`}>
          {skemaLabel}
        </span>
        <h4 className="font-semibold mt-1">{event.title}</h4>
        <p className="text-sm">{event.description}</p>
        
        {event.pemateriNama && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-700">
            <UserIcon className="w-4 h-4 text-gray-500" />
            Pemateri: <span className="font-medium">{event.pemateriNama}</span>
          </div>
        )}

        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {event.time}
          </span>
          {event.url && (
            <Button size="sm" variant="link" asChild className="p-0 h-auto">
              <a href={event.url} target="_blank" rel="noopener noreferrer">Link Zoom</a>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {event.type === "exam" && (
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white"
            onClick={() => router.push(`/admin/offline-exam/${event.id}`)}
          >
            <Users className="w-4 h-4 mr-2" />
            Atur Peserta
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-gray-600" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  )
}

// Halaman Utama
export default function TimelinePage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  const [date, setDate] = useState(new Date())
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [skemaOptions, setSkemaOptions] = useState([])
  const [asesorList, setAsesorList] = useState([]); 
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login")
      return;
    }
    loadData()
  }, [user, isAuthLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [skemaData, linimasaData, sesiUjianData, allAsesorData] = await Promise.all([
        mockGetAllSkema(),
        mockGetLinimasa("ALL"), 
        mockGetSesiUjianOffline("ALL"),
        mockGetAsesorUsers() 
      ]);

      setSkemaOptions(skemaData); 
      setAsesorList(allAsesorData); 

      const asesorNameMap = new Map(allAsesorData.map(a => [a.id, a.nama]));

      const formattedLinimasa = linimasaData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(), 
        title: `[${item.tipe}] ${item.judul}`,
        time: item.waktu || "Sepanjang hari",
        description: item.deskripsi,
        url: item.urlZoom,
        type: item.tipe === "PENGUMUMAN" ? "announcement" : "event",
        skemaId: item.skemaId || "UMUM",
        pemateriAsesorId: item.pemateriAsesorId, 
        pemateriNama: asesorNameMap.get(item.pemateriAsesorId) || null, 
        originalData: item
      }));

      const formattedSesiUjian = sesiUjianData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(), 
        title: `[UJIAN] ${item.tipeUjian === "TEORI" ? "Ujian Teori" : "Unjuk Diri"}`,
        time: item.waktu || "Waktu Menyusul",
        description: `Lokasi: ${item.ruangan} (Kapasitas: ${item.kapasitas})`,
        url: null,
        type: "exam",
        skemaId: item.skemaId,
        pemateriNama: null, 
        originalData: item
      }));

      const combinedEvents = [...formattedLinimasa, ...formattedSesiUjian];
      combinedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)); 
      
      setAllEvents(combinedEvents); 
      
    } catch (err) {
      console.error("Error loading events:", err)
      setError("Gagal memuat jadwal.")
    } finally {
      setLoading(false)
    }
  }

  const onDataChanged = (newEvent) => {
    loadData(); 
  }

  const selectedDateStr = date ? date.toDateString() : new Date().toDateString()
  const selectedEvents = allEvents.filter(event => event.date === selectedDateStr)

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Linimasa</h1>
            <p className="text-muted-foreground mt-1">Atur semua jadwal kegiatan, pengumuman, dan sesi ujian.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <CreateLinimasaModal 
              skemaOptions={skemaOptions} 
              asesorList={asesorList} 
              onEventCreated={onDataChanged} 
            />
            <CreateSesiModal 
              skemaOptions={skemaOptions} 
              onSesiCreated={onDataChanged} 
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ====================================================== */}
        {/* --- (PERBAIKAN 3: Layout & Komponen Kalender) --- */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="md:col-span-2 h-fit">
            <CardContent className="p-0"> 
              {loading ? (
                <Skeleton className="h-[400px] w-full" /> 
              ) : (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full p-4"
                  components={{
                    DayButton: (props) => (
                      <CustomDayButton {...props} linimasa={allEvents} /> 
                    )
                  }}
                />
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold">
              Kegiatan pada {new Date(selectedDateStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : selectedEvents.length === 0 ? (
              <Alert>
                <CalendarIcon className="h-4 w-4" />
                <AlertDescription>Tidak ada kegiatan yang dijadwalkan pada tanggal ini.</AlertDescription>
              </Alert>
            ) : (
              selectedEvents.map((event) => (
                <AdminEventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={() => alert(`Logika edit untuk event '${event.title}' belum dibuat`)} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}