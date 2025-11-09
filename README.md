# Learning Management System (LMS) LSP Polstat STIS – Frontend

Learning Management System untuk Lembaga Sertifikasi Profesi (LSP) Politeknik Statistika STIS.  
Sistem ini dirancang untuk mendukung seluruh proses pembelajaran dan sertifikasi, mencakup skema **Associate Data Scientist (ADS)** dan **Data Scientist (DS)**, mulai dari pra-asesmen hingga sertifikasi akhir.

---

## Deskripsi Proyek

Proyek ini merupakan bagian frontend dari sistem LMS LSP Polstat STIS.  
Dibangun menggunakan **Next.js** dan **React**, sistem ini menyediakan antarmuka yang modern dan responsif.
Aplikasi digunakan secara internal oleh pihak LSP, Asesor, dan Asesi dalam proses asesmen dan pelatihan berbasis kompetensi.

---

## Fitur Utama

Sistem mencakup seluruh fungsi utama proses sertifikasi, antara lain:

- **Autentikasi & Otorisasi:** Login berbasis domain `@stis.ac.id` (mocked SSO), role-based routing (Asesi, Asesor, Admin).  
- **Dashboard Dinamis:** Tampilan dan fitur disesuaikan otomatis dengan peran pengguna.  
- **Manajemen Skema & Unit Kompetensi:** CRUD skema sertifikasi dan unit.  
- **Pembelajaran Terpadu:** Akses materi video, dokumen, dan evaluasi teori serta praktikum.  
- **Penilaian & Feedback:** Penugasan asesor dan penilaian berbasis status kompetensi.  
- **Manajemen Jadwal:** Integrasi kalender kegiatan untuk Asesi dan Asesor.  
- **Analitik & Laporan:** Statistik progres dan hasil asesmen.  
- **Mock API System:** Digunakan untuk simulasi koneksi ke backend sebelum integrasi penuh.

---

## Teknologi yang Digunakan

| Layer | Teknologi |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Library UI** | React, Tailwind CSS, shadcn/ui |
| **Routing & Navigation** | next/navigation |
| **Auth Management** | Custom Auth Context (React Context API) |
| **State Management** | useState, useEffect, Context |
| **Mock Backend** | API Mock di `lib/api-mock.js` |
| **Build Tool** | pnpm |
| **Runtime** | Node.js 18+ |

---

## Struktur Folder

```plaintext
app/
├── layout.jsx                 # Root layout dengan AuthProvider
├── globals.css                # Global styling (Tailwind)
├── page.jsx                   # Home – redirect ke login/dashboard
├── login/page.jsx             # Halaman login & mock SSO
├── dashboard/page.jsx         # Router dashboard berdasar role
├── admin/                     # Modul admin LSP
│   ├── dashboard/page.jsx
│   ├── users/page.jsx
│   ├── schema/page.jsx
│   ├── assignments/page.jsx
│   ├── timeline/page.jsx
│   └── offline-exam/[sesiId]/page.jsx
├── asesi/                     # Modul peserta sertifikasi
│   ├── dashboard/page.jsx
│   ├── pra-asesmen/page.jsx
│   ├── learning/page.jsx
│   ├── tryout/page.jsx
│   ├── exams/
│   │   ├── teori/run/page.jsx
│   │   └── praktikum/upload/page.jsx
│   ├── results/page.jsx
│   ├── certificate/page.jsx
│   └── schedule/page.jsx
├── asesor/                    # Modul penilai (asesor)
│   ├── dashboard/page.jsx
│   ├── grading/[penugasanId]/page.jsx
│   ├── asesi-list/page.jsx
│   └── schedule/page.jsx
├── components/                # Reusable UI components
├── lib/                       # API mock, kontrak, dan utilitas
└── hooks/                     # Custom React hooks
```

---

## Setup & Instalasi

### Prasyarat

- Node.js versi 18 atau lebih baru  
- pnpm

### Instalasi

```bash
pnpm install
```

### Environment Variables

Buat file `.env.local` di root proyek dan tambahkan konfigurasi berikut:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Jalankan Server Development

```bash
pnpm dev
```

Buka **http://localhost:3000** untuk melihat aplikasi berjalan.

---

## Akun Demo

Gunakan **form login manual** untuk mencoba akun berikut (tersedia di `lib/api-mock.js`):

| Role | Email | Nama (Password) |
|------|--------|------------------|
| Asesi (ADS) | `222313206@stis.ac.id` | Meldiro Cruz |
| Asesi (DS) | `222313190@stis.ac.id` | Raya Kilwoouw |
| Asesor | `asesor.all1@stis.ac.id` | Prof. Bimbingan |
| Admin LSP | `admin@stis.ac.id` | Admin LSP Polstat |

> Tombol "Masuk dengan Akun STIS" adalah mock SSO yang akan login sebagai akun dummy `Nadia Nisrina (222310001@stis.ac.id)` untuk simulasi pendaftaran awal.

---

## Panduan Kolaborasi dengan Backend (Express.js)

Saat ini frontend masih menggunakan **Mock API** di `lib/api-mock.js`.  
Untuk kolaborasi dengan backend (Express.js), backend developer dapat mengganti isi fungsi mock dengan pemanggilan API sesungguhnya.

### Contoh:

**Sebelum (Mock):**
```javascript
export async function mockGetUnitsForSkema(skemaId) {
  await delay(400);
  const units = allUnitsDb.get(skemaId) || [];
  return units;
}
```

**Sesudah (Real API):**
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUnitsForSkema(skemaId) {
  const res = await fetch(`${API_URL}/asesi/units/${skemaId}`);
  if (!res.ok) throw new Error("Gagal mengambil data unit");
  const result = await res.json();
  return result.data;
}
```

### Catatan:
- Struktur JSON wajib mengikuti kontrak di `lib/api-contract.jsx`  
- Jika struktur tetap konsisten, frontend tidak perlu diubah saat backend diintegrasikan  

---

## Troubleshooting

| Masalah | Solusi |
|----------|---------|
| Mock API tidak merespons | Periksa penggunaan `async/await` |
| Login looping | Hapus `authUser` di LocalStorage |
| Styling error | Jalankan `rm -rf .next && pnpm dev` ulang |
| 404 saat routing | Pastikan struktur folder sesuai App Router |

---

## Status Proyek

- Tahap: **Draft – Frontend Stable (Mock API aktif)**  
- UI: 100% responsif (desktop, tablet, mobile)  
- Integrasi backend: Dalam proses  
- Testing: Unit & E2E belum lengkap  
- Target Handoff: Q4 2025

---

## Lisensi

Proyek internal **LSP Polstat STIS**.  
Tidak untuk distribusi publik atau penggunaan di luar institusi tanpa izin tertulis.

---

**Dikembangkan oleh Tim LMS LSP Polstat STIS – 2025**
