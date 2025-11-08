// File: frontend-lms-v1/lib/api-mock.js
// (Sudah diperbaiki)

const SKEMA_ADS_UNITS = [
  { nomorUnit: 1, kodeUnit: "J.62DMI00.004.1", judul: "Mengumpulkan data", durasiTeori: 15 },
  { nomorUnit: 2, kodeUnit: "J.62DMI00.005.1", judul: "Menelaah Data", durasiTeori: 20 },
  { nomorUnit: 3, kodeUnit: "J.62DMI00.006.1", judul: "Memvalidasi Data", durasiTeori: 20 },
  { nomorUnit: 4, kodeUnit: "J.62DMI00.007.1", judul: "Menentukan Objek Data", durasiTeori: 20 },
  { nomorUnit: 5, kodeUnit: "J.62DMI00.008.1", judul: "Membersihkan Data", durasiTeori: 15 },
  { nomorUnit: 6, kodeUnit: "J.62DMI00.009.1", judul: "Mengkonstruksi Data", durasiTeori: 25 },
  { nomorUnit: 7, kodeUnit: "J.62DMI00.010.1", judul: "Menentukan Label Data", durasiTeori: 25 },
  { nomorUnit: 8, kodeUnit: "J.62DMI00.013.1", judul: "Membangun Model", durasiTeori: 15 },
  { nomorUnit: 9, kodeUnit: "J.62DMI00.014.1", judul: "Mengevaluasi Hasil Pemodelan", durasiTeori: 30 },
];

const SKEMA_DS_UNITS = [
  { nomorUnit: 1, kodeUnit: "J.62DMI00.001.1", judul: "Menentukan Objektif Bisnis", durasiTeori: 20 },
  { nomorUnit: 2, kodeUnit: "J.62DMI00.002.1", judul: "Menentukan Tujuan Teknis Data Science", durasiTeori: 25 },
  { nomorUnit: 3, kodeUnit: "J.62DMI00.005.1", judul: "Menelaah Data", durasiTeori: 25 },
  { nomorUnit: 4, kodeUnit: "J.62DMI00.006.1", judul: "Memvalidasi Data", durasiTeori: 20 },
  { nomorUnit: 5, kodeUnit: "J.62DMI00.007.1", judul: "Menentukan Objek Data", durasiTeori: 15 },
  { nomorUnit: 6, kodeUnit: "J.62DMI00.008.1", judul: "Membersihkan Data", durasiTeori: 30 },
  { nomorUnit: 7, kodeUnit: "J.62DMI00.009.1", judul: "Mengkonstruksi Data", durasiTeori: 30 },
  { nomorUnit: 8, kodeUnit: "J.62DMI00.012.1", judul: "Membangun Skenario Model", durasiTeori: 25 },
  { nomorUnit: 9, kodeUnit: "J.62DMI00.013.1", judul: "Membangun Model", durasiTeori: 25 },
  { nomorUnit: 10, kodeUnit: "J.62DMI00.014.1", judul: "Mengevaluasi Hasil Pemodelan", durasiTeori: 20 },
  { nomorUnit: 11, kodeUnit: "J.62DMI00.015.1", judul: "Melakukan Proses Review Pemodelan", durasiTeori: 35 },
];

// "Mock Database" untuk Skema dan Unit
const allSkemaDb = new Map();
allSkemaDb.set("ADS", {
  id: "ADS",
  judul: "Associate Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D3 Statistika.",
  totalUnit: SKEMA_ADS_UNITS.length,
});
allSkemaDb.set("DS", {
  id: "DS",
  judul: "Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D4 Statistika.",
  totalUnit: SKEMA_DS_UNITS.length,
});

const allUnitsDb = new Map();
// Inisialisasi data unit untuk ADS
allUnitsDb.set(
  "ADS",
  SKEMA_ADS_UNITS.map((unit, idx) => ({
    id: `ADS-${unit.nomorUnit}`,
    skemaId: "ADS",
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit, // Menambahkan kodeUnit
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: 3, // mock count
    soalCount: 8, // mock count
    durasiTeori: unit.durasiTeori || 15,
    urutan: idx + 1,
  }))
);

// Inisialisasi data unit untuk DS
allUnitsDb.set(
  "DS",
  SKEMA_DS_UNITS.map((unit, idx) => ({
    id: `DS-${unit.nomorUnit}`,
    skemaId: "DS",
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit, // Menambahkan kodeUnit
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: 3, // mock count
    soalCount: 8, // mock count
    durasiTeori: unit.durasiTeori || 15,
    urutan: idx + 1,
  }))
);

// DB Soal (harus didefinisikan setelah allUnitsDb)
const allSoalDb = new Map();
// Loop-nya sekarang pake data dinamis dari allUnitsDb
allUnitsDb.get("ADS").forEach((unit) => {
  const unitId = unit.id; // "ADS-1"
  allSoalDb.set(unitId, [
    { id: `${unitId}-tryout-1`, unitId, tipeSoal: "TRYOUT", tipeJawaban: "ESAI", teks: `[Tryout ADS] Jelaskan konsep utama dari ${unit.judul}?`, urutan: 1 },
    { id: `${unitId}-teori-1`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori ADS] Apa definisi dan aplikasi dari ${unit.judul}?`, kunciJawaban: "definisi|aplikasi", urutan: 1 },
    { id: `${unitId}-teori-2`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori ADS] Bagaimana ${unit.judul} berkontribusi pada proses bisnis?`, kunciJawaban: "bisnis|kontribusi", urutan: 2 },
    { id: `${unitId}-teori-3`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori ADS] Sebutkan 2 tantangan utama dalam implementasi ${unit.judul}?`, kunciJawaban: "tantangan", urutan: 3 },
    {
      id: `${unitId}-praktikum-1`,
      unitId,
      tipeSoal: "UJIAN_PRAKTIKUM",
      tipeJawaban: "UPLOAD_FILE",
      teks: `Kerjakan studi kasus praktikum ADS terkait ${unit.judul}.`,
      fileTemplateSoal: `https://example.com/soal-praktikum-${unitId}.zip`,
      urutan: 1,
    },
  ]);
});
allUnitsDb.get("DS").forEach((unit) => {
  const unitId = unit.id; // "DS-1"
  allSoalDb.set(unitId, [
    { id: `${unitId}-tryout-1`, unitId, tipeSoal: "TRYOUT", tipeJawaban: "ESAI", teks: `[Tryout DS] Jelaskan konsep utama dari ${unit.judul}?`, urutan: 1 },
    { id: `${unitId}-teori-1`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori DS] Apa perbedaan ${unit.judul} dengan metode konvensional?`, kunciJawaban: "definisi|aplikasi", urutan: 1 },
    { id: `${unitId}-teori-2`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori DS] Bagaimana ${unit.judul} berkontribusi pada proses bisnis skala besar?`, kunciJawaban: "bisnis|kontribusi", urutan: 2 },
    { id: `${unitId}-teori-3`, unitId, tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI", teks: `[Ujian Teori DS] Sebutkan 2 tantangan utama dalam implementasi ${unit.judul}?`, kunciJawaban: "tantangan", urutan: 3 },
    {
      id: `${unitId}-praktikum-1`,
      unitId,
      tipeSoal: "UJIAN_PRAKTIKUM",
      tipeJawaban: "UPLOAD_FILE",
      teks: `Kerjakan studi kasus praktikum DS terkait ${unit.judul}.`,
      fileTemplateSoal: `https://example.com/soal-praktikum-${unitId}.zip`,
      urutan: 1,
    },
  ]);
});

