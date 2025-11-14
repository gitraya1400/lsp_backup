"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  mockGetUnitsForSkema, 
  mockGetMateriForUnit, 
  mockGetSoalForUnit,
  mockGetAllSkema, 
  mockCreateSkema,
  mockGetSoalTryoutGabungan,    
  mockGetSoalPraktikumGabungan,
  mockDeleteSkema,
  mockCreateUnit,
  mockUpdateUnit,
  mockDeleteUnit,
  mockDeleteSoal,
  mockCreateMateri,    // <-- added
  mockUpdateMateri,    // <-- added
  mockDeleteMateri     // <-- added
} from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
// Impor ikon baru untuk upload file
import { Plus, Edit2, Trash2, BookOpen, FileText, File, UploadCloud, X } from "lucide-react"; 
import { Spinner } from "@/components/ui/spinner";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ===============================================================
// --- KOMPONEN 'SoalList' ---
// ===============================================================
const SoalList = ({ soal, loading, onEdit, onDelete }) => {
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (soal.length === 0) return <AlertDescription>Belum ada soal.</AlertDescription>;

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {soal.map((s) => (
        <div key={s.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.tipeSoal === "TRYOUT" ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}>{s.tipeSoal}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => onEdit(s)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={() => onDelete && onDelete(s)} title="Hapus Soal">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="font-medium text-sm my-2">{s.teks}</p>
          <span className="text-xs text-gray-500">Tipe Jawaban: {s.tipeJawaban}</span>
        </div>
      ))}
    </div>
  );
};

