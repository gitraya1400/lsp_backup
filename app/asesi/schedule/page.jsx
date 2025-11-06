"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar as CalendarIcon, Clock, Video, Info, UserCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

import { mockGetLinimasa, mockGetPlottingAsesi } from "@/lib/api-mock"
import { useRouter } from "next/navigation"

// Helper Card untuk menampilkan event
const EventCard = ({ event }) => {
  let Icon = Info
  let colors = "bg-blue-50 border-blue-200 text-blue-800"

  if (event.type === "announcement") {
    Icon = Info
    colors = "bg-yellow-50 border-yellow-200 text-yellow-800"
  } else if (event.type === "event") {
    Icon = Video
    colors = "bg-blue-50 border-blue-200 text-blue-800"
  } else if (event.type === "exam") {
    Icon = UserCheck // Ikon baru untuk ujian
    colors = "bg-purple-50 border-purple-200 text-purple-800" // Warna baru
  }

  return (
    <div className={`p-4 rounded-lg border ${colors} flex items-start gap-4`}>
      <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold">{event.title}</h4>
        <p className="text-sm">{event.description}</p>
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
    </div>
  )
}


export default function SchedulePage() {
  const { user, loading: isAuthLoading } = useAuth() // Ambil isAuthLoading
  const router = useRouter() // Panggil useRouter
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [eventDates, setEventDates] = useState([])

  useEffect(() => {
    if (isAuthLoading) {
      return; // Tunggu auth pulih
    }
    if (!user) {
      router.push("/login"); // Jika tidak ada user, tendang
      return;
    }
    // Jika user ada, baru muat data
    loadEvents();
  }, [user, isAuthLoading, router]) // Update dependensi

  const loadEvents = async () => {
    if (!user) return;
    try {
      setLoading(true)
      setError(null)
      
      // 1. Panggil kedua API secara paralel
      const [linimasaData, plottingData] = await Promise.all([
        mockGetLinimasa(user.skemaId),
        mockGetPlottingAsesi(user.id) // <-- API JADWAL UJIAN
      ]);

      // 2. Format data linimasa (Sosialisasi, dll)
      const formattedLinimasa = linimasaData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(),
        title: `[${item.tipe}] ${item.judul}`,
        time: item.waktu || "Seharian",
        description: item.deskripsi,
        url: item.urlZoom,
        type: item.tipe === "PENGUMUMAN" ? "announcement" : "event"
      }));

      // 3. Format data plotting (Jadwal Ujian PRIBADI)
      const formattedPlotting = plottingData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(),
        title: `[UJIAN OFFLINE] ${item.tipeUjian === "TEORI" ? "Ujian Teori" : "Unjuk Diri"}`,
        time: item.waktu || "Waktu Menyusul",
        description: `Lokasi: ${item.ruangan}`,
        url: null, // Ujian offline tidak ada link zoom
        type: "exam" // Tipe baru untuk styling
      }));

      // 4. Gabungkan keduanya
      const allEvents = [...formattedLinimasa, ...formattedPlotting];
      
      // 5. Ambil tanggalnya saja untuk "titik" kalender
      const datesWithEvents = allEvents.map(event => new Date(event.date));
      setEventDates(datesWithEvents);
      
      setEvents(allEvents);

    } catch (err) {
      console.error("Error loading events:", err)
      setError("Gagal memuat jadwal Anda.")
    } finally {
      setLoading(false)
    }
  }

  const selectedDateStr = date ? date.toDateString() : new Date().toDateString()
  const selectedEvents = events.filter(event => event.date === selectedDateStr)

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Saya</h1>
          <p className="text-muted-foreground mt-1">
            Lihat jadwal sosialisasi, pengumuman, dan jadwal ujian offline Anda.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: 'has-event-dot' }}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4">
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
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}