// ==================== DATA GENERATORS ====================

const firstNames = ["Nadia", "Rezky", "Rani", "Galang", "Nailatur", "Meldiro", "Naila", "Budi", "Siti", "Ahmad", "Dewi", "Eko", "Fitri", "Hadi", "Indah", "Joko"];
const lastNames = ["Nisrina", "Kilwouw", "Kusumawati", "Nugroho", "Rajaa", "Ferreira", "Hanifa", "Santoso", "Nurhaliza", "Ridho", "Lestari", "Prasetyo", "Handayani", "Wijaya", "Permata", "Susanto"];
const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

function generateAsesiData() {
  const asesiList = [];

  const dsKelasList = ["4SI1", "4SI2", "4SD1", "4SE1", "4SK1"]; // D4 (DS)
  const adsKelasList = ["3SD1", "3SD2", "3SD3"]; // D3 (ADS)

  // Generate 350 Asesi DS (D4)
  for (let i = 1; i <= 350; i++) {
    const nim = String(222310000 + i);
    let kelas = dsKelasList[i % dsKelasList.length];
    asesiList.push({
      id: `asesi-ds-${i}`,
      email: `${nim}@stis.ac.id`,
      nama: getRandomName(),
      role: "ASESI",
      nim,
      skemaId: "DS",
      kelas: kelas,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Generate 150 Asesi ADS (D3)
  for (let i = 1; i <= 150; i++) {
    const nim = String(222350000 + i);
    let kelas = adsKelasList[i % adsKelasList.length];
    asesiList.push({
      id: `asesi-ads-${i}`,
      email: `${nim}@stis.ac.id`,
      nama: getRandomName(),
      role: "ASESI",
      nim,
      skemaId: "ADS",
      kelas: kelas,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return asesiList;
}

function generateAsesorData() {
  const asesorList = [];
  const dosenNames = ["Dr. Ernawati P", "Nori Wilantika", "Dr. Erni T", "Dr. Novi H", "Ibnu Santoso", "Rini Rahani", "Budi Yuniarto", "Sukim", "Winih Budiarti", "Sri Herwanto"];
  for (let i = 1; i <= 10; i++) {
    const nama = `Asesor DS ${i}`;
    asesorList.push({ id: `asesor-ds-${i}`, email: `asesor.ds${i}@stis.ac.id`, nama: dosenNames[i - 1] || nama, role: "ASESOR", nip: String(198001010000000000 + i), skemaKeahlian: ["DS"], createdAt: new Date(), updatedAt: new Date() });
  }
  for (let i = 1; i <= 10; i++) {
    const nama = `Asesor ADS ${i}`;
    asesorList.push({ id: `asesor-ads-${i}`, email: `asesor.ads${i}@stis.ac.id`, nama: dosenNames[i] || nama, role: "ASESOR", nip: String(198001010000000100 + i), skemaKeahlian: ["ADS"], createdAt: new Date(), updatedAt: new Date() });
  }
  asesorList.push({ id: `asesor-all-1`, email: `asesor.all1@stis.ac.id`, nama: "Prof. Bimbingan", role: "ASESOR", nip: String(197001010000000100), skemaKeahlian: ["ADS", "DS"], createdAt: new Date(), updatedAt: new Date() });
  return asesorList;
}

const adminUsers = [
  { id: "admin-1", email: "admin@stis.ac.id", nama: "Admin LSP Polstat", role: "ADMIN_LSP", nip: "199001011990001001", createdAt: new Date(), updatedAt: new Date() },
  { id: "admin-2", email: "admin2@stis.ac.id", nama: "Super Admin", role: "ADMIN_LSP", nip: "199101011991001001", createdAt: new Date(), updatedAt: new Date() },
];

// daftar akun demo Asesi — tambah / edit
const DEMO_AKUN_ASESI = [
  {
    id: "asesi-dummy-1",
    email: "222313206@stis.ac.id",
    nama: "Meldiro Cruz",
    role: "ASESI",
    nim: "222313206",      // format NIM agar terdeteksi sebagai ASESI
    skemaId: "ADS",        // ubah ke "DS" jika mau akun DS
    kelas: "4SI1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
      id: "asesi-dummy-2",
    email: "222313190@stis.ac.id",
    nama: "Raya Kilwoouw",
    role: "ASESI",
    nim: "222313190",      // format NIM agar terdeteksi sebagai ASESI
    skemaId: "DS",        // ubah ke "DS" jika mau akun DS
    kelas: "4SI1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const asesiUsers = [...DEMO_AKUN_ASESI, ...generateAsesiData()];
const asesorUsers = generateAsesorData();
const allUsers = [...adminUsers, ...asesiUsers, ...asesorUsers];

const MOCK_DB_PROGRESS_KEY = "mockProgressMap";

function getProgressMapFromStorage() {
  // Cek apakah kita ada di browser (punya 'window')
  if (typeof window === 'undefined') {
    return new Map();
  }
  
  const data = localStorage.getItem(MOCK_DB_PROGRESS_KEY);
  if (data) {
    try {
      const arr = JSON.parse(data);
      // Konversi data dari localStorage kembali ke Map
      const map = new Map(arr);
      
      // Penting: Ubah Array (dari JSON) kembali menjadi Set
      map.forEach((value) => {
        value.completedUnitIds = new Set(value.completedUnitIds);
        value.viewedMateriIds = new Set(value.viewedMateriIds || []);
      });
      return map;
    } catch (e) {
      console.error("Gagal memuat mock DB progress:", e);
      return new Map();
    }
  }
  return new Map();
}

function saveProgressMapToStorage(map) {
  if (typeof window === 'undefined') return;

  // Konversi Map ke [key, value] array agar bisa di-JSON
  const arr = Array.from(map.entries()).map(([key, value]) => {
    // Penting: Ubah Set jadi Array agar bisa disimpan di JSON
    return [key, {
      ...value,
      completedUnitIds: Array.from(value.completedUnitIds),
      viewedMateriIds: Array.from(value.viewedMateriIds || new Set()),
    }];
  });
  
  localStorage.setItem(MOCK_DB_PROGRESS_KEY, JSON.stringify(arr));
}

let progressMap = getProgressMapFromStorage();

function calculateProgress(asesiId) {
  const progress = progressMap.get(asesiId); 
  if (!progress) return 0;
  const unitsInSkema = allUnitsDb.get(progress.skemaId) || [];
  if (unitsInSkema.length === 0) return 0;
  return Math.round((progress.completedUnitIds.size / unitsInSkema.length) * 100);
}


const penugasanMap = new Map();
function generatePenugasanData() {
  let penugasanId = 0;
  const selectedAsesi = asesiUsers.slice(0, 50);

  selectedAsesi.forEach((asesi) => {
    const skema = asesi.skemaId;
    const units = allUnitsDb.get(skema) || [];
    const asesorList = asesorUsers.filter((a) => a.skemaKeahlian.includes(skema));

    // 1. Buat TUGAS TEORI (per unit)
    units.forEach((unit) => {
      const asesor = asesorList[Math.floor(Math.random() * asesorList.length)];
      const id = `penugasan-${penugasanId++}`;
      penugasanMap.set(id, {
        id: id,
        asesorId: asesor.id,
        asesiId: asesi.id,
        asesiNama: asesi.nama,
        skemaId: skema,
        unitId: unit.nomorUnit,
        unitJudul: unit.judul,
        tipe: "TEORI",
        statusPenilaian: "BELUM_DINILAI",
        nilai: null,
        feedback: null,
        nilaiKompetensi: "BELUM_DINILAI",
      });
    });

    // 2. Buat 1 TUGAS PRAKTIKUM (per asesi)
    const asesorPraktikum = asesorList[Math.floor(Math.random() * asesorList.length)];
    const idPraktikum = `penugasan-${penugasanId++}`;
    penugasanMap.set(idPraktikum, {
      id: idPraktikum,
      asesorId: asesorPraktikum.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      skemaId: skema,
      unitId: null,
      unitJudul: "Studi Kasus Praktikum (Gabungan)",
      tipe: "PRAKTIKUM",
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
    });

    // 3. Buat 1 TUGAS UNJUK DIRI (per asesi)
    const asesorUnjukDiri = asesorList[Math.floor(Math.random() * asesorList.length)];
    const idUnjukDiri = `penugasan-${penugasanId++}`;
    penugasanMap.set(idUnjukDiri, {
      id: idUnjukDiri,
      asesorId: asesorUnjukDiri.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      skemaId: skema,
      unitId: null,
      unitJudul: "Presentasi Unjuk Diri (Gabungan)",
      tipe: "UNJUK_DIRI",
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
    });
  });
}
generatePenugasanData();

const sesiUjianOfflineDb = new Map();
const plottingDb = new Map();

const linimasaDb = new Map(); // <-- DATABASE BARU UNTUK LINIMASA
const todayForLinimasa = new Date();
const mockLinimasaEvents = [
  {
    id: "lin-1",
    skemaId: "ADS",
    judul: "Sosialisasi & Pembukaan Sertifikasi ADS",
    deskripsi: "Penjelasan detail tentang ujian kompetensi ADS.",
    tanggal: new Date(todayForLinimasa.getTime() + 2 * 24 * 60 * 60 * 1000),
    waktu: "13:00",
    urlZoom: "https://zoom.us/j/12345678901",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-ads-1", // <-- TAMBAHKAN INI
  },
  {
    id: "lin-2",
    skemaId: "DS",
    judul: "Sosialisasi & Pembukaan Sertifikasi DS",
    deskripsi: "Penjelasan detail tentang ujian kompetensi DS.",
    tanggal: new Date(todayForLinimasa.getTime() + 2 * 24 * 60 * 60 * 1000),
    waktu: "15:00",
    urlZoom: "https://zoom.us/j/12345678902",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-ds-1", // <-- TAMBAHKAN INI
  },
  {
    id: "lin-3",
    skemaId: "UMUM", // Ganti skemaId jadi UMUM
    judul: "Sesi Q&A Pembelajaran (Semua Skema)",
    deskripsi: "Tanya jawab dengan asesor terkait materi.",
    tanggal: new Date(todayForLinimasa.getTime() + 7 * 24 * 60 * 60 * 1000),
    waktu: "14:00",
    urlZoom: "https://zoom.us/j/12345678903",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-all-1", // <-- TAMBAHKAN INI
  },
];
// Masukkan data awal ke DB
mockLinimasaEvents.forEach(event => linimasaDb.set(event.id, event));

function generateSesiUjianData() {
  const today = new Date();
  
  // Sesi Unjuk Diri (Non-dummy)
  const sesiDS_UnjukDiri = {
    id: "sesi-ds-unjukdiri-1",
    skemaId: "DS",
    tanggal: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 hari lagi
    waktu: "09:00",
    tipeUjian: "UNJUK_DIRI",
    ruangan: "Auditorium STIS",
    kapasitas: 50,
    durasi: 30, // 30 menit per asesi (misalnya)
  };
  sesiUjianOfflineDb.set(sesiDS_UnjukDiri.id, sesiDS_UnjukDiri);
  plottingDb.set(sesiDS_UnjukDiri.id, ["asesi-ds-1", "asesi-ds-2"]);

  // --- (INI BAGIAN UNTUK DUMMY) ---
  
  // Sesi Teori ADS (Dummy 1)
  const sesiADS_Teori = {
    id: "sesi-ads-teori-1",
    skemaId: "ADS",
    tanggal: new Date(today.getTime()), // HARI INI
    waktu: "09:00", // Mulai jam 9 pagi
    tipeUjian: "TEORI",
    ruangan: "Ruang 301 (ADS)",
    kapasitas: 30,
    durasi: 185, // Total durasi 9 unit ADS
  };
  sesiUjianOfflineDb.set(sesiADS_Teori.id, sesiADS_Teori);
  plottingDb.set(sesiADS_Teori.id, ["asesi-dummy-1"]); // Plot dummy 1

  // Sesi Teori DS (Dummy 2)
  const sesiDS_Teori = {
    id: "sesi-ds-teori-1",
    skemaId: "DS",
    tanggal: new Date(today.getTime()), // HARI INI
    waktu: "09:00", // Mulai jam 9 pagi
    tipeUjian: "TEORI",
    ruangan: "Ruang 302 (DS)",
    kapasitas: 30,
    durasi: 270, // Total durasi 11 unit DS
  };
  sesiUjianOfflineDb.set(sesiDS_Teori.id, sesiDS_Teori);
  plottingDb.set(sesiDS_Teori.id, ["asesi-dummy-2"]); // Plot dummy 2
}
generateSesiUjianData();

// ==================== MOCK FUNCTIONS ====================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
  Simulasi GET /api/admin/skema (Mengambil daftar semua skema yang ada (misal: "ADS" dan "DS")).
  Ini adalah fungsi GET dasar. 
  Fungsinya hanya membaca data dari allSkemaDb (database palsu kita) dan mengembalikannya. 
  Ini dipakai untuk mengisi Tab di halaman manajemen skema dan dropdown di halaman lain.
*/
export async function mockGetAllSkema() {
  await delay(300);
  return Array.from(allSkemaDb.values());
}

/*
  Simulasi POST /api/admin/skema. (Membuat skema baru.)
  Mensimulasikan Validasi Backend: Dia mengecek if (!skemaData.id || !skemaData.judul),
  Mensimulasikan Error: Jika ID sudah ada (allSkemaDb.has(cleanId)), dia melempar new Error().
  Mutasi Data: Jika sukses, dia mengubah database palsu (allSkemaDb.set(...) dan allUnitsDb.set(...))
*/
export async function mockCreateSkema(skemaData) {
  await delay(500);
  if (!skemaData.id || !skemaData.judul) {
    throw new Error("ID Skema dan Judul Skema wajib diisi.");
  }
  const cleanId = skemaData.id.toUpperCase().replace(/\s+/g, "_");

  if (allSkemaDb.has(cleanId)) {
    throw new Error(`ID Skema '${cleanId}' sudah ada. Harap gunakan ID lain.`);
  }

  const newSkema = {
    id: cleanId,
    judul: skemaData.judul,
    deskripsi: skemaData.deskripsi || "",
    totalUnit: 0,
  };

  allSkemaDb.set(newSkema.id, newSkema);
  allUnitsDb.set(newSkema.id, []);
  return newSkema;
}

/* Simulasi POST /api/auth/login. Mensimulasikan proses login.
  1. Cari User: Dia cek dulu apakah email sudah terdaftar di allUsers.
  2. Simulasi Onboarding: Jika user tidak ada (!user), dia membuat user baru di tempat.
  3. Simulasi Logika Bisnis: Dia menebak role user (isNIM ? "ASESI" : "ASESOR") dan skemaId berdasarkan format email. 
  4.Inisialisasi Progres: Jika user baru adalah ASESI, dia langsung membuatkan record progres baru di progressMap
*/
export async function mockLoginSSO(email, nama) {
  await delay(800);
  let user = allUsers.find((u) => u.email === email);
  if (!user) {
    const isNIM = /^\d{9}@stis\.ac\.id$/.test(email);

    let skemaId, kelas;
    const nimStr = email.split("@")[0];

    const dsKelasList = ["4SI1", "4SI2", "4SD1", "4SE1", "4SK1"];
    const adsKelasList = ["3SD1", "3SD2", "3SD3"];

    if (nimStr.startsWith("22235")) {
      skemaId = "ADS";
      kelas = adsKelasList[Math.floor(Math.random() * adsKelasList.length)];
    } else {
      skemaId = "DS";
      kelas = dsKelasList[Math.floor(Math.random() * dsKelasList.length)];
    }

    user = {
      id: `user-${Date.now()}`,
      email,
      nama,
      role: isNIM ? "ASESI" : "ASESOR",
      nim: isNIM ? nimStr : undefined,
      nip: !isNIM ? "199001010000001001" : undefined,
      skemaId: isNIM ? skemaId : undefined,
      kelas: isNIM ? kelas : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    allUsers.push(user);
    // Inisialisasi progres dipindah ke mockGetProgressAsesi
  }
  return user;
}

export async function mockGetAllUsers() {
  await delay(600);
  return allUsers;
}
export async function mockGetAsesiUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESI");
}
export async function mockGetAsesorUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESOR");
}
export async function mockGetAdminUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ADMIN_LSP");
}

/*
  Simulasi POST /api/admin/users/[id]/role. Mengubah role seorang pengguna.
*/
export async function mockUpdateUserRole(userId, newRole) {
  await delay(500);
  const user = allUsers.find((u) => u.id === userId);
  if (!user) throw new Error("User tidak ditemukan");
  if (user.role === "ASESI") throw new Error("Role Asesi tidak dapat diubah secara manual!");
  user.role = newRole;
  user.updatedAt = new Date();
  return user;
}

/* simulasi GET /api/asesi/units. Mengambil daftar unit kompetensi untuk satu skema.
  fungsinya: menunggu 400ms, 
  kemudian memanggil allUnitsDb.get(skemaId)
  lalu mengembalikannya
*/
export async function mockGetUnitsForSkema(skemaId) {
  await delay(400);
  const units = allUnitsDb.get(skemaId) || [];
  return units;
}

/*
  Simulasi GET /api/asesi/materi?unitId=... Mengambil daftar materi (video, PDF) untuk satu unit.
  Dia mengembalikan data hardcoded (tiga materi).
*/
export async function mockGetMateriForUnit(unitId) {
  await delay(300);
  return [
    { id: `${unitId}-m1`, unitId, judul: "Video: Pengenalan Unit", jenis: "VIDEO", urlKonten: "https://youtu.be/NqFsSUu-4pk?si=h11YIsvai7wYrmY7", urutan: 1 },
    { id: `${unitId}-m2`, unitId, judul: "Slide PDF: Konsep Inti", jenis: "PDF", urlKonten: "https://example.com/slide.pdf", urutan: 2 },
    { id: `${unitId}-m3`, unitId, judul: "Link: Bacaan Tambahan", jenis: "LINK", urlKonten: "https://en.wikipedia.org/wiki/Data_science", urutan: 3 },
  ];
}

/*
  Simulasi GET /api/asesi/soal?unitId=...&tipeSoal=... (Mengambil soal ujian.)
  Dia bisa mengambil soal dari allSoalDb dan memfilternya berdasarkan tipeSoal
  satu API mock ini bisa melayani banyak halaman:
  1. Halaman Tryout (tipeSoal: "TRYOUT")
  2. Halaman Ujian Teori (tipeSoal: "UJIAN_TEORI")
  3. Halaman Admin Skema (tanpa tipeSoal, untuk menampilkan semua soal)
*/
export async function mockGetSoalForUnit(unitId, tipeSoal) {
  await delay(300);
  const allSoal = allSoalDb.get(unitId) || [];
  if (tipeSoal === "SEMUA" || !tipeSoal) return allSoal;
  return allSoal.filter((s) => s.tipeSoal === tipeSoal);
}

/*
  Simulasi GET /api/asesi/soal/tryout?skemaId=...
  Mengambil semua soal TRYOUT dari semua unit dalam satu skema.
*/
export async function mockGetSoalTryoutGabungan(skemaId) {
  await delay(600);
  const unitsInSkema = allUnitsDb.get(skemaId) || [];
  let allTryoutSoal = [];

  unitsInSkema.forEach(unit => {
    const soalUnit = allSoalDb.get(unit.id) || [];
    const tryoutSoal = soalUnit.filter(s => s.tipeSoal === "TRYOUT");
    allTryoutSoal.push(...tryoutSoal);
  });

  return allTryoutSoal;
}

/*
  Simulasi GET /api/asesi/progress. Mengambil data progres Asesi yang sedang login.
*/
export async function mockGetProgressAsesi(asesiId) {
  await delay(400);
  
  // load persisted map
  progressMap = getProgressMapFromStorage();
  let progress = progressMap.get(asesiId);
  const user = allUsers.find((u) => u.id === asesiId);
  
  if (!user) {
     // Jika user tidak ditemukan sama sekali (misal asesiId transient), buat data sementara
     // Ini penting agar tidak error
     const skemaId = "ADS"; // Asumsi default
     const unitsInSkema = allUnitsDb.get(skemaId) || [];
     progress = {
        asesiId, skemaId, fase: "PRA_ASESMEN", completedUnitIds: new Set(),
        viewedMateriIds: new Set(), progressPembelajaran: 0,
        statusPraAsesmen: "BELUM", tryoutSelesai: false,
        ujianTeoriSelesai: false, ujianPraktikumSelesai: false,
     };
     // Jangan simpan transient user ke map utama
     return {
        ...progress,
        completedUnitIds: Array.from(progress.completedUnitIds),
        viewedMateriIds: Array.from(progress.viewedMateriIds),
     };
  }

  const skemaId = user.skemaId || "ADS";
  const unitsInSkema = allUnitsDb.get(skemaId) || [];
  const isDemoAccount = DEMO_AKUN_ASESI.some(d => d.id === user.id || d.email === user.email);
  // Jika progres untuk user ini BELUM ADA di storage...
//   if (!progress) {
//     const user = allUsers.find((u) => u.id === asesiId);
//     const skemaId = user?.skemaId || "ADS";
//     const unitsInSkema = allUnitsDb.get(skemaId) || [];
    
//     // Inisialisasi data progres awal (contoh: 3 unit selesai)
//     const completedIds = new Set(unitsInSkema.slice(0,11).map((u) => u.id));


  // --- (INI PERUBAHAN UTAMANYA) ---
  // Jika ini adalah akun dummy, SELALU paksa progresnya ke status "lolos tryout"
  if (isDemoAccount) {
    const completedIds = new Set(unitsInSkema.map((u) => u.id)); // Selesaikan semua unit
    progress = { 
      asesiId, 
      skemaId, 
      fase: "TRYOUT", // Fase terakhir yg selesai adalah Tryout
      completedUnitIds: completedIds, 
      viewedMateriIds: new Set(), 
      progressPembelajaran: 100, // Pembelajaran 100%
      statusPraAsesmen: "SELESAI", // Pra-Asesmen lolos
      tryoutSelesai: true, // Tryout lolos
      ujianTeoriSelesai: false, // <-- KUNCI: Ujian Teori BELUM diambil
      ujianPraktikumSelesai: false,
    };
    
    // Simpan progres paksa ini ke map (dan ke storage) agar konsisten
    progressMap.set(asesiId, progress);
    saveProgressMapToStorage(progressMap);
    
  } else if (!progress) {
    // Jika ini BUKAN akun dummy DAN dia pengguna baru (tidak ada progres)
    // Buat progres awal dari nol
    progress = { 
      asesiId, 
      skemaId, 
      fase: "PRA_ASESMEN", 
      completedUnitIds: new Set(),
      viewedMateriIds: new Set(),    
      progressPembelajaran: 0,
      statusPraAsesmen: "BELUM", 
      tryoutSelesai: false, 
      ujianTeoriSelesai: false,
      ujianPraktikumSelesai: false,
    };
    progressMap.set(asesiId, progress);
    saveProgressMapToStorage(progressMap);
  }
  // --- (BATAS PERUBAHAN) ---

  // Kembalikan progres yang sudah dipastikan (paksa/baru/lama)
  return {
    ...progress,
    completedUnitIds: Array.from(progress.completedUnitIds),
    viewedMateriIds: Array.from(progress.viewedMateriIds || new Set()),
    ujianPraktikumSelesai: progress.ujianPraktikumSelesai || false,
  };
}

// Update mutator functions untuk dukung transient cache
export async function mockMarkMateriViewed(asesiId, materiId) {
  await delay(200); 
  
  if (typeof asesiId === 'string' && asesiId.startsWith('transient-')) {
    let progress = transientProgressCache.get(asesiId);
    if (!progress) {
      progress = { asesiId, skemaId: "ADS", fase: "PEMBELAJARAN", completedUnitIds: new Set(), viewedMateriIds: new Set(), progressPembelajaran: 0 };
      transientProgressCache.set(asesiId, progress);
    }
    progress.viewedMateriIds.add(materiId);
    console.log(`[Mock][transient] Asesi ${asesiId} melihat materi ${materiId}.`);
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }

  // persisted path
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.viewedMateriIds.add(materiId);
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} melihat materi ${materiId}.`);
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }
  throw new Error("Progress Asesi tidak ditemukan saat menandai materi.");
}

export async function mockMarkUnitCompleted(asesiId, unitId) {
  await delay(500);

  if (typeof asesiId === 'string' && asesiId.startsWith('transient-')) {
    let progress = transientProgressCache.get(asesiId);
    if (!progress) {
      progress = { asesiId, skemaId: "ADS", fase: "PEMBELAJARAN", completedUnitIds: new Set(), viewedMateriIds: new Set(), progressPembelajaran: 0 };
      transientProgressCache.set(asesiId, progress);
    }
    progress.completedUnitIds.add(unitId);
    // recalc progressPembelajaran using units in skema
    const unitsInSkema = allUnitsDb.get(progress.skemaId) || [];
    progress.progressPembelajaran = Math.round((progress.completedUnitIds.size / (unitsInSkema.length || 1)) * 100);
    console.log(`[Mock][transient] Asesi ${asesiId} menyelesaikan unit ${unitId}. Progress: ${progress.progressPembelajaran}%`);
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds || new Set()),
    };
  }

  // persisted path
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.completedUnitIds.add(unitId);
    progress.progressPembelajaran = calculateProgress(asesiId);
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} menyelesaikan unit ${unitId}. Progress: ${progress.progressPembelajaran}%`);
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }
}

// Submit tryout tidak persist untuk transient
export async function mockSubmitTryout(asesiId, answers) {
  await delay(700);
  
  if (typeof asesiId === 'string' && asesiId.startsWith('transient-')) {
    let progress = transientProgressCache.get(asesiId);
    if (!progress) {
      progress = { asesiId, skemaId: "ADS", fase: "PEMBELAJARAN", completedUnitIds: new Set(), viewedMateriIds: new Set(), progressPembelajaran: 0 };
      transientProgressCache.set(asesiId, progress);
    }
    progress.tryoutSelesai = true;
    progress.fase = "TRYOUT";
    console.log(`[Mock][transient] Asesi ${asesiId} menyelesaikan tryout. Jawaban:`, answers);
    return { success: true, message: "Tryout berhasil disubmit (transient)." };
  }

  // persisted path
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.tryoutSelesai = true;
    progress.fase = "TRYOUT";
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} menyelesaikan tryout. Jawaban:`, answers);
  }
  return { success: true, message: "Tryout berhasil disubmit." };
}

export async function mockSubmitUjianTeori(asesiId, answers) {
  await delay(1000);
  
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.ujianTeoriSelesai = true;
    progress.fase = "UJIAN_TEORI";
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} menyelesaikan Ujian Teori. Jawaban:`, answers);
  }
  return { success: true, message: "Ujian Teori berhasil disubmit." };
}

