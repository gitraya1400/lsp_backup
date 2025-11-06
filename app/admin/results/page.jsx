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
import { Search, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react" 

const ITEMS_PER_PAGE = 20 // Atur jumlah asesi per halaman

// Helper component biar rapi
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


export default function AdminResultsPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [rekap, setRekap] = useState([]) // Data mentah dari API
  const [skemaList, setSkemaList] = useState([]) // Buat filter dropdown
  const [kelasList, setKelasList] = useState([])
  
  const [loading, setLoading] = useState(true)
  
  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkema, setFilterSkema] = useState("SEMUA")
  const [filterStatus, setFilterStatus] = useState("SEMUA")
  const [filterKelas, setFilterKelas] = useState("SEMUA") 
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1)
  
  // State untuk Modal
  const [detailAsesi, setDetailAsesi] = useState(null) 

  useEffect(() => {
    // Guard clause standar
    if (isAuthLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    
    // Panggil kedua API secara paralel
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
          .filter(k => k && k !== 'N/A') // Hilangkan N/A atau undefined
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

  // --- Logika Filter & Pagination ---

  const filteredRekap = useMemo(() => {
    return rekap.filter(item => {
      const user = item.asesiData
      const hasil = item.hasilAkhir
      
      const matchSearch = searchTerm === "" ||
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nim.includes(searchTerm)
        
      const matchSkema = filterSkema === "SEMUA" || hasil.skemaId === filterSkema
      const matchStatus = filterStatus === "SEMUA" || hasil.statusAkhir === filterStatus
      const matchKelas = filterKelas === "SEMUA" || user.kelas === filterKelas // <-- FILTER KELAS
      
      return matchSearch && matchSkema && matchStatus && matchKelas // <-- TAMBAHKAN DI SINI
    })
  }, [rekap, searchTerm, filterSkema, filterStatus, filterKelas]) // <-- TAMBAHKAN DI SINI

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
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Hasil</h1>
          <p className="text-gray-600 mt-1">Lihat hasil akhir penilaian semua asesi.</p>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filter Skema */}
              <div>
                <Label htmlFor="filter-skema">Filter Skema</Label>
                <Select value={filterSkema} onValueChange={setFilterSkema}>
                  <SelectTrigger id="filter-skema" className="mt-1">
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
              
              <div>
                <Label htmlFor="filter-kelas">Filter Kelas</Label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger id="filter-kelas" className="mt-1">
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
              
              {/* Filter Status */}
              <div>
                <Label htmlFor="filter-status">Filter Status Akhir</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">Semua Status</SelectItem>
                    <SelectItem value="KOMPETEN">Kompeten</SelectItem>
                    <SelectItem value="BELUM_KOMPETEN">Belum Kompeten</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Asesi */}
              <div>
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
          </CardContent>
        </Card>

        {/* Tabel Hasil */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hasil Asesi</CardTitle>
            <CardDescription>
              Menampilkan {paginatedRekap.length} dari {filteredRekap.length} hasil.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[200px]">Nama Asesi</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Skema</TableHead>
                    <TableHead className="w-[180px]">Teori</TableHead>
                    <TableHead className="w-[180px]">Praktikum</TableHead>
                    <TableHead className="w-[180px]">Unjuk Diri</TableHead>
                    <TableHead>Status Akhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRekap.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        Tidak ada data yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRekap.map(item => (
                      <TableRow key={item.asesiData.id} className="hover:bg-gray-50">
                        <TableCell>
                          <p className="font-medium text-gray-900">{item.asesiData.nama}</p>
                          <p className="text-sm text-gray-500">{item.asesiData.nim}</p>
                        </TableCell>
                        <TableCell>{item.asesiData.kelas}</TableCell>
                        <TableCell>{item.hasilAkhir.skemaId}</TableCell>
                        
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilTeori.statusAkumulasi} />
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-xs p-0 h-auto mt-1"
                            onClick={() => setDetailAsesi(item)} // <-- Buka modal
                          >
                            {item.hasilAkhir.asesorTeoriDetail.length > 1 
                              ? `${item.hasilAkhir.asesorTeoriDetail[0].asesorNama}, +${item.hasilAkhir.asesorTeoriDetail.length - 1} lainnya`
                              : item.hasilAkhir.asesorTeoriDetail[0]?.asesorNama || 'N/A'
                            }
                          </Button>
                        </TableCell>
                        
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilPraktikum} />
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={item.hasilAkhir.asesorPraktikum}>
                            {item.hasilAkhir.asesorPraktikum || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilUnjukDiri} />
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={item.hasilAkhir.asesorUnjukDiri}>
                            {item.hasilAkhir.asesorUnjukDiri || 'N/A'}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.statusAkhir} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {/* Pagination Footer */}
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
      
      <Dialog open={!!detailAsesi} onOpenChange={(open) => !open && setDetailAsesi(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Asesor Teori</DialogTitle>
            <DialogDescription>
              Daftar asesor penilai untuk: <br />
              <span className="font-semibold text-foreground">{detailAsesi?.asesiData.nama} ({detailAsesi?.asesiData.nim})</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 mt-4">
            {detailAsesi?.hasilAkhir.asesorTeoriDetail.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada asesor ditugaskan.</p>
            ) : (
              detailAsesi?.hasilAkhir.asesorTeoriDetail.map((detail, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Unit {detail.unitId}: {detail.unitJudul}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0 ml-4">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{detail.asesorNama}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailAsesi(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </MainLayout>
  )
}