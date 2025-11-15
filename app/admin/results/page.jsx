"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog" 
import { 
  mockGetRekapHasilAkhir, 
  mockGetAllSkema 
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, User, Info } from "lucide-react" 

const ITEMS_PER_PAGE = 20 

// Helper component (tidak berubah)
const StatusBadge = ({ status }) => {
  const isKompeten = status === "KOMPETEN"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isKompeten 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}>
      {isKompeten ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {status}
    </span>
  )
}

// Komponen Modal Detail Asesi (Tidak berubah)
const AsesiDetailModal = ({ item, onClose }) => {
  if (!item) return null

  const { asesiData, hasilAkhir } = item;
  
  return (
     <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Hasil Asesi</DialogTitle>
            <DialogDescription>
              Rekapitulasi lengkap untuk: <br />
              <span className="font-semibold text-foreground">{asesiData.nama} ({asesiData.nim})</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto pr-4">
            
            {/* Kelas & Skema */}
            <div>
              <p className="text-sm text-muted-foreground">Kelas & Skema</p>
              <p className="font-medium text-gray-900">{asesiData.kelas} / {hasilAkhir.skemaId}</p>
            </div>

            {/* Status Akhir */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Status Akhir</p>
              <StatusBadge status={hasilAkhir.statusAkhir} />
            </div>
            
            <hr />

            {/* Ujian Teori */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ujian Teori</p>
                <StatusBadge status={hasilAkhir.hasilTeori.statusAkumulasi} />
              </div>
              <div className="mt-2 space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-gray-600">Rincian Penilai per Unit:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                  {hasilAkhir.asesorTeoriDetail.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada asesor ditugaskan.</p>
                  ) : (
                    hasilAkhir.asesorTeoriDetail.map((detail, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground truncate pr-2" title={detail.unitJudul}>
                          Unit {detail.unitId}: {detail.unitJudul}
                        </span>
                        <span className="font-medium text-gray-800 flex-shrink-0">{detail.asesorNama}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Ujian Praktikum */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ujian Praktikum</p>
                <StatusBadge status={hasilAkhir.hasilPraktikum} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                Asesor: {hasilAkhir.asesorPraktikum || 'N/A'}
              </p>
            </div>
            
            {/* Unjuk Diri */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Unjuk Diri</p>
                <StatusBadge status={hasilAkhir.hasilUnjukDiri} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                Asesor: {hasilAkhir.asesorUnjukDiri || 'N/A'}
              </p>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}


export default function AdminResultsPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [rekap, setRekap] = useState([]) 
  const [skemaList, setSkemaList] = useState([]) 
  const [kelasList, setKelasList] = useState([])
  
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkema, setFilterSkema] = useState("SEMUA")
  const [filterStatus, setFilterStatus] = useState("SEMUA")
  const [filterKelas, setFilterKelas] = useState("SEMUA") 
  
  const [currentPage, setCurrentPage] = useState(1)
  
  const [detailAsesi, setDetailAsesi] = useState(null) 

  // Logic fetch data, filter, dan pagination (Tidak berubah)
  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    
    const loadData = async () => {
      try {
        setLoading(true)
        const [rekapData, skemaData] = await Promise.all([
          mockGetRekapHasilAkhir(),
          mockGetAllSkema()
        ])
        setRekap(rekapData)
        setSkemaList(skemaData)
        
        const kList = [...new Set(rekapData.map(r => r.asesiData.kelas))]
          .filter(k => k && k !== 'N/A') 
          .sort();
        setKelasList(kList);
        
      } catch (error) {
        console.error("Error loading admin results:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user, isAuthLoading, router])

  const filteredRekap = useMemo(() => {
    return rekap.filter(item => {
      const user = item.asesiData
      const hasil = item.hasilAkhir
      
      const matchSearch = searchTerm === "" ||
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nim.includes(searchTerm)
        
      const matchSkema = filterSkema === "SEMUA" || hasil.skemaId === filterSkema
      const matchStatus = filterStatus === "SEMUA" || hasil.statusAkhir === filterStatus
      const matchKelas = filterKelas === "SEMUA" || user.kelas === filterKelas 
      
      return matchSearch && matchSkema && matchStatus && matchKelas 
    })
  }, [rekap, searchTerm, filterSkema, filterStatus, filterKelas]) 

  const totalPages = Math.ceil(filteredRekap.length / ITEMS_PER_PAGE)

  const paginatedRekap = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredRekap.slice(start, end)
  }, [filteredRekap, currentPage])

  // --- Render ---

  if (loading || isAuthLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* --- PERUBAHAN 1: 'max-w-7xl mx-auto' dihapus agar layout penuh --- */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header (Tidak Berubah) */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Hasil</h1>
          <p className="text-gray-600 mt-1">Lihat hasil akhir penilaian semua asesi.</p>
        </div>

        {/* --- PERUBAHAN 2: Layout Filter diubah dari Grid ke Flex --- */}
        <Card>
          <CardContent className="pt-6">
            {/* Ganti 'grid' menjadi 'flex' dan atur item-end */}
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              
              {/* Filter Skema (diberi lebar tetap) */}
              <div className="md:w-64">
                <Label htmlFor="filter-skema">Filter Skema</Label>
                <Select value={filterSkema} onValueChange={setFilterSkema}>
                  <SelectTrigger id="filter-skema" className="mt-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">Semua Skema</SelectItem>
                    {skemaList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.judul} ({s.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Kelas (diberi lebar tetap) */}
              <div className="md:w-48">
                <Label htmlFor="filter-kelas">Filter Kelas</Label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger id="filter-kelas" className="mt-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                    {kelasList.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Status (diberi lebar tetap) */}
              <div className="md:w-56"> 
                <Label htmlFor="filter-status">Filter Status Akhir</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status" className="mt-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">Semua Status</SelectItem>
                    <SelectItem value="KOMPETEN">Kompeten</SelectItem>
                    <SelectItem value="BELUM_KOMPETEN">Belum Kompeten</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Asesi (diberi flex-1 agar memenuhi sisa ruang) */}
              <div className="flex-1 w-full"> 
                <Label htmlFor="search-asesi">Cari Asesi</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input 
                    id="search-asesi"
                    placeholder="Cari nama atau NIM..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>
            {/* --- BATAS PERUBAHAN 2 --- */}
          </CardContent>
        </Card>

        {/* ========================================================== */}
        {/* --- (TABEL UTAMA) --- */}
        {/* ========================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hasil Asesi</CardTitle>
            <CardDescription>
              Menampilkan {paginatedRekap.length} dari {filteredRekap.length} hasil.
              <br />
              Klik ikon info untuk melihat asesor yang menilai asesi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {/* (Sesuaikan lebar kolom) */}
                    <TableHead className="w-[25%]">Nama Asesi</TableHead>
                    <TableHead className="w-[10%]">Kelas</TableHead>
                    <TableHead className="w-[10%]">Skema</TableHead>
                    <TableHead className="w-[15%]">Teori</TableHead>
                    <TableHead className="w-[15%]">Praktikum</TableHead>
                    <TableHead className="w-[15%]">Unjuk Diri</TableHead>
                    <TableHead className="w-[10%]">Status Akhir</TableHead>
                    {/* (Kolom Aksi BARU) */}
                    <TableHead className="w-[10%] text-center">Info</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRekap.length === 0 ? (
                    <TableRow>
                      {/* (colSpan diubah jadi 8) */}
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRekap.map(item => {
                      const asesorTeoriUtama = item.hasilAkhir.asesorTeoriDetail[0]?.asesorNama || 'N/A';
                      const sisaAsesorTeori = item.hasilAkhir.asesorTeoriDetail.length - 1;
                      
                      return (
                        <TableRow key={item.asesiData.id} className="hover:bg-gray-50">
                          <TableCell>
                            {/* (Nama kembali jadi Teks) */}
                            <p className="font-medium text-gray-900">{item.asesiData.nama}</p>
                            <p className="text-sm text-gray-500">{item.asesiData.nim}</p>
                          </TableCell>
                          <TableCell>{item.asesiData.kelas}</TableCell>
                          <TableCell>{item.hasilAkhir.skemaId}</TableCell>
                          
                          <TableCell className="text-center">
                            <StatusBadge status={item.hasilAkhir.hasilTeori.statusAkumulasi} />
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={item.hasilAkhir.hasilPraktikum} />
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={item.hasilAkhir.hasilUnjukDiri} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.hasilAkhir.statusAkhir} />
                          </TableCell>
                          
                          {/* (Kolom Aksi BARU) */}
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              title="Lihat Detail Hasil"
                              onClick={() => setDetailAsesi(item)}
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {/* Pagination Footer (Tidak Berubah) */}
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
      
      {/* Modal (Sekarang dengan Rincian Teori) */}
      <AsesiDetailModal 
        item={detailAsesi} 
        onClose={() => setDetailAsesi(null)} 
      />
      
    </MainLayout>
  )
}