/*
  Simulasi POST /api/asesi/exams/praktikum/submit
  Menyimpan file dan menandai praktikum selesai.
*/
export async function mockSubmitPraktikum(asesiId, fileName) {
  await delay(1000);
  
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.ujianPraktikumSelesai = true;
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} mengupload file praktikum: ${fileName}`);
  }
  return { success: true, message: "File praktikum berhasil diunggah." };
}


export async function mockSubmitPraAsesmen(asesiId, data) {
  await delay(1000);
  
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.statusPraAsesmen = "SELESAI";
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} menyelesaikan Pra-Asesmen. Data:`, data);
  }
  return { success: true, message: "Pra-Asesmen berhasil disubmit." };
}

/*
  Simulasi GET /api/asesor/penugasan. Mengambil daftar tugas penilaian untuk Asesor yang login.
*/
export async function mockGetPenugasanAsesor(asesorId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter((p) => p.asesorId === asesorId);
}

/*
  Simulasi GET /api/asesor/penugasan/[id]. Mengambil detail satu tugas.
*/
export async function mockGetPenugasanAsesi(asesiId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter((p) => p.asesiId === asesiId);
}

export async function mockGetPenugasanDetail(penugasanId) {
  await delay(300);
  const penugasan = penugasanMap.get(penugasanId);
  if (!penugasan) {
    throw new Error("Penugasan tidak ditemukan");
  }
  return penugasan;
}

