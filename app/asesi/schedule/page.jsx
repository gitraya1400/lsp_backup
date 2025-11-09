"use client"

import { useEffect, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// --- (PERBAIKAN 1: Impor CalendarDayButton) ---
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar as CalendarIcon, Clock, Video, Info, UserCheck, AlertCircle, Presentation, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

import { mockGetLinimasa, mockGetPlottingAsesi, mockGetAsesorUsers } from "@/lib/api-mock"
import { useRouter } from "next/navigation"
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


// Helper Card untuk menampilkan event (Sudah di-update)
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
    Icon = UserCheck 
    colors = "bg-purple-50 border-purple-200 text-purple-800" 
  }

  return (
    <div className={`p-4 rounded-lg border ${colors} flex items-start gap-4`}>
      <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold">{event.title}</h4>
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
    </div>
  )
}


export default function SchedulePage() {
  const { user, loading: isAuthLoading } = useAuth() 
  const router = useRouter() 
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    if (!user) {
      router.push("/login"); 
      return;
    }
    loadEvents();
  }, [user, isAuthLoading, router]) 

  // loadEvents (Sudah di-update)
  const loadEvents = async () => {
    if (!user) return;
    try {
      setLoading(true)
      setError(null)
      
      const [linimasaData, plottingData, allAsesorData] = await Promise.all([
        mockGetLinimasa(user.skemaId),
        mockGetPlottingAsesi(user.id),
        mockGetAsesorUsers() 
      ]);

      const asesorNameMap = new Map(allAsesorData.map(a => [a.id, a.nama]));

      const formattedLinimasa = linimasaData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(),
        title: `[${item.tipe}] ${item.judul}`,
        time: item.waktu || "Seharian",
        description: item.deskripsi,
        url: item.urlZoom,
        type: item.tipe === "PENGUMUMAN" ? "announcement" : "event",
        pemateriNama: asesorNameMap.get(item.pemateriAsesorId) || null 
      }));

      const formattedPlotting = plottingData.map(item => ({
        id: item.id,
        date: new Date(item.tanggal).toDateString(),
        title: `[UJIAN OFFLINE] ${item.tipeUjian === "TEORI" ? "Ujian Teori" : "Unjuk Diri"}`,
        time: item.waktu || "Waktu Menyusul",
        description: `Lokasi: ${item.ruangan}`,
        url: null, 
        type: "exam",
        pemateriNama: null 
      }));

      const allEvents = [...formattedLinimasa, ...formattedPlotting];
      
      allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
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
                      <CustomDayButton {...props} linimasa={events} />
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
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}