// ===============================================================
// --- KOMPONEN BARU UNTUK NGURUS KONTEN TIAP SKEMA ---
// ===============================================================
const SkemaContentManager = ({ skemaId }) => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [soalTeori, setSoalTeori] = useState([]);
  const [soalTryout, setSoalTryout] = useState([]);
  const [soalPraktikum, setSoalPraktikum] = useState([]);
  const [materi, setMateri] = useState([]);
  
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // state untuk mencegah double-submit saat menyimpan unit
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isMateriDialogOpen, setIsMateriDialogOpen] = useState(false);
  const [isSoalDialogOpen, setIsSoalDialogOpen] = useState(false);

  const [unitForm, setUnitForm] = useState({ id: null, nomorUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
  const [materiForm, setMateriForm] = useState({
    id: null,
    judul: "",
    jenis: "VIDEO", // VIDEO, PDF, atau LINK
    urlKonten: "",
    file: null
  });
  
  // --- (REVISI STATE SOAL) ---
  const [soalForm, setSoalForm] = useState({
    id: null, teks: "", tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI",
    pilihan: ["", "", "", ""], kunciJawaban: "",
    filePendukung: [], // Menggantikan fileTemplateSoal
  });

  useEffect(() => {
    loadUnitsAndGlobalSoal();
  }, [skemaId]); 

  const loadUnitsAndGlobalSoal = async () => {
    try {
      setLoadingUnits(true);
      setLoadingContent(true); 
      setSelectedUnit(null);
      setSoalTeori([]);

      const unitsData = await mockGetUnitsForSkema(skemaId);
      setUnits(unitsData || []); 

      const [tryoutData, praktikumData] = await Promise.all([
      mockGetSoalTryoutGabungan(skemaId), 
      mockGetSoalPraktikumGabungan(skemaId), 
      ]);
      setSoalTryout(tryoutData || []); 
      setSoalPraktikum(praktikumData ? [praktikumData] : []);
      if (unitsData && unitsData.length > 0) {
        await selectUnit(unitsData[0]);
      } else {
        setLoadingContent(false); 
      }
    } catch (error) {
      console.error("[v0] Error loading units:", error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const selectUnit = async (unit) => {
    if (selectedUnit?.id === unit.id) return;

    setSelectedUnit(unit);
    setLoadingContent(true);
    try {
      const [materiData, soalTeoriData] = await Promise.all([
        mockGetMateriForUnit(unit.id),
        mockGetSoalForUnit(unit.id, "UJIAN_TEORI"), 
      ]);
      setMateri(materiData || []);
      setSoalTeori(soalTeoriData || []);
    } catch (error) {
      console.error("[v0] Error loading unit content:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  // --- (REVISI HANDLER MODAL) ---
  const handleOpenSoalModal = (tipeSoalDefault, soalData = null) => {
    if (soalData) {
      setSoalForm({
        ...soalData,
        pilihan: soalData.pilihan || ["", "", "", ""],
        kunciJawaban: soalData.kunciJawaban || "",
        filePendukung: soalData.filePendukung || [], // <-- Direvisi
      });
    } else {
      setSoalForm({
        id: null, teks: "", tipeSoal: tipeSoalDefault,
        tipeJawaban: tipeSoalDefault === "UJIAN_PRAKTIKUM" ? "UPLOAD_FILE" : "ESAI",
        pilihan: ["", "", "", ""], kunciJawaban: "", 
        filePendukung: [], // <-- Direvisi
      });
    }
    setIsSoalDialogOpen(true);
  };
  
  // --- (HANDLER BARU UNTUK FILE UPLOAD SIMULASI) ---
  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => ({
        id: `temp-${file.name}`, // ID sementara
        nama: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: `/api/mock-download/${file.name}` // URL aman simulasi
      }));
      
      setSoalForm(prev => ({
        ...prev,
        filePendukung: [...prev.filePendukung, ...newFiles]
      }));
    }
  };

  const removeFile = (fileName) => {
      setSoalForm(prev => ({
        ...prev,
        filePendukung: prev.filePendukung.filter(f => f.nama !== fileName)
      }));
  };
  // --- (BATAS HANDLER BARU) ---


  const handleSaveUnit = async () => {
    if (isSavingUnit) return;
    try {
      setIsSavingUnit(true);
      // basic validation
      if (!unitForm.nomorUnit || !unitForm.judul) {
        alert("Nomor Unit dan Judul Unit wajib diisi.");
        return;
      }
      // prepare payload (sanitize nomor)
      const payload = {
        nomorUnit: Number(unitForm.nomorUnit) || undefined,
        kodeUnit: unitForm.kodeUnit,
        judul: unitForm.judul,
        deskripsi: unitForm.deskripsi,
        durasiTeori: Number(unitForm.durasiTeori) || 15,
      };

      if (unitForm.id) {
        // update existing
        const updated = await mockUpdateUnit(skemaId, unitForm.id, payload);
        // refresh full list to keep order/avoid duplicates
        const fresh = await mockGetUnitsForSkema(skemaId);
        setUnits(fresh || []);
        if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
      } else {
        // create new
        await mockCreateUnit(skemaId, payload);
        // reload list from server mock to avoid duplicate local inserts
        const fresh = await mockGetUnitsForSkema(skemaId);
        setUnits(fresh || []);
        // auto-select last created (best-effort)
        const last = (fresh || []).slice(-1)[0];
        if (last) await selectUnit(last);
      }

      setIsUnitDialogOpen(false);
      setUnitForm({ id: null, nomorUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
    } catch (err) {
      console.error("Gagal menyimpan unit:", err);
      alert(`Gagal menyimpan unit: ${err.message}`);
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!confirm(`Hapus Unit "${unit.judul}"? Aksi ini akan menghapus semua soal pada unit ini.`)) return;
    try {
      await mockDeleteUnit(skemaId, unit.id);
      setUnits(prev => prev.filter(u => u.id !== unit.id));
      // if deleted unit was selected, clear or select next
      if (selectedUnit?.id === unit.id) {
        setSelectedUnit(null);
        if (units.length > 0) {
          const next = units.find(u => u.id !== unit.id);
          if (next) await selectUnit(next);
        }
      }
    } catch (err) {
      console.error("Gagal menghapus unit:", err);
      alert(`Gagal menghapus unit: ${err.message}`);
    }
  };

  const handleSaveMateri = async () => {
    if (!selectedUnit) { 
      alert("Pilih unit dulu."); 
      return; 
    }
    
    if (!materiForm.judul || materiForm.judul.trim() === "") { 
      alert("Judul materi wajib diisi."); 
      return; 
    }

    // Validasi berdasarkan jenis
    if (materiForm.jenis === "PDF" && !materiForm.file && !materiForm.urlKonten) {
      alert("Silakan pilih file PDF untuk materi.");
      return;
    }
    
    if ((materiForm.jenis === "VIDEO" || materiForm.jenis === "LINK") && !materiForm.urlKonten) {
      alert("URL wajib diisi untuk tipe Video/Link.");
      return;
    }

    try {
      const payload = {
        judul: materiForm.judul,
        jenis: materiForm.jenis,
        urlKonten: materiForm.urlKonten,
        file: materiForm.file
      };

      if (materiForm.id) {
        await mockUpdateMateri(selectedUnit.id, materiForm.id, payload);
      } else {
        await mockCreateMateri(selectedUnit.id, payload);
      }

      // Refresh materi list
      const fresh = await mockGetMateriForUnit(selectedUnit.id);
      setMateri(fresh || []);
      
      // Reset form & close dialog
      setIsMateriDialogOpen(false);
      setMateriForm({ id: null, judul: "", jenis: "VIDEO", urlKonten: "", file: null });
    } catch (err) {
      console.error("Gagal menyimpan materi:", err);
      alert(`Gagal menyimpan materi: ${err.message}`);
    }
  };

  const handleDeleteMateri = async (m) => {
    if (!confirm(`Hapus materi "${m.judul}"?`)) return;
    try {
      await mockDeleteMateri(selectedUnit.id, m.id);
      const fresh = await mockGetMateriForUnit(selectedUnit.id);
      setMateri(fresh || []);
    } catch (err) {
      console.error("Gagal menghapus materi:", err);
      alert(`Gagal menghapus materi: ${err.message}`);
    }
  };

  const handleSaveSoal = () => {
     // validasi dasar
     if (!soalForm.teks || soalForm.teks.trim() === "") {
       alert("Teks soal wajib diisi.");
       return;
     }

     if (soalForm.tipeJawaban === "PILIHAN_GANDA") {
       const hasChoice = soalForm.pilihan.some((p) => p && p.trim() !== "");
       if (!hasChoice) {
         alert("Minimal satu opsi pilihan ganda harus diisi.");
         return;
       }
       if (!soalForm.kunciJawaban || soalForm.kunciJawaban.trim() === "") {
         alert("Kunci jawaban untuk pilihan ganda wajib diisi.");
         return;
       }
     }

     // helper untuk update pada array yang sesuai
     const updateInArray = (arr, setter) => {
       const idx = arr.findIndex((s) => s.id === soalForm.id);
       if (idx !== -1) {
         const updated = { ...arr[idx], ...soalForm };
         const next = [...arr];
         next[idx] = updated;
         setter(next);
         return true;
       }
       return false;
     };

     // Jika edit (ada id), coba cari dan update di tiap list
     if (soalForm.id) {
       if (updateInArray(soalTeori, setSoalTeori)) {
         setIsSoalDialogOpen(false);
         return;
       }
       if (updateInArray(soalTryout, setSoalTryout)) {
         setIsSoalDialogOpen(false);
         return;
       }
       if (updateInArray(soalPraktikum, setSoalPraktikum)) {
         setIsSoalDialogOpen(false);
         return;
       }
       // jika tidak ditemukan, lanjut untuk membuat baru
     }

     // Buat soal baru sesuai tipe
     if (soalForm.tipeSoal === "UJIAN_TEORI") {
       if (!selectedUnit) {
         alert("Pilih unit dulu sebelum menambah soal teori.");
         return;
       }
       const id = `${selectedUnit.id}-teori-${Date.now()}`;
       const newSoal = {
         ...soalForm,
         id,
         unitId: selectedUnit.id,
         urutan: soalTeori.length + 1,
       };
       setSoalTeori((prev) => [newSoal, ...prev]);
     } else if (soalForm.tipeSoal === "TRYOUT") {
       const id = `${skemaId}-tryout-${Date.now()}`;
       const newSoal = {
         ...soalForm,
         id,
         unitId: null,
         urutan: soalTryout.length + 1,
       };
       setSoalTryout((prev) => [newSoal, ...prev]);
     } else if (soalForm.tipeSoal === "UJIAN_PRAKTIKUM") {
       // Praktikum diapp sekali-per-skema (gabungan). Jika sudah ada, replace; kalau belum, tambahkan.
       const id = soalForm.id || `${skemaId}-praktikum-${Date.now()}`;
       const newSoal = {
         ...soalForm,
         id,
         skemaId,
       };
       // ganti seluruh array praktikum menjadi satu item terbaru
       setSoalPraktikum([newSoal]);
     }

    setIsSoalDialogOpen(false);
  };

  // --- HAPUS SOAL (semua bank soal: teori, tryout, praktikum) ---
  const handleDeleteSoal = async (soal) => {
    if (!soal || !soal.id) return;
    if (!confirm("Hapus soal ini? Aksi ini tidak dapat dibatalkan.")) return;
    try {
      await mockDeleteSoal(skemaId, soal.id);
      setSoalTeori(prev => prev.filter(s => s.id !== soal.id));
      setSoalTryout(prev => prev.filter(s => s.id !== soal.id));
      setSoalPraktikum(prev => prev.filter(s => s.id !== soal.id));
      // jika soal milik unit yang sedang dipilih, juga refresh unit-level soal
      if (soal.unitId && selectedUnit?.id === soal.unitId) {
        const teori = await mockGetSoalForUnit(selectedUnit.id, "UJIAN_TEORI");
        setSoalTeori(teori || []);
      }
    } catch (err) {
      console.error("Gagal menghapus soal:", err);
      alert(`Gagal menghapus soal: ${err.message}`);
    }
  };
  // --- end hapus soal ---

  // --- (REVISI HANDLER FILE UPLOAD MATERI) ---
  const handleMateriFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validasi tipe file
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Hanya file PDF yang diperbolehkan');
      return;
    }

    const fileMeta = {
      nama: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: `/api/mock-download/${file.name}`,
      id: `temp-${file.name}-${Date.now()}`
    };

    setMateriForm(prev => ({ 
      ...prev, 
      file: fileMeta,
      urlKonten: fileMeta.url 
    }));
  };
  // --- (BATAS REVISI HANDLER FILE UPLOAD MATERI) ---

  return (
    <React.Fragment> 
      <Tabs defaultValue="unit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unit">Unit Kompetensi & Soal Teori</TabsTrigger>
          <TabsTrigger value="tryout">Bank Soal Tryout</TabsTrigger>
          <TabsTrigger value="praktikum">Bank Soal Praktikum</TabsTrigger>
        </TabsList>

        <TabsContent value="unit" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg">Unit Kompetensi</CardTitle>
                  <Button size="sm" onClick={() => setIsUnitDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Unit
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingUnits ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : units.length === 0 ? (
                    <AlertDescription className="text-center py-4">Skema ini belum memiliki unit.</AlertDescription>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {units.map((unit) => (
                        <div
                          key={unit.id}
                          onClick={() => selectUnit(unit)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedUnit?.id === unit.id ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-gray-400"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-800">
                              {unit.nomorUnit}. {unit.judul}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); setUnitForm(unit); setIsUnitDialogOpen(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {loadingUnits ? ( 
                <Skeleton className="h-96 w-full" />
              ) : !selectedUnit && units.length > 0 ? (
                <Card className="h-full flex items-center justify-center min-h-[300px]">
                  <CardContent className="text-center text-gray-500">
                    <p>Pilih unit di sebelah kiri untuk melihat materi dan soal.</p>
                  </CardContent>
                </Card>
              ) : selectedUnit ? (
                <Tabs defaultValue="materi" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="materi">Materi Pembelajaran</TabsTrigger>
                    <TabsTrigger value="soal_teori">Soal Ujian Teori</TabsTrigger>
                  </TabsList>
                  <TabsContent value="materi" className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Daftar Materi</CardTitle>
                        <Button size="sm" onClick={() => setIsMateriDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Materi
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {loadingContent ? <Skeleton className="h-20 w-full" /> : materi.length === 0 ? <AlertDescription>Belum ada materi.</AlertDescription> : (
                          materi.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {m.jenis === "VIDEO" ? <BookOpen className="w-5 h-5 text-red-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                                <div>
                                  <p className="font-medium text-sm">{m.judul}</p>
                                  <p className="text-xs text-muted-foreground">{m.jenis === "PDF" ? (m.fileMeta?.nama || m.urlKonten) : m.urlKonten}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => { setMateriForm(m); setIsMateriDialogOpen(true); }}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={() => handleDeleteMateri(m)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="soal_teori" className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Bank Soal Ujian Teori</CardTitle>
                        <Button size="sm" onClick={() => handleOpenSoalModal("UJIAN_TEORI")}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Soal
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <SoalList soal={soalTeori} loading={loadingContent} onEdit={(s) => handleOpenSoalModal("UJIAN_TEORI", s)} onDelete={handleDeleteSoal} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : ( 
                  <Card className="h-full flex items-center justify-center min-h-[300px]">
                      <CardContent className="text-center text-gray-500">
                        <p>Skema ini belum memiliki unit.</p>
                        <Button size="sm" className="mt-4" onClick={() => setIsUnitDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Unit Pertama
                        </Button>
                      </CardContent>
                    </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tryout" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Tryout (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("TRYOUT")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList soal={soalTryout} loading={loadingUnits} onEdit={(s) => handleOpenSoalModal("TRYOUT", s)} onDelete={handleDeleteSoal} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="praktikum" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Ujian Praktikum (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("UJIAN_PRAKTIKUM")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList soal={soalPraktikum} loading={loadingUnits} onEdit={(s) => handleOpenSoalModal("UJIAN_PRAKTIKUM", s)} onDelete={handleDeleteSoal} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{unitForm.id ? "Edit Unit" : "Tambah Unit Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="ml-1 pd-0"><b>Unit ke : </b></p>
            <Input placeholder="Nomor Unit" value={unitForm.nomorUnit} onChange={(e) => setUnitForm({ ...unitForm, nomorUnit: e.target.value })} />
            <p className="ml-1 pd-0"><b>Judul Unit : </b></p>
            <Input placeholder="Judul Unit" value={unitForm.judul} onChange={(e) => setUnitForm({ ...unitForm, judul: e.target.value })} />
            <h4 className="ml-1 pd-0 h-4">Deskripsi : </h4>
            <Textarea placeholder="Deskripsi Unit" value={unitForm.deskripsi} onChange={(e) => setUnitForm({ ...unitForm, deskripsi: e.target.value })} />
            <p className="ml-1 pd-0"><b>Durasi Ujian Teori (Menit) : </b></p>
            <Input type="number" placeholder="Durasi Ujian Teori (menit)" value={unitForm.durasiTeori} onChange={(e) => setUnitForm({ ...unitForm, durasiTeori: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnitDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveUnit}>Simpan Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMateriDialogOpen} onOpenChange={setIsMateriDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{materiForm.id ? "Edit Materi" : "Tambah Materi Baru"}</DialogTitle>
            <DialogDescription>Materi ini akan muncul di unit: {selectedUnit?.judul}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="Judul Materi" 
              value={materiForm.judul} 
              onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })} 
            />
            
            <Select value={materiForm.jenis} onValueChange={(value) => setMateriForm({ ...materiForm, jenis: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video (URL)</SelectItem>
                <SelectItem value="PDF">Dokumen PDF (Upload)</SelectItem>
                <SelectItem value="LINK">Link Eksternal</SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional rendering berdasarkan jenis materi */}
            {materiForm.jenis === "VIDEO" && (
              <Input 
                placeholder="URL Video (misal: https://youtube.com/...)" 
                value={materiForm.urlKonten} 
                onChange={(e) => setMateriForm({ ...materiForm, urlKonten: e.target.value })} 
              />
            )}

            {materiForm.jenis === "LINK" && (
              <Input 
                placeholder="URL Link Eksternal" 
                value={materiForm.urlKonten} 
                onChange={(e) => setMateriForm({ ...materiForm, urlKonten: e.target.value })} 
              />
            )}

            {materiForm.jenis === "PDF" && (
              <div>
                <Label className="text-sm">Upload File PDF</Label>
                <Input 
                  id="file-upload-materi" 
                  type="file" 
                  accept=".pdf" 
                  className="mt-2" 
                  onChange={handleMateriFileChange} // <-- Uses the function here
                />
                {materiForm.file && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate">{materiForm.file.nama}</p>
                      <p className="text-xs text-muted-foreground">{materiForm.file.size}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setMateriForm(prev => ({ ...prev, file: null, urlKonten: "" }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMateriDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveMateri}>Simpan Materi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- (REVISI MODAL SOAL) --- */}
      <Dialog open={isSoalDialogOpen} onOpenChange={setIsSoalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{soalForm.id ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
            <DialogDescription>{soalForm.tipeSoal === "UJIAN_TEORI" ? `Soal ini akan muncul di unit: ${selectedUnit?.judul}` : `Soal ini untuk Bank Soal ${soalForm.tipeSoal}`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Label>Tipe Soal</Label>
            <Input value={soalForm.tipeSoal} disabled className="bg-gray-100" />
            
            <Label>Teks Pertanyaan / Instruksi</Label>
            <Textarea placeholder="Tulis teks pertanyaan atau instruksi studi kasus di sini..." value={soalForm.teks} onChange={(e) => setSoalForm({ ...soalForm, teks: e.target.value })} rows={4} />
            
            <Label>Tipe Jawaban</Label>
            <Select value={soalForm.tipeJawaban} onValueChange={(value) => setSoalForm({ ...soalForm, tipeJawaban: value })}>
              <SelectTrigger><SelectValue placeholder="Pilih Tipe Jawaban..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PILIHAN_GANDA">Pilihan Ganda (Nilai Otomatis)</SelectItem>
                <SelectItem value="ESAI">Esai (Nilai Manual)</SelectItem>
                <SelectItem value="UPLOAD_FILE">Upload File (Hanya Praktikum)</SelectItem>
              </SelectContent>
            </Select>
            
            {soalForm.tipeJawaban === "PILIHAN_GANDA" && (
              <div className="space-y-2 border p-4 rounded-md">
                <Label>Opsi Pilihan Ganda</Label>
                {soalForm.pilihan.map((opsi, index) => (
                  <Input key={index} placeholder={`Opsi ${String.fromCharCode(65 + index)}`} value={opsi} onChange={(e) => { const newPilihan = [...soalForm.pilihan]; newPilihan[index] = e.target.value; setSoalForm({ ...soalForm, pilihan: newPilihan }); }} />
                ))}
                <Label className="pt-2">Kunci Jawaban</Label>
                <Input placeholder="Kunci Jawaban (contoh: A)" value={soalForm.kunciJawaban} onChange={(e) => setSoalForm({ ...soalForm, kunciJawaban: e.target.value })} />
              </div>
            )}
            
            {soalForm.tipeJawaban === "ESAI" && (
              <div>
                <Label>Kata Kunci (Opsional)</Label>
                <Input placeholder="Kata kunci jawaban (untuk panduan asesor)" value={soalForm.kunciJawaban} onChange={(e) => setSoalForm({ ...soalForm, kunciJawaban: e.target.value })} />
              </div>
            )}
            
            {/* (BLOK UPLOAD_FILE DIGANTI TOTAL) */}
            {soalForm.tipeJawaban === "UPLOAD_FILE" && (
              <div className="space-y-4 border p-4 rounded-md">
                <Label>File Pendukung (Dataset, Panduan, Template, dll)</Label>
                
                {/* Daftar File */}
                <div className="space-y-2">
                  {soalForm.filePendukung.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Belum ada file pendukung.</p>
                  )}
                  {soalForm.filePendukung.map((file) => (
                    <div key={file.id || file.nama} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <File className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{file.nama}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 flex-shrink-0" onClick={() => removeFile(file.nama)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Tombol Upload (Simulasi) */}
                <div>
                  <Label 
                    htmlFor="file-upload-praktikum" 
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border-dashed border-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Tambah File Pendukung
                  </Label>
                  <Input 
                    id="file-upload-praktikum" 
                    type="file" 
                    multiple 
                    className="sr-only" // Sembunyikan input asli
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Anda dapat mengunggah beberapa file (misal: .csv, .pdf, .pptx). File-file ini akan disimpan di server LMS.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSoalDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveSoal}>Simpan Soal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};


// ===============================================================
// --- KOMPONEN UTAMA PAGE (YANG DI-REFACTOR) ---
// ===============================================================
export default function SchemaPage() {
  const [skemaList, setSkemaList] = useState([]); 
  const [activeSkemaTab, setActiveSkemaTab] = useState(""); 
  const [loadingSkema, setLoadingSkema] = useState(true);
  const [isSavingSkema, setIsSavingSkema] = useState(false); 

  const [isSkemaDialogOpen, setIsSkemaDialogOpen] = useState(false);
  const [skemaForm, setSkemaForm] = useState({ id: "", judul: "", deskripsi: "" });

  // --- (TAMBAHAN STATE UNTUK HAPUS SKEMA) ---
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeletingSkema, setIsDeletingSkema] = useState(false);
  // --- (BATAS TAMBAHAN) ---

  useEffect(() => {
    loadSkemaList();
  }, []);

  const loadSkemaList = async () => {
    try {
      setLoadingSkema(true);
      const data = await mockGetAllSkema();
      setSkemaList(data);
      if (data.length > 0 && !activeSkemaTab) {
        setActiveSkemaTab(data[0].id); 
      }
    } catch (error) {
      console.error("[v0] Error loading skema list:", error);
    } finally {
      setLoadingSkema(false);
    }
  };

  const handleSaveSkema = async () => {
    if (!skemaForm.id || !skemaForm.judul) {
      alert("ID Skema dan Nama Lengkap Skema wajib diisi.");
      return;
    }
    
    try {
      setIsSavingSkema(true);
      const newSkema = await mockCreateSkema(skemaForm);
      
      await loadSkemaList(); 
      
      setActiveSkemaTab(newSkema.id); 
      setIsSkemaDialogOpen(false); 
      setSkemaForm({ id: "", judul: "", deskripsi: "" }); 
    } catch (error) {
      console.error("[v0] Error creating skema:", error);
      alert(`Gagal menyimpan skema: ${error.message}`);
    } finally {
      setIsSavingSkema(false);
    }
  };

  // --- (TAMBAHAN FUNCTION UNTUK HAPUS SKEMA) ---
  const handleDeleteSkema = async () => {
    if (!activeSkemaTab) return;
    
    try {
      setIsDeletingSkema(true);
      await mockDeleteSkema(activeSkemaTab);
      
      // Refresh skema list
      await loadSkemaList();
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("[v0] Error deleting skema:", error);
      alert(`Gagal menghapus skema: ${error.message}`);
    } finally {
      setIsDeletingSkema(false);
    }
  };
  // --- (BATAS TAMBAHAN) ---

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Skema & Konten</h1>
          <p className="text-gray-600 mt-1">Kelola skema, unit kompetensi, materi pembelajaran, dan soal ujian</p>
        </div>

        {loadingSkema ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Tabs value={activeSkemaTab} onValueChange={setActiveSkemaTab} className="w-full">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <TabsList>
                {skemaList.map((skema) => (
                  <TabsTrigger key={skema.id} value={skema.id}>
                    {skema.judul} ({skema.id})
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteAlertOpen(true)}
                  disabled={!activeSkemaTab || isDeletingSkema}
                  title={!activeSkemaTab ? "Pilih skema terlebih dahulu" : "Hapus skema aktif"}
                >
                  {isDeletingSkema ? <Spinner className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Hapus Skema
                </Button>

                <Button onClick={() => setIsSkemaDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Skema Baru
                </Button>
              </div>
            </div>

            {skemaList.map((skema) => (
              <TabsContent 
                key={skema.id} 
                value={skema.id} 
                className="mt-4"
                forceMount={activeSkemaTab === skema.id}
              >
                <SkemaContentManager skemaId={skema.id} />
                
              </TabsContent>
            ))}

            {/* Tambahkan AlertDialog di bawah Dialog yang sudah ada */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus skema {activeSkemaTab} beserta seluruh kontennya.
                    Aksi ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingSkema}>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteSkema}
                    disabled={isDeletingSkema}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingSkema ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Hapus Permanen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Tabs>
        )}

      </div>

      <Dialog open={isSkemaDialogOpen} onOpenChange={setIsSkemaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Skema Sertifikasi Baru</DialogTitle>
            <DialogDescription>
              Buat skema baru. Anda dapat menambahkan unit kompetensi setelah skema dibuat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="skema-id" className="text-sm font-medium text-gray-900">ID Skema (Singkatan) *</Label>
              <Input 
                id="skema-id" 
                placeholder="Contoh: AI_OPS" 
                value={skemaForm.id}
                onChange={(e) => setSkemaForm({ ...skemaForm, id: e.target.value.toUpperCase().replace(/\s+/g, '_') })} 
                className="mt-1 border-gray-300" 
              />
              <p className="text-xs text-gray-500 mt-1">Harus unik, huruf kapital, tanpa spasi (spasi akan diganti '_').</p>
            </div>
            <div>
              <Label htmlFor="skema-judul" className="text-sm font-medium text-gray-900">Nama Lengkap Skema *</Label>
              <Input 
                id="skema-judul" 
                placeholder="Contoh: AI Operations Engineer" 
                value={skemaForm.judul}
                onChange={(e) => setSkemaForm({ ...skemaForm, judul: e.target.value })} 
                className="mt-1 border-gray-300" 
              />
            </div>
             <div>
              <Label htmlFor="skema-deskripsi" className="text-sm font-medium text-gray-900">Deskripsi (Opsional)</Label>
              <Textarea 
                id="skema-deskripsi" 
                placeholder="Jelaskan skema ini secara singkat..." 
                value={skemaForm.deskripsi}
                onChange={(e) => setSkemaForm({ ...skemaForm, deskripsi: e.target.value })} 
                rows={3} 
                className="mt-1 border-gray-300" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSkemaDialogOpen(false)} disabled={isSavingSkema}>
              Batal
            </Button>
            <Button onClick={handleSaveSkema} disabled={!skemaForm.id || !skemaForm.judul || isSavingSkema}>
              {isSavingSkema ? <Spinner className="w-4 h-4 mr-2" /> : "Simpan Skema"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </MainLayout>
  );
}