/*
  Simulasi GET /api/asesi/schedule/offline. Mengambil jadwal ujian offline spesifik untuk Asesi yang login.
*/
export async function mockGetPlottingAsesi(asesiId) {
  await delay(300);
  const myPlotting = [];
  for (const [sesiId, asesiIds] of plottingDb.entries()) {
    if (asesiIds.includes(asesiId)) {
      const sesiDetail = sesiUjianOfflineDb.get(sesiId);
      if (sesiDetail) {
        myPlotting.push(sesiDetail);
      }
    }
  }
  return myPlotting;
}

export async function mockGetPenugasanAsesiCount() {
  await delay(300);
  return penugasanMap.size;
}

export async function mockGetPendingGradingCount() {
  await delay(300);
  return Array.from(penugasanMap.values()).filter((p) => p.statusPenilaian === "BELUM_DINILAI").length;
}

/*
  Simulasi POST /api/asesor/penugasan/[id]/submit. Asesor mengirimkan hasil penilaian.
*/
export async function mockSubmitNilai(penugasanId, nilai, status, feedback) {
  await delay(600);
  const penugasan = penugasanMap.get(penugasanId);
  if (!penugasan) throw new Error("Penugasan tidak ditemukan");
  penugasan.nilai = nilai;
  penugasan.statusPenilaian = "SELESAI";
  penugasan.nilaiKompetensi = status;
  penugasan.feedback = feedback;
  penugasan.tanggalPenilaian = new Date();
  return penugasan;
}

