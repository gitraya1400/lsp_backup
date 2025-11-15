// frontend-lms-v3-master/app/asesor/grading/page.jsx

"use client";

// 1. Tambahkan useMemo
import React, { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
// 2. Tambahkan CardFooter
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockGetPenugasanAsesor } from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
// 3. Tambahkan ikon paginasi
import { CheckCircle2, AlertCircle, Clock, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react"; 
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 4. Tambahkan konstanta
const ITEMS_PER_PAGE = 20;

// 5. Buat komponen helper untuk Footer Paginasi
const PaginationFooter = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) {
    return null; // Jangan tampilkan paginasi jika hanya 1 halaman
  }
  
  return (
    <CardFooter className="flex items-center justify-between pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Berikutnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </CardFooter>
  );
};

export default function GradingListPage() {
  const { user } = useAuth();
  const [penugasan, setPenugasan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState("BELUM_DINILAI");

  const [filterKelasTeori, setFilterKelasTeori] = useState("SEMUA");
  const [filterUnitTeori, setFilterUnitTeori] = useState("SEMUA");
  const [filterKelasPraktikum, setFilterKelasPraktikum] = useState("SEMUA");
  const [filterKelasUnjukDiri, setFilterKelasUnjukDiri] = useState("SEMUA");

  // 6. Tambahkan state halaman untuk setiap tab
  const [currentPageTeori, setCurrentPageTeori] = useState(1);
  const [currentPagePraktikum, setCurrentPagePraktikum] = useState(1);
  const [currentPageUnjukDiri, setCurrentPageUnjukDiri] = useState(1);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Reset filter kelas jika filter unit berubah
  useEffect(() => {
    setFilterKelasTeori("SEMUA");
  }, [filterUnitTeori]);

  // 7. Tambahkan useEffect untuk reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPageTeori(1);
  }, [filterStatus, filterKelasTeori, filterUnitTeori]);
  
  useEffect(() => {
    setCurrentPagePraktikum(1);
  }, [filterStatus, filterKelasPraktikum]);
  
  useEffect(() => {
    setCurrentPageUnjukDiri(1);
  }, [filterStatus, filterKelasUnjukDiri]);
  // ---

  const loadData = async () => {
    try {
      setLoading(true);
      const penugasanData = await mockGetPenugasanAsesor(user.id);
      setPenugasan(penugasanData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // --- Logika Filter (Tidak Berubah) ---

  const unitListTeori = useMemo(() => {
    if (!penugasan) return [];
    const unitSet = new Map();
    penugasan
      .filter(p => p.tipe === 'TEORI' && p.unitId)
      .forEach(p => {
        if (!unitSet.has(p.unitId)) {
          unitSet.set(p.unitId, `Unit ${p.unitId}: ${p.unitJudul}`);
        }
      });
    return Array.from(unitSet.entries()).sort((a, b) => a[0] - b[0]);
  }, [penugasan]);

  const kelasListTeori = useMemo(() => {
    let teoriTasks = penugasan.filter(p => p.tipe === 'TEORI');
    if (filterUnitTeori !== "SEMUA") {
      teoriTasks = teoriTasks.filter(p => p.unitId == filterUnitTeori);
    }
    const kelasSet = new Set(teoriTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan, filterUnitTeori]);

  const kelasListPraktikum = useMemo(() => {
    const praktikumTasks = penugasan.filter(p => p.tipe === 'PRAKTIKUM');
    const kelasSet = new Set(praktikumTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan]);

  const kelasListUnjukDiri = useMemo(() => {
    const unjukDiriTasks = penugasan.filter(p => p.tipe === 'UNJUK_DIRI');
    const kelasSet = new Set(unjukDiriTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan]);
  
  // ---------------------------------

  const getFilteredPenugasan = (tipe, kelasFilter, unitFilter) => {
    let filtered = penugasan.filter(p => p.tipe === tipe);

    if (filterStatus !== "SEMUA") {
      filtered = filtered.filter(p => p.statusPenilaian === filterStatus);
    }
    
    if (kelasFilter && kelasFilter !== "SEMUA") {
      filtered = filtered.filter(p => p.asesiKelas === kelasFilter);
    }

    if (unitFilter && unitFilter !== "SEMUA") {
      filtered = filtered.filter(p => p.unitId == unitFilter);
    }
    
    return filtered;
  };

  // 8. Pisahkan logika data dari render
  // Memoize filtered lists
  const fullTeoriList = useMemo(
    () => getFilteredPenugasan("TEORI", filterKelasTeori, filterUnitTeori),
    [penugasan, filterStatus, filterKelasTeori, filterUnitTeori]
  );
  const fullPraktikumList = useMemo(
    () => getFilteredPenugasan("PRAKTIKUM", filterKelasPraktikum, null),
    [penugasan, filterStatus, filterKelasPraktikum]
  );
  const fullUnjukDiriList = useMemo(
    () => getFilteredPenugasan("UNJUK_DIRI", filterKelasUnjukDiri, null),
    [penugasan, filterStatus, filterKelasUnjukDiri]
  );

  // Memoize paginated lists
  const { paginatedTeori, totalPagesTeori } = useMemo(() => {
    const totalPages = Math.ceil(fullTeoriList.length / ITEMS_PER_PAGE);
    const paginated = fullTeoriList.slice(
      (currentPageTeori - 1) * ITEMS_PER_PAGE,
      currentPageTeori * ITEMS_PER_PAGE
    );
    return { paginatedTeori: paginated, totalPagesTeori: totalPages };
  }, [fullTeoriList, currentPageTeori]);

  const { paginatedPraktikum, totalPagesPraktikum } = useMemo(() => {
    const totalPages = Math.ceil(fullPraktikumList.length / ITEMS_PER_PAGE);
    const paginated = fullPraktikumList.slice(
      (currentPagePraktikum - 1) * ITEMS_PER_PAGE,
      currentPagePraktikum * ITEMS_PER_PAGE
    );
    return { paginatedPraktikum: paginated, totalPagesPraktikum: totalPages };
  }, [fullPraktikumList, currentPagePraktikum]);

  const { paginatedUnjukDiri, totalPagesUnjukDiri } = useMemo(() => {
    const totalPages = Math.ceil(fullUnjukDiriList.length / ITEMS_PER_PAGE);
    const paginated = fullUnjukDiriList.slice(
      (currentPageUnjukDiri - 1) * ITEMS_PER_PAGE,
      currentPageUnjukDiri * ITEMS_PER_PAGE
    );
    return { paginatedUnjukDiri: paginated, totalPagesUnjukDiri: totalPages };
  }, [fullUnjukDiriList, currentPageUnjukDiri]);


  // Komponen PenugasanList (Tidak berubah, tapi sekarang menerima list yang sudah dipaginasi)
  const PenugasanList = ({ list }) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }
    
    // 9. Perbarui pesan 'kosong'
    if (list.length === 0) {
      let message = "Tidak ada tugas penilaian.";
      // Cek jika list *penuh* (sebelum paginasi) juga kosong
      if (fullTeoriList.length === 0 && fullPraktikumList.length === 0 && fullUnjukDiriList.length === 0) {
         message = "Tidak ada tugas untuk tipe ini.";
      } else {
         message = "Tidak ada tugas yang cocok dengan filter.";
      }
      
      return <p className="text-center text-muted-foreground py-8">{message}</p>;
    }
    
    return (
      <div className="space-y-2">
        {list.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div>
              <p className="font-medium">{p.asesiNama}</p>
              <p className="text-sm text-muted-foreground">
                {p.unitId ? `Unit ${p.unitId}: ${p.unitJudul}` : p.unitJudul}
                {p.asesiKelas && ` - (Kelas: ${p.asesiKelas})`}
              </p>
            </div>
            <Link href={`/asesor/grading/${p.id}`}>
              <Button size="sm" variant={p.statusPenilaian === 'SELESAI' ? 'outline' : 'default'}>
                {p.statusPenilaian === 'SELESAI' ? 'Lihat' : 'Nilai'}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tugas Penilaian</h1>
          <p className="text-muted-foreground mt-1">Filter dan kelola semua tugas penilaian Anda.</p>
        </div>

        <Tabs defaultValue="teori" className="space-y-4">
        
          <Card>
            <CardContent className="pt-6 space-y-4">
              
              {/* Stats Grid (Filter Status) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`hover:shadow-md transition-all cursor-pointer h-full ${filterStatus === "SEMUA" ? "border-primary ring-2 ring-primary/50" : "border-transparent"}`}
                  onClick={() => setFilterStatus("SEMUA")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Semua Tugas</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : penugasan.length}</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`hover:shadow-md transition-all cursor-pointer h-full ${filterStatus === "BELUM_DINILAI" ? "border-primary ring-2 ring-primary/50" : "border-transparent"}`}
                  onClick={() => setFilterStatus("BELUM_DINILAI")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Belum Dinilai</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : penugasan.filter((p) => p.statusPenilaian === "BELUM_DINILAI").length}</div>
                  </CardContent>
                </Card>

                <Card 
                  className={`hover:shadow-md transition-all cursor-pointer h-full ${filterStatus === "SELESAI" ? "border-primary ring-2 ring-primary/50" : "border-transparent"}`}
                  onClick={() => setFilterStatus("SELESAI")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Selesai</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : penugasan.filter((p) => p.statusPenilaian === "SELESAI").length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* TabsList */}
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teori">
                  Ujian Teori
                </TabsTrigger>
                <TabsTrigger value="praktikum">
                  Ujian Praktikum
                </TabsTrigger>
                <TabsTrigger value="unjuk-diri">
                  Unjuk Diri
                </TabsTrigger>
              </TabsList>
            
            </CardContent>
          </Card>

          {/* --- TAB UJIAN TEORI (DENGAN FILTER) --- */}
          <TabsContent value="teori" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Tugas Penilaian Ujian Teori (Esai)</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {/* Filter Kelas */}
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-teori" className="text-xs font-normal">Filter Kelas</Label>
                      <Select value={filterKelasTeori} onValueChange={setFilterKelasTeori}>
                        <SelectTrigger id="filter-kelas-teori" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListTeori.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Filter Unit */}
                    <div className="flex-1 md:w-56">
                      <Label htmlFor="filter-unit-teori" className="text-xs font-normal">Filter Unit</Label>
                      <Select value={filterUnitTeori} onValueChange={setFilterUnitTeori}>
                        <SelectTrigger id="filter-unit-teori" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Unit" />
                        </SelectTrigger>
                         <SelectContent 
                            position="popper"
                            className="w-[220px] max-h-[200px] overflow-y-auto"
                          >
                          <SelectItem value="SEMUA">Semua Unit</SelectItem>
                          {unitListTeori.map(([unitId, unitLabel]) => (
                            <SelectItem key={unitId} value={String(unitId)}>{unitLabel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Gunakan list paginasi */}
                <PenugasanList list={paginatedTeori} />
              </CardContent>
              {/* Tambahkan footer paginasi */}
              <PaginationFooter 
                totalPages={totalPagesTeori}
                currentPage={currentPageTeori}
                setCurrentPage={setCurrentPageTeori}
              />
            </Card>
          </TabsContent>

          {/* --- TAB UJIAN PRAKTIKUM (DENGAN FILTER) --- */}
          <TabsContent value="praktikum">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Tugas Penilaian Ujian Praktikum</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {/* Filter Kelas */}
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-prak" className="text-xs font-normal">Filter Kelas</Label>
                      <Select value={filterKelasPraktikum} onValueChange={setFilterKelasPraktikum}>
                        <SelectTrigger id="filter-kelas-prak" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListPraktikum.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                 {/* Gunakan list paginasi */}
                <PenugasanList list={paginatedPraktikum} />
              </CardContent>
              {/* Tambahkan footer paginasi */}
              <PaginationFooter 
                totalPages={totalPagesPraktikum}
                currentPage={currentPagePraktikum}
                setCurrentPage={setCurrentPagePraktikum}
              />
            </Card>
          </TabsContent>

          {/* --- TAB UNJUK DIRI (DENGAN FILTER) --- */}
          <TabsContent value="unjuk-diri">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Tugas Penilaian Unjuk Diri</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {/* Filter Kelas */}
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-unjuk" className="text-xs font-normal">Filter Kelas</Label>
                      <Select value={filterKelasUnjukDiri} onValueChange={setFilterKelasUnjukDiri}>
                        <SelectTrigger id="filter-kelas-unjuk" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListUnjukDiri.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                 {/* Gunakan list paginasi */}
                <PenugasanList list={paginatedUnjukDiri} />
              </CardContent>
               {/* Tambahkan footer paginasi */}
              <PaginationFooter 
                totalPages={totalPagesUnjukDiri}
                currentPage={currentPageUnjukDiri}
                setCurrentPage={setCurrentPageUnjukDiri}
              />
            </Card>
          </TabsContent>
        </Tabs>
        
      </div>
    </MainLayout>
  );
}