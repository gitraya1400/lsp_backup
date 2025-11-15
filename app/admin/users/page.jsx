// frontend-lms-v3-master/app/admin/users/page.jsx

"use client"

// 1. Tambahkan useMemo
import React, { useEffect, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
// 2. Tambahkan CardFooter
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  mockGetAllUsers,
  mockGetAsesiUsers,
  mockGetAsesorUsers,
  mockGetAdminUsers,
  mockUpdateUserRole,
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
// 3. Tambahkan ikon Paginasi
import { Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils" 

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


export default function UsersPage() {
  const [allUsers, setAllUsers] = useState([])
  const [asesiUsers, setAsesiUsers] = useState([])
  const [asesorUsers, setAsesorUsers] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("asesi")
  
  const [filterKelas, setFilterKelas] = useState("SEMUA")
  const [filterSkema, setFilterSkema] = useState("SEMUA")
  
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 6. Tambahkan state halaman untuk setiap tab
  const [currentPageAsesi, setCurrentPageAsesi] = useState(1);
  const [currentPageAsesor, setCurrentPageAsesor] = useState(1);
  const [currentPageAdmin, setCurrentPageAdmin] = useState(1);

  useEffect(() => {
    loadUsers()
  }, [])

  // 7. Tambahkan useEffect untuk reset halaman saat filter/tab berubah
  useEffect(() => {
    setCurrentPageAsesi(1);
  }, [searchTerm, filterKelas, activeTab]);

  useEffect(() => {
    setCurrentPageAsesor(1);
  }, [searchTerm, filterSkema, activeTab]);
  
  useEffect(() => {
    setCurrentPageAdmin(1);
  }, [searchTerm, activeTab]);
  // ---

  const loadUsers = async () => {
    try {
      setLoading(true) 
      const [all, asesi, asesor, admin] = await Promise.all([
        mockGetAllUsers(),
        mockGetAsesiUsers(),
        mockGetAsesorUsers(),
        mockGetAdminUsers(),
      ])
      setAllUsers(all)
      setAsesiUsers(asesi)
      setAsesorUsers(asesor)
      setAdminUsers(admin)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const kelasList = useMemo(() => {
    const kelasSet = new Set(asesiUsers.map((a) => a.kelas).filter(Boolean))
    return Array.from(kelasSet).sort()
  }, [asesiUsers])
  
  const handleEditRole = (user) => {
    if (user.role === "ASESI") {
      alert("Role Asesi tidak dapat diubah. Role ini diatur otomatis oleh sistem.")
      return
    }
    setSelectedUser(user)
    setNewRole(user.role)
    setIsDialogOpen(true)
  }

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return
    setIsSaving(true)
    try {
      await mockUpdateUserRole(selectedUser.id, newRole)
      await loadUsers() 
      setIsDialogOpen(false)
      setSelectedUser(null)
      setNewRole("")
    } catch (error) {
      console.error("[v0] Error updating role:", error)
      alert(`Gagal mengubah role: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const getFilteredUsers = (users, tab) => {
    return users.filter(
      (user) => {
        const matchSearch =
          user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.nim && user.nim.includes(searchTerm)) ||
          (user.nip && user.nip.includes(searchTerm))
        
        let matchKelas = true
        if (tab === "asesi") {
          matchKelas = filterKelas === "SEMUA" || user.kelas === filterKelas
        }
        
        let matchSkema = true
        if (tab === "asesor") {
          matchSkema = filterSkema === "SEMUA" || (user.skemaKeahlian && user.skemaKeahlian.includes(filterSkema))
        }
        
        return matchSearch && matchKelas && matchSkema
      }
    )
  }
  
  // 8. Logika Filter dan Paginasi dipisahkan
  const filteredAsesi = useMemo(() => getFilteredUsers(asesiUsers, 'asesi'), [asesiUsers, searchTerm, filterKelas]);
  const filteredAsesor = useMemo(() => getFilteredUsers(asesorUsers, 'asesor'), [asesorUsers, searchTerm, filterSkema]);
  const filteredAdmin = useMemo(() => getFilteredUsers(adminUsers, 'admin'), [adminUsers, searchTerm]);

  const { paginatedAsesi, totalPagesAsesi } = useMemo(() => {
    const totalPages = Math.ceil(filteredAsesi.length / ITEMS_PER_PAGE);
    const paginated = filteredAsesi.slice(
      (currentPageAsesi - 1) * ITEMS_PER_PAGE,
      currentPageAsesi * ITEMS_PER_PAGE
    );
    return { paginatedAsesi: paginated, totalPagesAsesi: totalPages };
  }, [filteredAsesi, currentPageAsesi]);

  const { paginatedAsesor, totalPagesAsesor } = useMemo(() => {
    const totalPages = Math.ceil(filteredAsesor.length / ITEMS_PER_PAGE);
    const paginated = filteredAsesor.slice(
      (currentPageAsesor - 1) * ITEMS_PER_PAGE,
      currentPageAsesor * ITEMS_PER_PAGE
    );
    return { paginatedAsesor: paginated, totalPagesAsesor: totalPages };
  }, [filteredAsesor, currentPageAsesor]);

  const { paginatedAdmin, totalPagesAdmin } = useMemo(() => {
    const totalPages = Math.ceil(filteredAdmin.length / ITEMS_PER_PAGE);
    const paginated = filteredAdmin.slice(
      (currentPageAdmin - 1) * ITEMS_PER_PAGE,
      currentPageAdmin * ITEMS_PER_PAGE
    );
    return { paginatedAdmin: paginated, totalPagesAdmin: totalPages };
  }, [filteredAdmin, currentPageAdmin]);


  const getRoleBadge = (role) => {
     switch (role) {
      case "ADMIN_LSP":
        return "bg-purple-100 text-purple-800"
      case "ASESOR":
        return "bg-green-100 text-green-800"
      case "ASESI":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 9. Komponen UserTable diperbarui (Alignment Rata Kiri & Paginasi)
  const UserTable = ({ users, isLoading, tab, fullFilteredListLength }) => {
    const colSpan = tab === 'admin' ? 5 : 6; 

    if (isLoading) {
      return (
        <div className="space-y-2 p-4"> {/* Tambahkan padding jika loading */}
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )
    }

    if (fullFilteredListLength === 0) { // Gunakan prop baru
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada pengguna yang ditemukan</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto"> {/* Hapus border, karena Card sudah ada */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            {/* --- (TASK 3: Rata Kiri) --- */}
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Nama</th>
              {/* === PERUBAHAN UNTUK GOAL 2 (NIM/NIP) === */}
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                {tab === 'asesi' ? 'NIM' : 'NIP'}
              </th>
              {/* === BATAS PERUBAHAN === */}
              {tab === 'asesi' && (
                <th className="px-4 py-3 font-semibold text-gray-700 text-left">Kelas</th>
              )}
              {tab === 'asesor' && (
                <th className="px-4 py-3 font-semibold text-gray-700 text-left">Skema Keahlian</th>
              )}
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          {/* --- (TASK 3: Rata Kiri) --- */}
          <tbody className="divide-y text-left">
            {users.map((user) => ( // Gunakan `users` (list paginasi)
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{user.nama}</td>
                <td className="px-4 py-3 text-gray-600">{user.nim || user.nip || "-"}</td>
                {tab === 'asesi' && (
                  <td className="px-4 py-3 text-gray-600">{user.kelas || "-"}</td>
                )}
                {tab === 'asesor' && (
                  <td className="px-4 py-3 text-gray-600">
                    {user.skemaKeahlian ? user.skemaKeahlian.join(', ') : "-"}
                  </td>
                )}
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                {/* --- (TASK 3: Rata Tengah) --- */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                {/* --- (TASK 3: Rata Tengah) --- */}
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRole(user)}
                    className="text-xs"
                    disabled={user.role === "ASESI"}
                  >
                    Ubah Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const stats = [
    { label: "Total Asesi", value: asesiUsers.length, tab: "asesi" },
    { label: "Total Asesor", value: asesorUsers.length, tab: "asesor" },
    { label: "Total Admin", value: adminUsers.length, tab: "admin" },
  ]

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola akun dan peran pengguna (Asesor & Admin) dalam sistem LMS</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Card Baru Pembungkus Kontrol */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              
              {/* 1. Alert Catatan */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                      <strong>Catatan:</strong> Role <strong>Asesi</strong> diatur otomatis dari sistem Sipadu saat login pertama kali. Anda tidak dapat mengubah role Asesi. Anda hanya dapat mempromosikan Dosen/Staff (yang defaultnya Asesor) menjadi role <strong>Admin</strong>.
                  </p>
              </div>

              {/* 2. TabsList Statistik */}
              <TabsList className="w-full grid-cols-3 bg-gray-100 rounded-lg">
                {stats.map(stat => (
                    <TabsTrigger key={stat.tab} value={stat.tab} className="py-3">
                        {stat.label}
                        <span className={` mt-2 mb-2 ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === stat.tab ? 'mt-2 bg-white text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                            {loading ? '...' : stat.value}
                        </span>
                    </TabsTrigger>
                ))}
              </TabsList>
              
              {/* 3. Filter Area */}
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Kolom 1: Filter Kelas (Hanya tampil di tab Asesi) */}
                {activeTab === 'asesi' && (
                  <div className="md:w-48"> {/* Lebar tetap untuk filter */}
                    <Label htmlFor="filter-kelas">Filter Kelas</Label>
                    <Select value={filterKelas} onValueChange={setFilterKelas}>
                      <SelectTrigger id="filter-kelas" className="mt-1.5 h-10">
                        <SelectValue placeholder="Semua Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEMUA">-- Semua Kelas --</SelectItem>
                        {kelasList.map((kelas) => (
                          <SelectItem key={kelas} value={kelas}>
                            {kelas}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Kolom 1: Filter Skema (Hanya tampil di tab Asesor) */}
                {activeTab === 'asesor' && (
                  <div className="md:w-48"> {/* Lebar tetap untuk filter */}
                    <Label htmlFor="filter-skema">Filter Skema</Label>
                    <Select value={filterSkema} onValueChange={setFilterSkema}>
                      <SelectTrigger id="filter-skema" className="mt-1.5 h-10">
                        <SelectValue placeholder="Semua Skema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEMUA">-- Semua Skema --</SelectItem>
                        <SelectItem value="ADS">ADS</SelectItem>
                        <SelectItem value="DS">DS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Kolom 2: Search Bar */}
                <div className="flex-1">
                  <Label htmlFor="search-user">Cari Pengguna</Label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                    <Input
                      id="search-user"
                      placeholder="Cari nama, email, NIM, atau NIP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10" // Tinggi sama (h-10)
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Pembaruan TabsContent (Task 2: Paginasi) */}
          <TabsContent value="asesi" className="mt-4">
            <Card>
              {/* === PERUBAHAN UNTUK GOAL 1 (Counter) === */}
              <CardHeader>
                <CardTitle>Daftar Asesi</CardTitle>
                <CardDescription>
                  Menampilkan {paginatedAsesi.length} dari {filteredAsesi.length} total asesi.
                </CardDescription>
              </CardHeader>
              {/* === BATAS PERUBAHAN === */}
              <UserTable 
                users={paginatedAsesi} 
                isLoading={loading} 
                tab="asesi" 
                fullFilteredListLength={filteredAsesi.length} 
              />
              <PaginationFooter 
                totalPages={totalPagesAsesi}
                currentPage={currentPageAsesi}
                setCurrentPage={setCurrentPageAsesi}
              />
            </Card>
          </TabsContent>
          <TabsContent value="asesor" className="mt-4">
            <Card>
              {/* === PERUBAHAN UNTUK GOAL 1 (Counter) === */}
              <CardHeader>
                <CardTitle>Daftar Asesor</CardTitle>
                <CardDescription>
                  Menampilkan {paginatedAsesor.length} dari {filteredAsesor.length} total asesor.
                </CardDescription>
              </CardHeader>
              {/* === BATAS PERUBAHAN === */}
              <UserTable 
                users={paginatedAsesor} 
                isLoading={loading} 
                tab="asesor" 
                fullFilteredListLength={filteredAsesor.length}
              />
              <PaginationFooter 
                totalPages={totalPagesAsesor}
                currentPage={currentPageAsesor}
                setCurrentPage={setCurrentPageAsesor}
              />
            </Card>
          </TabsContent>
           <TabsContent value="admin" className="mt-4">
            <Card>
              {/* === PERUBAHAN UNTUK GOAL 1 (Counter) === */}
              <CardHeader>
                <CardTitle>Daftar Admin</CardTitle>
                <CardDescription>
                  Menampilkan {paginatedAdmin.length} dari {filteredAdmin.length} total admin.
                </CardDescription>
              </CardHeader>
              {/* === BATAS PERUBAHAN === */}
              <UserTable 
                users={paginatedAdmin} 
                isLoading={loading} 
                tab="admin" 
                fullFilteredListLength={filteredAdmin.length}
              />
              <PaginationFooter 
                totalPages={totalPagesAdmin}
                currentPage={currentPageAdmin}
                setCurrentPage={setCurrentPageAdmin}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Role Dialog (Tidak Berubah) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Ubah Role Pengguna</DialogTitle>
            <DialogDescription className="text-sm">
              Atur ulang peran untuk {selectedUser?.nama}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Role Baru</label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Pilih role baru..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASESOR">Asesor (Penilai)</SelectItem>
                    <SelectItem value="ADMIN_LSP">Admin LSP (Administrator)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Role saat ini: <span className="font-medium">{selectedUser.role}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!newRole || isSaving || newRole === selectedUser?.role}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}