/*
  Simulasi GET /api/asesi/schedule atau GET /api/admin/timeline. Mengambil jadwal kalender.
*/
/*
  Simulasi GET /api/asesi/schedule atau GET /api/admin/timeline. Mengambil jadwal kalender.
*/
export async function mockGetLinimasa(skemaId) {
  await delay(400);
  const allLinimasa = Array.from(linimasaDb.values());
  
  if (skemaId === "ALL") {
    return allLinimasa; // Untuk Admin
  }

  // Untuk Asesi/Asesor
  return allLinimasa.filter((l) => l.skemaId === skemaId || l.skemaId === "UMUM");
}

/*
  Simulasi GET dan POST untuk app/admin/timeline/page.jsx.
*/
/*
  Simulasi GET dan POST untuk app/admin/timeline/page.jsx.
*/
export async function mockGetSesiUjianOffline(skemaId) {
  await delay(400);
  const allSesi = Array.from(sesiUjianOfflineDb.values());
  
  if (skemaId === "ALL") {
    return allSesi; // Untuk Admin
  }
  
  return allSesi.filter((s) => s.skemaId === skemaId);
}

export async function mockGetSesiUjianDetail(sesiId) {
  await delay(300);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  const asesiTerplot = plottingDb.get(sesiId) || [];
  const asesiDetails = allUsers.filter((u) => asesiTerplot.includes(u.id));
  return { ...sesi, asesiTerplot: asesiDetails };
}

