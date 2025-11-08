"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  mockGetUnitsForSkema, 
  mockGetSoalTryoutGabungan, // <-- Ganti API
  mockSubmitTryout, 
  mockGetProgressAsesi 
} from "@/lib/api-mock";
import { Lock, Play, Loader2, Check, Book, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils"; // <-- Import formatTime

// --- Logika Robustness ---
const TRYOUT_DURATION_SECONDS = 90 * 60; // 90 menit

const getTryoutStorageKey = (userId, skemaId) => {
  if (!userId || !skemaId) return null;
  return `tryout_progress_${userId}_${skemaId}`;
};
// --- Batas Logika Robustness ---

export default function TryoutPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  // State untuk data
  const [units, setUnits] = useState([]);
  const [soalList, setSoalList] = useState([]);
  const [progress, setProgress] = useState(null);

  // State untuk UI
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isRestored, setIsRestored] = useState(false); // Flag pemulihan

  // State untuk Ujian (dibuat robust)
  const [isStarted, setIsStarted] = useState(false);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { "soalId": "jawaban" }
  const [timeLeft, setTimeLeft] = useState(TRYOUT_DURATION_SECONDS);

  // Kunci unik untuk localStorage
  const storageKey = useMemo(() => {
    return getTryoutStorageKey(user?.id, user?.skemaId);
  }, [user]);

  // Cek prasyarat
  const canStartTryout = progress?.progressPembelajaran === 100;

  // --- Logika Inti ---

  // Fungsi untuk membersihkan localStorage
  const clearTryoutState = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Fungsi Submit Ujian
  const handleSubmit = useCallback(async () => {
    if (!user) return;
    
    // Set status tidak aktif agar timer berhenti
    setIsStarted(false); 
    setIsSubmitting(true);
    
    try {
      await mockSubmitTryout(user.id, answers);
      clearTryoutState(); // Bersihkan storage

      // Update progress di client-side
      setProgress((prev) => ({ ...prev, tryoutSelesai: true }));
      setIsStarted(false); // Kembali ke layar pre-start (yang kini akan terkunci)

      alert("Tryout berhasil diselesaikan! Anda sekarang bisa melanjutkan ke Ujian Teori.");
      router.push("/asesi/dashboard");
    } catch (error) {
      console.error("Error submitting tryout:", error);
      alert("Gagal menyimpan tryout. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, answers, router, clearTryoutState]);
  
  // Efek Samping: Memuat data prasyarat dan memulihkan progres
  useEffect(() => {
    if (isAuthLoading) return; // Tunggu auth selesai
    if (!user) {
      router.push("/login");
      return;
    }
    if (!storageKey) return; // Tunggu user dan skema siap

    const loadPrerequisitesAndRestore = async () => {
      try {
        setLoading(true);
        const [progressData, unitsData, soalData] = await Promise.all([
          mockGetProgressAsesi(user.id),
          mockGetUnitsForSkema(user.skemaId),
          mockGetSoalTryoutGabungan(user.skemaId) // <-- Panggil API baru
        ]);
        
        setProgress(progressData);
        setUnits(unitsData);
        setSoalList(soalData);

        // Logika Pemulihan (Robustness)
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
          const savedState = JSON.parse(savedStateJSON);
          setAnswers(savedState.answers || {});
          setTimeLeft(savedState.timeLeft || TRYOUT_DURATION_SECONDS);
          setIsStarted(true); // Langsung masuk ke tryout
        } else {
          setAnswers({});
          setTimeLeft(TRYOUT_DURATION_SECONDS);
          setIsStarted(false); // Tampilkan layar pre-start
        }

      } catch (error) {
        console.error("Error loading prerequisites:", error);
      } finally {
        setLoading(false);
        setIsRestored(true); // Tandai pemulihan selesai
      }
    };

    loadPrerequisitesAndRestore();
  }, [user, isAuthLoading, router, storageKey]);

  // Efek Samping: Timer
  useEffect(() => {
    if (!isStarted || !isRestored) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isRestored, handleSubmit]); // Dependensi ke handleSubmit (useCallback)

  // Efek Samping: Simpan jawaban ke localStorage
  useEffect(() => {
    if (!isStarted || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}";
      const currentState = JSON.parse(stateJSON);
      currentState.answers = answers;
      localStorage.setItem(storageKey, JSON.stringify(currentState));
    } catch (e) { console.error("Gagal simpan jawaban tryout:", e) }
  }, [answers, isStarted, isRestored, storageKey]);

  // Efek Samping: Simpan sisa waktu ke localStorage
  useEffect(() => {
    if (!isStarted || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}";
      const currentState = JSON.parse(stateJSON);
      if (currentState.timeLeft !== timeLeft) {
        currentState.timeLeft = timeLeft;
        localStorage.setItem(storageKey, JSON.stringify(currentState));
      }
    } catch (e) { console.error("Gagal simpan waktu tryout:", e) }
  }, [timeLeft, isStarted, isRestored, storageKey]);

  // --- Handlers ---

  const handleStartTryout = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (soalId, value) => {
    setAnswers((prev) => ({ ...prev, [soalId]: value }));
  };
  
  const currentSoal = soalList[currentSoalIndex];
  
  if (loading || isAuthLoading || !progress) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  // --- Tampilan Ujian Aktif ---
  if (isStarted) {
    if (!currentSoal) {
       return (
         <MainLayout>
           <div className="p-6">
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>Soal tryout tidak dapat dimuat.</AlertDescription>
             </Alert>
           </div>
         </MainLayout>
       )
    }
    
    const answeredCount = Object.values(answers).filter(Boolean).length;

    return (
      <MainLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- KOLOM KIRI (SOAL) --- */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Tryout Skema {user?.skemaId}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soal {currentSoalIndex + 1} dari {soalList.length}
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
                  <CardTitle className="text-xl">
                    Soal {currentSoalIndex + 1}
                  </CardTitle>
                  <CardDescription className="pt-2 text-base text-gray-800">{currentSoal.teks}</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea 
                    className="w-full min-h-[400px] p-3 border rounded-md" 
                    placeholder="Tulis jawaban esai Anda di sini..." 
                    value={answers[currentSoal.id] || ""} 
                    onChange={(e) => handleAnswerChange(currentSoal.id, e.target.value)} 
                  />
                </CardContent>
              </Card>
            </div>

            {/* --- KOLOM KANAN (NAVIGASI) --- */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle>Daftar Soal ({answeredCount}/{soalList.length})</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-5 gap-2">
                  {soalList.map((soal, index) => {
                    const isCurrent = currentSoalIndex === index;
                    const isAnswered = answers[soal.id];

                    let variant = "secondary"; // Belum diisi
                    if (isAnswered) variant = "outline"; // Udah diisi
                    if (isCurrent) variant = "default"; // Lagi aktif

                    return (
                      <Button
                        key={soal.id}
                        variant={variant}
                        className={`
                          w-full h-12 text-lg
                          ${isAnswered && !isCurrent ? "border-green-600 text-green-700 hover:bg-green-50" : ""}
                        `}
                        onClick={() => setCurrentSoalIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => {
                      const answeredCount = Object.values(answers).filter(Boolean).length;
                      if (answeredCount < soalList.length) {
                        if (!confirm(`Anda baru mengerjakan ${answeredCount} dari ${soalList.length} soal. Tetap selesaikan tryout?`)) {
                          return;
                        }
                      }
                      // Jika sudah semua atau dikonfirmasi, baru panggil handleSubmit
                      handleSubmit();
                    }} 
                    disabled={isSubmitting} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    Selesaikan Tryout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // --- Tampilan Pre-Start (Default) ---
  return (
    <MainLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Tryout</h1>
        <p className="text-muted-foreground">Selesaikan Tryout untuk membuka Ujian Teori</p>

        <div className="flex justify-center items-center pt-10">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tryout - Asesmen Mandiri</CardTitle>
              <CardDescription>Skema: {user?.skemaId}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!canStartTryout ? (
                // TAMPILAN TERKUNCI
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <Lock className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800 font-semibold">Tryout Terkunci</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Anda harus menyelesaikan 100% materi pembelajaran sebelum dapat memulai tryout. Progress Anda saat ini: <span className="font-bold">{progress?.progressPembelajaran || 0}%</span>
                  </AlertDescription>
                  <Button asChild variant="link" className="p-1 h-auto text-red-800 mt-3 mb-2 ml-26">
                    <Link href="/asesi/learning">Kembali ke Pembelajaran</Link>
                  </Button>
                </Alert>
              ) : progress.tryoutSelesai ? (
                // TAMPILAN SUDAH SELESAI
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800 font-semibold">Tryout Selesai</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Anda telah menyelesaikan tryout. Anda sekarang dapat melanjutkan ke Ujian Teori.
                  </AlertDescription>
                  <Button asChild variant="link" className="p-0 h-auto text-green-700 mt-2">
                    <Link className= "outline border-gray pd-2 ml-19 mt-1 mb-1 "href="/asesi/exams">Lanjut ke Ujian</Link>
                  </Button>
                </Alert>
              ) : (
                // TAMPILAN SIAP MULAI
                <>
                  <div className="text-center text-muted-foreground">Harap baca instruksi berikut sebelum memulai tryout:</div>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Total <span className="font-semibold">{soalList.length} soal</span> dari {units.length} unit kompetensi.
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Book className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Soal berupa <span className="font-semibold">esai</span>.
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Total waktu pengerjaan <span className="font-semibold">{TRYOUT_DURATION_SECONDS / 60} menit</span> (timer akan berjalan).
                      </span>
                    </li>
                  </ul>

                  <Button onClick={handleStartTryout} disabled={loading} size="lg" className="w-full text-base h-11">
                    <Play className="w-5 h-5 mr-2" />
                    Mulai Tryout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}