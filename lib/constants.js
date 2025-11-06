// Konstanta dan data statis untuk LMS

// Data SKEMA_ADS_UNITS dan SKEMA_DS_UNITS
// dipindahkan ke lib/api-mock.js untuk
// inisialisasi database skema dinamis (allUnitsDb)

export const EXAM_PASS_SCORE = 75; // Kriteria kelulusan

export const MENU_ITEMS = {
  ASESI: [
    { icon: "Home", label: "Beranda", path: "/asesi/dashboard" },
    { icon: "BookOpen", label: "Pembelajaran", path: "/asesi/learning" },
    { icon: "Play", label: "Tryout", path: "/asesi/tryout" },
    { icon: "ClipboardList", label: "Ujian", path: "/asesi/exams" },
    { icon: "CheckCircle", label: "Hasil Penilaian", path: "/asesi/results" },
    { icon: "Calendar", label: "Jadwal", path: "/asesi/schedule" },
    // item "certificate" udah difilter di main-layout.jsx
    { icon: "CheckCircle", label: "Sertifikat", path: "/asesi/certificate" },
  ],
  ASESOR: [
    { icon: "Home", label: "Beranda", path: "/asesor/dashboard" },
    { icon: "CheckSquare", label: "Tugas Penilaian", path: "/asesor/grading" },
    { icon: "Users", label: "Daftar Asesi", path: "/asesor/asesi-list" },
    { icon: "Calendar", label: "Jadwal", path: "/asesor/schedule" },
  ],
  ADMIN_LSP: [
    { icon: "Home", label: "Beranda", path: "/admin/dashboard" },
    { icon: "Users", label: "Manajemen Pengguna", path: "/admin/users" },
    { icon: "BookMarked", label: "Manajemen Skema", path: "/admin/schema" },
    { icon: "User", label: "Penugasan Asesor", path: "/admin/assignments" },
    { icon: "Calendar", label: "Manajemen Linimasa", path: "/admin/timeline" },
    { icon: "CheckCircle", label: "Rekap Hasil", path: "/admin/results" },
  ],
};