export async function mockCreateSesiUjianOffline(sesi) {
  await delay(600);
  const id = `sesi-${Date.now()}`;
  const newSesi = { ...sesi, id };
  sesiUjianOfflineDb.set(id, newSesi);
  plottingDb.set(id, []);
  return newSesi;
}

/*
  Simulasi POST /api/admin/timeline/linimasa. Membuat event (non-ujian) baru.
*/
export async function mockCreateLinimasa(eventData) {
  await delay(600);
  const id = `lin-${Date.now()}`;
  const newEvent = { 
    ...eventData, 
    id,
    skemaId: eventData.skemaId || "UMUM" // Default ke UMUM jika tidak diset
  };
  linimasaDb.set(id, newEvent);
  return newEvent;
}

/*
  Simulasi GET /api/admin/asesi-available. Mengambil daftar Asesi yang "bebas" untuk dimasukkan ke sesi ujian.
*/
export async function mockGetAsesiBelumDiplot(skemaId, sesiId) {
  await delay(400);

  const allAsesiSkema = allUsers.filter((u) => u.role === "ASESI" && u.skemaId === skemaId);

  let asesiSudahDiplotDiSesiLain = [];
  for (const [key, asesiList] of plottingDb.entries()) {
    if (key !== sesiId) {
      asesiSudahDiplotDiSesiLain.push(...asesiList);
    }
  }

  const asesiAvailable = allAsesiSkema.filter((u) => !asesiSudahDiplotDiSesiLain.includes(u.id));

  const grupKelas = new Map();
  asesiAvailable.forEach((asesi) => {
    const namaKelas = asesi.kelas || "Lainnya";

    if (!grupKelas.has(namaKelas)) {
      grupKelas.set(namaKelas, []);
    }
    grupKelas.get(namaKelas).push(asesi);
  });

  const hasilGrup = Array.from(grupKelas.entries()).map(([namaKelas, asesi]) => ({
    namaKelas,
    asesi,
  }));

  hasilGrup.sort((a, b) => a.namaKelas.localeCompare(b.namaKelas));

  return hasilGrup;
}

