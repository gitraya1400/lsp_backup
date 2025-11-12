"use client"

import React, { useEffect, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  mockGetAsesiUsers, 
  mockGetAsesorUsers, 
  mockGetUnitsForSkema, 
  mockAssignAsesorPerUnit,
  mockGetAllSkema 
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, Search, ChevronLeft, ChevronRight, User, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner" 

const ITEMS_PER_PAGE = 20; 

// ====================================================================
// Komponen Utama Halaman
// ====================================================================
export default function AssignmentsPage() {
  const [skemaId, setSkemaId] = useState("") 
  const [tipeUjian, setTipeUjian] = useState("TEORI")
  
  const [allAsesi, setAllAsesi] = useState([])
  const [allAsesor, setAllAsesor] = useState([])
  const [units, setUnits] = useState([])
  
  const [asesiList, setAsesiList] = useState([])
  const [asesorList, setAsesorList] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [savingAsesiId, setSavingAsesiId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // --- (STATE BARU) ---
  const [filterKelas, setFilterKelas] = useState("SEMUA"); // State untuk filter tampilan utama

  const [teoriAssignments, setTeoriAssignments] = useState({}) 
  const [praktikumAssignments, setPraktikumAssignments] = useState({})
  const [unjukDiriAssignments, setUnjukDiriAssignments] = useState({})
  
  const [selectedBulkClass, setSelectedBulkClass] = useState("")
  const [selectedBulkAsesor, setSelectedBulkAsesor] = useState("")
  const [selectedBulkUnitStart, setSelectedBulkUnitStart] = useState("")
  const [selectedBulkUnitEnd, setSelectedBulkUnitEnd] = useState("")

  const [selectedBulkClassPraktikum, setSelectedBulkClassPraktikum] = useState("");
  const [selectedBulkAsesorPraktikum, setSelectedBulkAsesorPraktikum] = useState("");
  const [selectedBulkClassUnjukDiri, setSelectedBulkClassUnjukDiri] = useState("");
  const [selectedBulkAsesorUnjukDiri, setSelectedBulkAsesorUnjukDiri] = useState("");

  const [skemaList, setSkemaList] = useState([]);
  const [loadingSkema, setLoadingSkema] = useState(true);

  useEffect(() => {
    loadMasterData();
    loadSkemaList(); 
  }, [])

  useEffect(() => {
    if (skemaId) { 
      loadSkemaData();
    }
  }, [skemaId])

  useEffect(() => {
    if (!skemaId) return; 

    const filteredAsesi = allAsesi.filter(a => a.skemaId === skemaId)
    setAsesiList(filteredAsesi)
    const filteredAsesor = allAsesor.filter(a => a.skemaKeahlian && a.skemaKeahlian.includes(skemaId))
    setAsesorList(filteredAsesor)
    
    // Reset filter saat ganti skema
    setCurrentPage(1);
    setFilterKelas("SEMUA"); // <-- (RESET BARU)
    setSelectedBulkClass("")
    setSelectedBulkAsesor("")
    setSelectedBulkUnitStart("")
    setSelectedBulkUnitEnd("")
    setSelectedBulkClassPraktikum("");
    setSelectedBulkAsesorPraktikum("");
    setSelectedBulkClassUnjukDiri("");
    setSelectedBulkAsesorUnjukDiri("");

  }, [skemaId, allAsesi, allAsesor]) 

  const loadSkemaList = async () => {
    try {
      setLoadingSkema(true);
      const data = await mockGetAllSkema();
      setSkemaList(data);
      if (data.length > 0) {
        setSkemaId(data[0].id); 
      }
    } catch (error) {
      console.error("Error loading skema list:", error);
    } finally {
      setLoadingSkema(false);
    }
  };

  const loadMasterData = async () => {
    try {
      setLoading(true)
      const [asesiData, asesorData] = await Promise.all([
        mockGetAsesiUsers(),
        mockGetAsesorUsers(),
      ])
      setAllAsesi(asesiData)
      setAllAsesor(asesorData)
    } catch (error) {
      console.error("Error loading master data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSkemaData = async () => {
    try {
      setLoading(true)
      const unitsData = await mockGetUnitsForSkema(skemaId)
      setUnits(unitsData)
    } catch (error) {
      console.error("Error loading skema data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Memo ini (kelasList) tidak berubah.
  // Ini mengambil SEMUA kelas dari skema, bagus untuk dropdown Bulk Assign
  const kelasList = useMemo(() => {
    const kelasSet = new Set(asesiList.map(a => a.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [asesiList]);

  const unitOptions = useMemo(() => {
    return units.map(u => ({ 
      value: u.nomorUnit,
      label: `Unit ${u.nomorUnit}: ${u.judul}` 
    }));
  }, [units]);
  
  // ==========================================================
  // --- (LOGIKA FILTER DI-UPDATE) ---
  // ==========================================================
  const filteredAsesi = useMemo(() => {
    return asesiList.filter((a) => {
      // Filter by Search Term
      const matchSearch = a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.nim && a.nim.includes(searchTerm));
      
      // Filter by Kelas (BARU)
      const matchKelas = filterKelas === "SEMUA" || a.kelas === filterKelas;

      return matchSearch && matchKelas;
    })
  }, [asesiList, searchTerm, filterKelas]); // <-- Tambahkan filterKelas di dependensi

  const paginatedAsesi = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAsesi.slice(start, end)
  }, [filteredAsesi, currentPage])

  const totalPages = Math.ceil(filteredAsesi.length / ITEMS_PER_PAGE)

  // Handler state change (tidak berubah)
  const handleTeoriAssignmentChange = (asesiId, unitId, asesorId) => {
    setTeoriAssignments(prev => ({
      ...prev,
      [`${asesiId}-${unitId}`]: asesorId
    }))
  }
  const handlePraktikumAssignmentChange = (asesiId, asesorId) => {
    setPraktikumAssignments(prev => ({ ...prev, [asesiId]: asesorId }));
  };
  const handleUnjukDiriAssignmentChange = (asesiId, asesorId) => {
    setUnjukDiriAssignments(prev => ({ ...prev, [asesiId]: asesorId }));
  };
  
  // Handler simpan (tidak berubah)
  const handleSaveAssignments = async (asesiId, assignmentsData) => {
    setSavingAsesiId(asesiId); 
    if (assignmentsData.length === 0) {
      alert("Belum ada asesor yang ditugaskan untuk asesi ini.")
      setSavingAsesiId(null)
      return
    }
    if (tipeUjian === "TEORI" && assignmentsData.length < units.length) {
       alert("Gagal: Pastikan semua unit kompetensi memiliki asesor.");
       setSavingAsesiId(null);
       return;
    }
    try {
      await mockAssignAsesorPerUnit(asesiId, assignmentsData) 
      alert(`Penugasan untuk asesi (ID: ${asesiId}) berhasil disimpan!`)
    } catch (error) {
      console.error("Error saving assignments:", error)
      alert("Gagal menyimpan penugasan")
    } finally {
      setSavingAsesiId(null) 
    }
  }
  
  // Handler simpan Teori (tidak berubah)
  const handleSaveTeori = (asesiId) => {
    const allAssigned = units.every(
      unit => teoriAssignments[`${asesiId}-${unit.id}`]
    );
    if (!allAssigned) {
      alert("Gagal: Pastikan semua unit kompetensi memiliki asesor sebelum menyimpan.");
      return; 
    }
    const assignmentsForAsesi = units.map(unit => ({
      unitId: unit.nomorUnit,
      tipe: "TEORI",
      asesorId: teoriAssignments[`${asesiId}-${unit.id}`]
    }));
    handleSaveAssignments(asesiId, assignmentsForAsesi)
  }

  // Handler simpan Praktikum (tidak berubah)
  const handleSavePraktikum = (asesiId) => {
    const asesorId = praktikumAssignments[asesiId];
    if (!asesorId) {
      alert("Pilih seorang asesor terlebih dahulu.");
      return;
    }
    handleSaveAssignments(asesiId, [{
      tipe: "PRAKTIKUM",
      unitId: null,
      asesorId: asesorId
    }]);
  };
  
  // Handler simpan Unjuk Diri (tidak berubah)
  const handleSaveUnjukDiri = (asesiId) => {
    const asesorId = unjukDiriAssignments[asesiId];
    if (!asesorId) {
      alert("Pilih seorang asesor terlebih dahulu.");
      return;
    }
    handleSaveAssignments(asesiId, [{
      tipe: "UNJUK_DIRI",
      unitId: null,
      asesorId: asesorId
    }]);
  };

  // Handler Bulk Assign generik (tidak berubah)
  const applyBulkAssign = (kelas, asesorId, setAssignmentsFunc, tipe) => {
    if (!kelas || !asesorId) {
      alert("Harap pilih Kelas dan Asesor.");
      return;
    }
    const asesiInClass = asesiList.filter(a => a.kelas === kelas).map(a => a.id);
    if (asesiInClass.length === 0) {
      alert("Tidak ada asesi di kelas ini.");
      return;
    }
    
    setAssignmentsFunc(prev => {
      const newAssignments = { ...prev };
      for (const asesiId of asesiInClass) {
        if (tipe === "TEORI") {
          const startUnitNum = parseInt(selectedBulkUnitStart);
          const endUnitNum = parseInt(selectedBulkUnitEnd);
          const unitsToAssign = units
            .filter(u => u.nomorUnit >= startUnitNum && u.nomorUnit <= endUnitNum)
            .map(u => u.id);
          
          for (const unitId of unitsToAssign) {
            newAssignments[`${asesiId}-${unitId}`] = asesorId;
          }
        } else {
          newAssignments[asesiId] = asesorId;
        }
      }
      return newAssignments;
    });

    const asesorNama = asesorList.find(a => a.id === asesorId)?.nama || "Asesor";
    alert(`Berhasil menerapkan ${asesorNama} ke ${asesiInClass.length} asesi di kelas ${kelas}.`);
  };
  
  // Handler Bulk Assign spesifik (tidak berubah)
  const handleBulkAssignTeori = () => {
    if (!selectedBulkClass || !selectedBulkAsesor || !selectedBulkUnitStart || !selectedBulkUnitEnd) {
      alert("Harap lengkapi semua field 'Bulk Assign' (Kelas, Asesor, dan rentang Unit).");
      return;
    }
    const startUnitNum = parseInt(selectedBulkUnitStart);
    const endUnitNum = parseInt(selectedBulkUnitEnd);
    if (startUnitNum > endUnitNum) {
      alert("Unit Awal tidak boleh lebih besar dari Unit Akhir.");
      return;
    }
    applyBulkAssign(selectedBulkClass, selectedBulkAsesor, setTeoriAssignments, "TEORI");
    setSelectedBulkClass("");
    setSelectedBulkAsesor("");
    setSelectedBulkUnitStart("");
    setSelectedBulkUnitEnd("");
  }
  const handleBulkAssignPraktikum = () => {
    applyBulkAssign(selectedBulkClassPraktikum, selectedBulkAsesorPraktikum, setPraktikumAssignments, "PRAKTIKUM");
    setSelectedBulkClassPraktikum("");
    setSelectedBulkAsesorPraktikum("");
  };
  const handleBulkAssignUnjukDiri = () => {
    applyBulkAssign(selectedBulkClassUnjukDiri, selectedBulkAsesorUnjukDiri, setUnjukDiriAssignments, "UNJUK_DIRI");
    setSelectedBulkClassUnjukDiri("");
    setSelectedBulkAsesorUnjukDiri("");
  };


  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penugasan Asesor</h1>
          <p className="text-gray-600 mt-1">
            Atur penugasan asesor untuk Ujian Teori (per unit), Ujian Praktikum (umum), dan Unjuk Diri (umum).
          </p>
        </div>

        {/* ========================================================== */}
        {/* --- (KARTU FILTER DI-UPDATE) --- */}
        {/* ========================================================== */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Grid diubah jadi 3 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kolom 1: Skema */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Skema</label>
                <Select 
                  value={skemaId} 
                  onValueChange={setSkemaId}
                  disabled={loadingSkema} 
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Memuat skema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skemaList.length === 0 && !loadingSkema ? (
                      <SelectItem value="" disabled>Tidak ada skema</SelectItem>
                    ) : (
                      skemaList.map(skema => (
                        <SelectItem key={skema.id} value={skema.id}>
                          {skema.judul} ({skema.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Kolom 2: Filter Kelas (BARU) */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Filter Tampilan per Kelas</label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">-- Semua Kelas --</SelectItem>
                    {kelasList.map(kelas => (
                      <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kolom 3: Search Asesi */}
              <div>
                 <label className="text-sm font-medium block mb-1.5">Cari Asesi</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                   <Input 
                      placeholder="Cari nama atau NIM..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Tipe Ujian Tabs (Tidak berubah) */}
            <Tabs value={tipeUjian} onValueChange={setTipeUjian}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="TEORI">Ujian Teori (Per Unit)</TabsTrigger>
                <TabsTrigger value="PRAKTIKUM">Ujian Praktikum (Umum)</TabsTrigger>
                <TabsTrigger value="UNJUK_DIRI">Unjuk Diri (Umum)</TabsTrigger>
              </TabsList>
            </Tabs>

          </CardContent>
        </Card>
        {/* ========================================================== */}
        {/* --- (BATAS KARTU FILTER) --- */}
        {/* ========================================================== */}


        {/* Card Konten Dinamis berdasarkan Tab */}
        <Card>
          <CardHeader>
            <CardTitle>Penugasan Skema {skemaId} - {tipeUjian}</CardTitle>
            <CardDescription>
              {/* (Deskripsi di-update untuk menampilkan filter aktif) */}
              Menampilkan {paginatedAsesi.length} dari {filteredAsesi.length} asesi
              {filterKelas !== "SEMUA" && ` (hanya kelas ${filterKelas})`}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                
                {/* Tampilan Matrix untuk TEORI (Tidak berubah) */}
                {tipeUjian === 'TEORI' && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            Penugasan Kelas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <Select value={selectedBulkClass} onValueChange={setSelectedBulkClass}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Kelas --" />
                          </SelectTrigger>
                          <SelectContent>
                            {kelasList.map(kelas => (
                              <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkAsesor} onValueChange={setSelectedBulkAsesor}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Asesor --" />
                          </SelectTrigger>
                          <SelectContent>
                            {asesorList.map(asesor => (
                              <SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkUnitStart} onValueChange={setSelectedBulkUnitStart}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Dari Unit --" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map(u => (
                              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkUnitEnd} onValueChange={setSelectedBulkUnitEnd}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Sampai Unit --" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map(u => (
                              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleBulkAssignTeori}
                          disabled={!selectedBulkClass || !selectedBulkAsesor || !selectedBulkUnitStart || !selectedBulkUnitEnd}
                        >
                          Terapkan ke Kelas
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table className="min-w-max">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-gray-50 z-10 w-[250px]">Asesi</TableHead>
                            {units.map(unit => (
                              <TableHead key={unit.id} className="w-[200px]">
                                Unit {unit.nomorUnit}: {unit.judul}
                              </TableHead>
                            ))}
                            <TableHead className="sticky right-0 bg-gray-50 z-10 w-[120px] text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map(asesi => {
                            const isThisAsesiSaving = savingAsesiId === asesi.id;
                            const areAllUnitsAssigned = units.every(
                              unit => teoriAssignments[`${asesi.id}-${unit.id}`]
                            );

                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell className="sticky left-0 bg-white hover:bg-gray-50 z-10 w-[250px]">
                                  <p className="font-medium text-gray-900">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>}
                                </TableCell>
                                {units.map(unit => {
                                  const assignmentKey = `${asesi.id}-${unit.id}`
                                  const currentAsesorId = teoriAssignments[assignmentKey] || "" 
                                  return (
                                    <TableCell key={unit.id} className="w-[200px]">
                                      <Select
                                          value={currentAsesorId}
                                          onValueChange={(value) => handleTeoriAssignmentChange(asesi.id, unit.id, value)}
                                        >
                                          <SelectTrigger className="bg-gray-50 w-full">
                                            <SelectValue placeholder="-- Pilih Asesor --" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {asesorList.map(asesor => (
                                              <SelectItem key={asesor.id} value={asesor.id}>
                                                {asesor.nama}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="sticky right-0 bg-white hover:bg-gray-50 z-10 w-[120px] text-center">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTeori(asesi.id)}
                                    disabled={isThisAsesiSaving || !areAllUnitsAssigned}
                                    title={!areAllUnitsAssigned ? "Harap tugaskan asesor untuk SEMUA unit" : "Simpan Penugasan"}
                                  >
                                    {isThisAsesiSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {/* Tampilan List Sederhana untuk PRAKTIKUM (Tidak berubah) */}
                {tipeUjian === 'PRAKTIKUM' && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                        Bulk Assign (Praktikum)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={selectedBulkClassPraktikum} onValueChange={setSelectedBulkClassPraktikum}>
                          <SelectTrigger><SelectValue placeholder="-- Pilih Kelas --" /></SelectTrigger>
                          <SelectContent>
                            {kelasList.map(kelas => (<SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkAsesorPraktikum} onValueChange={setSelectedBulkAsesorPraktikum}>
                          <SelectTrigger><SelectValue placeholder="-- Pilih Asesor --" /></SelectTrigger>
                          <SelectContent>
                            {asesorList.map(asesor => (<SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleBulkAssignPraktikum} disabled={!selectedBulkClassPraktikum || !selectedBulkAsesorPraktikum}>
                          Terapkan ke Kelas
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[40%]">Asesi</TableHead>
                            <TableHead className="w-[40%]">Asesor Penilai</TableHead>
                            <TableHead className="w-[20%] text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map(asesi => {
                            const isSaving = savingAsesiId === asesi.id;
                            const currentAsesorId = praktikumAssignments[asesi.id] || "";
                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <p className="font-medium text-gray-900">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>}
                                </TableCell>
                                <TableCell>
                                  <Select value={currentAsesorId} onValueChange={(value) => handlePraktikumAssignmentChange(asesi.id, value)}>
                                    <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="-- Pilih Asesor --" /></SelectTrigger>
                                    <SelectContent>
                                      {asesorList.map(asesor => (<SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button size="sm" onClick={() => handleSavePraktikum(asesi.id)} disabled={isSaving || !currentAsesorId} title={!currentAsesorId ? "Pilih asesor terlebih dahulu" : "Simpan"}>
                                    {isSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {/* Tampilan List Sederhana untuk UNJUK DIRI (Tidak berubah) */}
                {tipeUjian === 'UNJUK_DIRI' && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                        Bulk Assign (Unjuk Diri)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={selectedBulkClassUnjukDiri} onValueChange={setSelectedBulkClassUnjukDiri}>
                          <SelectTrigger><SelectValue placeholder="-- Pilih Kelas --" /></SelectTrigger>
                          <SelectContent>
                            {kelasList.map(kelas => (<SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkAsesorUnjukDiri} onValueChange={setSelectedBulkAsesorUnjukDiri}>
                          <SelectTrigger><SelectValue placeholder="-- Pilih Asesor --" /></SelectTrigger>
                          <SelectContent>
                            {asesorList.map(asesor => (<SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleBulkAssignUnjukDiri} disabled={!selectedBulkClassUnjukDiri || !selectedBulkAsesorUnjukDiri}>
                          Terapkan ke Kelas
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[40%]">Asesi</TableHead>
                            <TableHead className="w-[40%]">Asesor Penilai</TableHead>
                            <TableHead className="w-[20%] text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map(asesi => {
                            const isSaving = savingAsesiId === asesi.id;
                            const currentAsesorId = unjukDiriAssignments[asesi.id] || "";
                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <p className="font-medium text-gray-900">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>}
                                </TableCell>
                                <TableCell>
                                  <Select value={currentAsesorId} onValueChange={(value) => handleUnjukDiriAssignmentChange(asesi.id, value)}>
                                    <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="-- Pilih Asesor --" /></SelectTrigger>
                                    <SelectContent>
                                      {asesorList.map(asesor => (<SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button size="sm" onClick={() => handleSaveUnjukDiri(asesi.id)} disabled={isSaving || !currentAsesorId} title={!currentAsesorId ? "Pilih asesor terlebih dahulu" : "Simpan"}>
                                    {isSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
              </>
            )}
            {paginatedAsesi.length === 0 && !loading && (
                 <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2" />
                    {/* (Pesan error di-update) */}
                    {filterKelas !== "SEMUA" 
                      ? `Tidak ada asesi di kelas ${filterKelas} yang cocok dengan pencarian.`
                      : "Tidak ada asesi yang cocok dengan filter."
                    }
                 </div>
            )}
          </CardContent>
          
          {/* Pagination Footer (Tidak berubah) */}
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          )}

        </Card>
      </div>
    </MainLayout>
  )
}