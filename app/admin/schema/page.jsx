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
  mockCreateSkema 
} from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, BookOpen, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// ===============================================================
// --- KOMPONEN 'SoalList' ---
// ===============================================================
const SoalList = ({ soal, loading, onEdit }) => {
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (soal.length === 0) return <AlertDescription>Belum ada soal.</AlertDescription>;

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {soal.map((s) => (
        <div key={s.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.tipeSoal === "TRYOUT" ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}>{s.tipeSoal}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => onEdit(s)}>
              <Edit2 className="w-4 h-4" />
            </Button>
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

  // State Dialog (Modal)
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isMateriDialogOpen, setIsMateriDialogOpen] = useState(false);
  const [isSoalDialogOpen, setIsSoalDialogOpen] = useState(false);

  // State Form
  const [unitForm, setUnitForm] = useState({ id: null, nomorUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
  const [materiForm, setMateriForm] = useState({ id: null, judul: "", jenis: "VIDEO", urlKonten: "" });
  const [soalForm, setSoalForm] = useState({
    id: null, teks: "", tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI",
    pilihan: ["", "", "", ""], kunciJawaban: "", fileTemplateSoal: "",
  });

  // Load units dan bank soal global (Tryout & Praktikum)
  useEffect(() => {
    loadUnitsAndGlobalSoal();
  }, [skemaId]); // <-- Trigger tiap kali skemaId (dari prop) berubah

  const loadUnitsAndGlobalSoal = async () => {
    try {
      setLoadingUnits(true);
      setLoadingContent(true); 
      setSelectedUnit(null);
      setSoalTeori([]);

      const unitsData = await mockGetUnitsForSkema(skemaId);
      setUnits(unitsData || []); // <-- Pastikan array

      const [tryoutData, praktikumData] = await Promise.all([
        mockGetSoalForUnit(`${skemaId}-1`, "TRYOUT"), 
        mockGetSoalForUnit(`${skemaId}-1`, "UJIAN_PRAKTIKUM"),
      ]);
      setSoalTryout(tryoutData || []); 
      setSoalPraktikum(praktikumData || []); 

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

  // Load konten spesifik unit (Materi & Soal Teori)
  const selectUnit = async (unit) => {
    if (selectedUnit?.id === unit.id) return;

    setSelectedUnit(unit);
    setLoadingContent(true);
    try {
      const [materiData, soalTeoriData] = await Promise.all([
        mockGetMateriForUnit(unit.id),
        mockGetSoalForUnit(unit.id, "UJIAN_TEORI"), // HANYA AMBIL SOAL TEORI
      ]);
      setMateri(materiData || []);
      setSoalTeori(soalTeoriData || []);
    } catch (error) {
      console.error("[v0] Error loading unit content:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleOpenSoalModal = (tipeSoalDefault, soalData = null) => {
    if (soalData) {
      setSoalForm({
        ...soalData,
        pilihan: soalData.pilihan || ["", "", "", ""],
        kunciJawaban: soalData.kunciJawaban || "",
        fileTemplateSoal: soalData.fileTemplateSoal || "",
      });
    } else {
      setSoalForm({
        id: null, teks: "", tipeSoal: tipeSoalDefault,
        tipeJawaban: tipeSoalDefault === "UJIAN_PRAKTIKUM" ? "UPLOAD_FILE" : "ESAI",
        pilihan: ["", "", "", ""], kunciJawaban: "", fileTemplateSoal: "",
      });
    }
    setIsSoalDialogOpen(true);
  };

  // --- CRUD Handlers (Placeholder) ---
  const handleSaveUnit = () => { alert("CRUD Unit belum diimplementasikan"); setIsUnitDialogOpen(false); };
  const handleSaveMateri = () => { alert("CRUD Materi belum diimplementasikan"); setIsMateriDialogOpen(false); };
  const handleSaveSoal = () => { alert("CRUD Soal belum diimplementasikan"); setIsSoalDialogOpen(false); };

  // --- (PERBAIKAN DI SINI: BUNGKUS DENGAN React.Fragment) ---
  return (
    <React.Fragment> 
      <Tabs defaultValue="unit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unit">Unit Kompetensi & Soal Teori</TabsTrigger>
          <TabsTrigger value="tryout">Bank Soal Tryout</TabsTrigger>
          <TabsTrigger value="praktikum">Bank Soal Praktikum</TabsTrigger>
        </TabsList>

        {/* 1. Tab Unit Kompetensi (Materi & Soal Teori) */}
        <TabsContent value="unit" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unit List */}
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); setUnitForm(unit); setIsUnitDialogOpen(true); }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Konten Unit Terpilih */}
            <div className="lg:col-span-2">
              {loadingUnits ? ( // <-- Cek loadingUnits
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
                                  <p className="text-xs text-muted-foreground">{m.urlKonten}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => { setMateriForm(m); setIsMateriDialogOpen(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
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
                        <SoalList soal={soalTeori} loading={loadingContent} onEdit={(s) => handleOpenSoalModal("UJIAN_TEORI", s)} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : ( // Ini case untuk skema baru yg 0 unit
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

        {/* 2. Tab Bank Soal Tryout */}
        <TabsContent value="tryout" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Tryout (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("TRYOUT")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList soal={soalTryout} loading={loadingUnits} onEdit={(s) => handleOpenSoalModal("TRYOUT", s)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Tab Bank Soal Praktikum */}
        <TabsContent value="praktikum" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Ujian Praktikum (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("UJIAN_PRAKTIKUM")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList soal={soalPraktikum} loading={loadingUnits} onEdit={(s) => handleOpenSoalModal("UJIAN_PRAKTIKUM", s)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- (INI DIA PERBAIKANNYA: MODAL DIPINDAH KE SINI) --- */}
      {/* ======================= */}
      {/* ANEKA MODAL DI BAWAH INI */}
      {/* ======================= */}

      {/* Dialog/Modal CRUD Unit */}
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

      {/* Dialog/Modal CRUD Materi */}
      <Dialog open={isMateriDialogOpen} onOpenChange={setIsMateriDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{materiForm.id ? "Edit Materi" : "Tambah Materi Baru"}</DialogTitle>
            <DialogDescription>Materi ini akan muncul di unit: {selectedUnit?.judul}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Judul Materi" value={materiForm.judul} onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })} />
            <Select value={materiForm.jenis} onValueChange={(value) => setMateriForm({ ...materiForm, jenis: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video (Youtube, etc)</SelectItem>
                <SelectItem value="PDF">Dokumen PDF</SelectItem>
                <SelectItem value="LINK">Artikel/Link Eksternal</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="URL Konten (misal: https://youtube.com/...)" value={materiForm.urlKonten} onChange={(e) => setMateriForm({ ...materiForm, urlKonten: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMateriDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveMateri}>Simpan Materi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog/Modal CRUD Soal */}
      <Dialog open={isSoalDialogOpen} onOpenChange={setIsSoalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{soalForm.id ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
            <DialogDescription>{soalForm.tipeSoal === "UJIAN_TEORI" ? `Soal ini akan muncul di unit: ${selectedUnit?.judul}` : `Soal ini untuk Bank Soal ${soalForm.tipeSoal}`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Label>Tipe Soal</Label>
            <Input value={soalForm.tipeSoal} disabled className="bg-gray-100" />
            <Label>Teks Pertanyaan</Label>
            <Textarea placeholder="Tulis teks pertanyaan di sini..." value={soalForm.teks} onChange={(e) => setSoalForm({ ...soalForm, teks: e.target.value })} rows={4} />
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
            {soalForm.tipeJawaban === "UPLOAD_FILE" && (
              <div>
                <Label>URL File Template Soal (Opsional)</Label>
                <Input placeholder="URL File Template Soal (opsional, .zip/.pdf)" value={soalForm.fileTemplateSoal} onChange={(e) => setSoalForm({ ...soalForm, fileTemplateSoal: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSoalDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveSoal}>Simpan Soal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment> // <-- TUTUP BUNGKUSNYA
  );
};


// ===============================================================
// --- KOMPONEN UTAMA PAGE (YANG DI-REFACTOR) ---
// ===============================================================
export default function SchemaPage() {
  const [skemaList, setSkemaList] = useState([]); // <-- Daftar skema dari API
  const [activeSkemaTab, setActiveSkemaTab] = useState(""); // <-- Skema yang aktif
  const [loadingSkema, setLoadingSkema] = useState(true);
  const [isSavingSkema, setIsSavingSkema] = useState(false); 

  // --- (STATE & FUNGSI UNTUK MODAL TAMBAH SKEMA BARU) ---
  const [isSkemaDialogOpen, setIsSkemaDialogOpen] = useState(false);
  const [skemaForm, setSkemaForm] = useState({ id: "", judul: "", deskripsi: "" });

  useEffect(() => {
    loadSkemaList();
  }, []);

  const loadSkemaList = async () => {
    try {
      setLoadingSkema(true);
      const data = await mockGetAllSkema();
      setSkemaList(data);
      if (data.length > 0 && !activeSkemaTab) {
        setActiveSkemaTab(data[0].id); // Set tab aktif ke skema pertama
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
      
      // Reload daftar skema untuk dapet data terbaru
      await loadSkemaList(); 
      
      setActiveSkemaTab(newSkema.id); // Langsung pindah ke tab skema baru
      setIsSkemaDialogOpen(false); // Tutup modal
      setSkemaForm({ id: "", judul: "", deskripsi: "" }); // Reset form
    } catch (error) {
      console.error("[v0] Error creating skema:", error);
      alert(`Gagal menyimpan skema: ${error.message}`);
    } finally {
      setIsSavingSkema(false);
    }
  };
  // --- (BATAS STATE & FUNGSI MODAL) ---

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
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
              <Button onClick={() => setIsSkemaDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Skema Baru
              </Button>
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
          </Tabs>
        )}

      </div>

      {/* --- (MODAL BARU UNTUK TAMBAH SKEMA) --- */}
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
      {/* --- (BATAS MODAL BARU) --- */}

    </MainLayout>
  );
}