/*
  Simulasi POST /api/admin/offline-exam-sesi/[id]/plotting. Menyimpan daftar peserta ke sebuah sesi.
*/
export async function mockUpdatePlottingSesi(sesiId, asesiIds) {
  await delay(500);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  if (asesiIds.length > sesi.kapasitas) {
    throw new Error("Kapasitas ruangan terlampaui!");
  }
  plottingDb.set(sesiId, asesiIds);
  return { success: true, count: asesiIds.length };
}

/*
  Simulasi GET /api/admin/stats. Mengambil angka-angka untuk dashboard Admin.
*/
export async function mockGetStatistics() {
  await delay(500);
  
  progressMap = getProgressMapFromStorage();

  const pendingCount = Array.from(penugasanMap.values()).filter((p) => p.statusPenilaian === "BELUM_DINILAI").length;
  const readyForExam = Array.from(progressMap.values()).filter((p) => p.fase === "TRYOUT" || p.fase === "UJIAN_TEORI").length;
  return {
    totalAsesi: asesiUsers.length,
    totalAsesor: asesorUsers.length,
    totalPenugasan: penugasanMap.size,
    pendingGrading: pendingCount,
    readyForExam: readyForExam,
  };
}

/*
  Simulasi POST /api/admin/assignments. Admin menugaskan asesor ke asesi.
*/
export async function mockAssignAsesorPerUnit(asesiId, assignments) {
  await delay(800);
  console.log(`[Mock] Menugaskan asesor untuk asesi ${asesiId}:`, assignments);
  const asesi = allUsers.find((u) => u.id === asesiId);
  if (!asesi) throw new Error("Asesi tidak ditemukan");

  assignments.forEach((assign) => {
    let id;
    let unitJudul;
    const units = allUnitsDb.get(asesi.skemaId) || []; // Ambil dari DB dinamis

    if (assign.tipe === "TEORI") {
      id = `penugasan-${asesiId}-${assign.unitId}-${assign.tipe}`;
      const unit = units.find((u) => u.nomorUnit == assign.unitId);
      unitJudul = unit?.judul || "Unit tidak ditemukan"; // Handle jika unit tidak ada
    } else {
      id = `penugasan-${asesiId}-${assign.tipe}`;
      unitJudul = assign.tipe === "PRAKTIKUM" ? "Studi Kasus Praktikum (Gabungan)" : "Presentasi Unjuk Diri (Gabungan)";
    }

    penugasanMap.set(id, {
      id: id,
      asesorId: assign.asesorId,
      asesiId: asesiId,
      asesiNama: asesi.nama,
      skemaId: asesi.skemaId,
      unitId: assign.unitId,
      unitJudul: unitJudul,
      tipe: assign.tipe,
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
    });
  });
  return { success: true, count: assignments.length };
}

/*
  Simulasi GET /api/asesi/exam-status
  Mengambil status semua ujian untuk Asesi yang login
  Ini adalah "otak" baru untuk halaman /asesi/exams
*/
export async function mockGetExamStatus(asesiId) {
  await delay(500);
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  
  if (!progress) {
    throw new Error("Progress asesi tidak ditemukan.");
  }

  const jadwalPlotting = await mockGetPlottingAsesi(asesiId); // Ini sudah ada

  // --- (PERUBAHAN SIMULASI DI SINI) ---
  // Kita cari jadwalTeori, TAPI jika tidak ada & tryout sudah selesai,
  // kita buatkan jadwal mock agar simulasi bisa lanjut.
  let jadwalTeori = jadwalPlotting.find(j => j.tipeUjian === "TEORI");
  
  if (!jadwalTeori && progress.tryoutSelesai) {
    console.warn("MOCK_PATCH: Asesi sudah selesai tryout tapi belum di-plot. Membuat jadwal teori palsu agar simulasi bisa lanjut.");
    jadwalTeori = {
      id: "sesi-teori-mock",
      skemaId: progress.skemaId,
      tanggal: new Date(), // Set ke hari ini agar selalu aktif
      waktu: "09:00",
      tipeUjian: "TEORI",
      ruangan: "Ruang Simulasi 101",
      kapasitas: 50,
    }
  }
  // --- (BATAS PERUBAHAN) ---

  const jadwalUnjukDiri = jadwalPlotting.find(j => j.tipeUjian === "UNJUK_DIRI");

  let statusTeori = "TERKUNCI";
  // Prasyarat: Tryout Selesai
  if (progress.tryoutSelesai) {
    // Logika ini sekarang akan selalu menemukan 'jadwalTeori'
    statusTeori = jadwalTeori ? "SIAP_DIJADWALKAN" : "MENUNGGU_JADWAL";
  }
  // Jika sudah selesai, statusnya Selesai
  if (progress.ujianTeoriSelesai) {
    statusTeori = "SELESAI";
  }

  let statusPraktikum = "TERKUNCI";
  // Prasyarat: Ujian Teori Selesai (BUKAN TRYOUT)
  // (Asumsi: Ujian Teori harus selesai dulu baru bisa praktikum)
  if (progress.ujianTeoriSelesai) {
    statusPraktikum = progress.ujianPraktikumSelesai ? "SELESAI" : "AKTIF";
  }

  let statusUnjukDiri = "TERKUNCI";
  // Prasyarat: Ujian Praktikum Selesai
  if (progress.ujianPraktikumSelesai) {
    statusUnjukDiri = jadwalUnjukDiri ? "SIAP_DIJADWALKAN" : "MENUNGGU_JADWAL";
  }
  // (Nanti bisa ditambah status "SELESAI" jika Unjuk Diri sudah dinilai)

  return {
    teori: { status: statusTeori, jadwal: jadwalTeori || null },
    praktikum: { status: statusPraktikum, jadwal: null },
    unjukDiri: { status: statusUnjukDiri, jadwal: jadwalUnjukDiri || null },
  };
}

/*
  Simulasi GET /api/asesi/results. Mengambil rapor akhir Asesi.
*/
export async function mockGetHasilAkhir(asesiId) {
  await delay(700);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  const skemaId = progress?.skemaId || "DS";
  const units = allUnitsDb.get(skemaId) || []; 
  const totalUnitSkema = units.length;

  if (totalUnitSkema === 0) {
    return {
      asesiId,
      skemaId,
      statusAkhir: "BELUM KOMPETEN",
      hasilPraktikum: "BELUM KOMPETEN",
      hasilUnjukDiri: "BELUM KOMPETEN",
      hasilTeori: { statusAkumulasi: "BELUM KOMPETEN", totalUnitLulus: 0, totalUnitSkema: 0, rincianUnit: [] },
    };
  }

  // --- (MODIFIKASI BARU DI SINI) ---
  const isDemoAccount = DEMO_AKUN_ASESI.some(d => d.id === asesiId); // Cek apakah ini akun dummy

  if (isDemoAccount) {
    // Logika "Langsung Lolos" untuk Akun Dummy
    const rincianUnitLolos = units.map((unit) => ({
      unitId: unit.id,
      judul: unit.judul,
      status: "KOMPETEN",
      soalSesuai: 4,
      soalTotal: 4,
    }));
    
    return {
      asesiId,
      skemaId,
      statusAkhir: "KOMPETEN",
      hasilPraktikum: "KOMPETEN",
      hasilUnjukDiri: "KOMPETEN",
      hasilTeori: {
        statusAkumulasi: "KOMPETEN",
        totalUnitLulus: totalUnitSkema,
        totalUnitSkema: totalUnitSkema,
        rincianUnit: rincianUnitLolos,
      },
    };
  }
  // --- (BATAS MODIFIKASI BARU) ---

  // --- Logika Asli (Random / Gagal) untuk asesi non-dummy ---
  let totalUnitLulus = 0;
  const rincianUnit = units.map((unit) => {
    const soalTotal = 4;
    const soalSesuai = Math.floor(Math.random() * 3) + 2; // Random 2, 3, or 4
    const status = soalSesuai / soalTotal >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
    if (status === "KOMPETEN") totalUnitLulus++;
    return { unitId: unit.id, judul: unit.judul, status: status, soalSesuai: soalSesuai, soalTotal: soalTotal };
  });

  const statusAkumulasiTeori = totalUnitLulus / totalUnitSkema >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
  const hasilPraktikum = "KOMPETEN";
  const hasilUnjukDiri = "KOMPETEN";
  const statusAkhir = statusAkumulasiTeori === "KOMPETEN" && hasilPraktikum === "KOMPETEN" && hasilUnjukDiri === "KOMPETEN" ? "KOMPETEN" : "BELUM KOMPETEN";

  if (skemaId === "DS") {
    if (rincianUnit[8]) {
      rincianUnit[8].status = "BELUM KOMPETEN";
      rincianUnit[8].soalSesuai = 2;
    }
    if (rincianUnit[9]) {
      rincianUnit[9].status = "BELUM KOMPETEN";
      rincianUnit[9].soalSesuai = 1;
    }

    totalUnitLulus = rincianUnit.filter((r) => r.status === "KOMPETEN").length;
    const statusTeoriBaru = totalUnitLulus / totalUnitSkema >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
    const statusAkhirBaru = statusTeoriBaru === "KOMPETEN" && hasilPraktikum === "KOMPETEN" && hasilUnjukDiri === "KOMPETEN" ? "KOMPETEN" : "BELUM KOMPETEN";

    return {
      asesiId,
      skemaId,
      statusAkhir: statusAkhirBaru,
      hasilPraktikum,
      hasilUnjukDiri,
      hasilTeori: { statusAkumulasi: statusTeoriBaru, totalUnitLulus, totalUnitSkema, rincianUnit },
    };
  }

  return {
    asesiId,
    skemaId,
    statusAkhir,
    hasilPraktikum,
    hasilUnjukDiri,
    hasilTeori: { statusAkumulasi: statusAkumulasiTeori, totalUnitLulus, totalUnitSkema, rincianUnit },
  };
}

/*
  Simulasi GET /api/admin/results/rekap
  Mengambil rekapitulasi hasil akhir SEMUA asesi untuk admin.
  Fungsi ini memanggil mockGetHasilAkhir untuk setiap asesi.
*/
export async function mockGetRekapHasilAkhir() {
  await delay(1200); // Simulasi load data berat
  
  const asesiUsers = allUsers.filter(u => u.role === "ASESI");
  
  const allPenugasan = Array.from(penugasanMap.values());
  const findAsesorName = (asesorId) => allUsers.find(u => u.id === asesorId)?.nama || "N/A";
  
  const rekapPromises = asesiUsers.map(async (asesi) => {
    // 1. Kita panggil fungsi yang sudah ada untuk menghitung nilai per asesi
    const hasilAkhir = await mockGetHasilAkhir(asesi.id);
    
    // 2. Cari data penugasan untuk asesi ini
    const penugasanAsesi = allPenugasan.filter(p => p.asesiId === asesi.id);
    const units = allUnitsDb.get(asesi.skemaId) || [];
    
    // 3. Cari nama asesor untuk tiap tipe
    const pTeoriAssignments = penugasanAsesi.filter(p => p.tipe === "TEORI");
    const pPraktikum = penugasanAsesi.find(p => p.tipe === "PRAKTIKUM");
    const pUnjukDiri = penugasanAsesi.find(p => p.tipe === "UNJUK_DIRI");

    // 4. Buat array detail {unit, asesor}
    const asesorTeoriDetail = pTeoriAssignments.map(p => {
      const unit = units.find(u => u.nomorUnit === p.unitId);
      return {
        unitId: p.unitId,
        unitJudul: unit?.judul || p.unitJudul || 'Unit Tidak Ditemukan',
        asesorId: p.asesorId,
        asesorNama: findAsesorName(p.asesorId)
      };
    });
    
    // 5. Tambahkan info asesor ke objek hasilAkhir
    hasilAkhir.asesorTeoriDetail = asesorTeoriDetail; 
    hasilAkhir.asesorPraktikum = findAsesorName(pPraktikum?.asesorId);
    hasilAkhir.asesorUnjukDiri = findAsesorName(pUnjukDiri?.asesorId);

    return {
      asesiData: { // Kita sertakan data asesi biar gampang nampilinnya
        id: asesi.id,
        nama: asesi.nama,
        nim: asesi.nim,
        kelas: asesi.kelas || 'N/A' 
      },
      hasilAkhir: hasilAkhir // hasilAkhir sekarang sudah ada info asesornya
    };
  });

  const rekapData = await Promise.all(rekapPromises);
  return rekapData;
}