const students = [
  {
    id: 1,
    nis: "12347",
    nama: "Budi Santoso",
    kelas: "X-A",
    matematika: 85,
    fiqh: 90,
    bArab: 88,
    aqidah: 75,
    ski: 80,
    tugas: [80, 85, 90],
    uts: 75,
    uas: 80,
    absensi: { hadir: 45, izin: 2, sakit: 1, absen: 2 },
  },
  {
    id: 2,
    nis: "12348",
    nama: "Laila Majnun",
    kelas: "X-A",
    matematika: 70,
    fiqh: 75,
    bArab: 80,
    aqidah: 85,
    ski: 78,
    tugas: [70, 75, 80],
    uts: 80,
    uas: 85,
    absensi: { hadir: 48, izin: 0, sakit: 1, absen: 1 },
  },
  {
    id: 3,
    nis: "12345",
    nama: "Muh. Al-Fatih",
    kelas: "X-A",
    matematika: 90,
    fiqh: 95,
    bArab: 92,
    aqidah: 88,
    ski: 85,
    tugas: [90, 95, 92],
    uts: 90,
    uas: 92,
    absensi: { hadir: 50, izin: 0, sakit: 0, absen: 0 },
  },
  {
    id: 4,
    nis: "12346",
    nama: "Siti Aminah",
    kelas: "X-A",
    matematika: 60,
    fiqh: 65,
    bArab: 70,
    aqidah: 75,
    ski: 72,
    tugas: [60, 65, 0],
    uts: 70,
    uas: 75,
    absensi: { hadir: 42, izin: 3, sakit: 2, absen: 3 },
  },
  {
    id: 5,
    nis: "12349",
    nama: "Ahmad Fauzi",
    kelas: "X-A",
    matematika: 78,
    fiqh: 82,
    bArab: 75,
    aqidah: 80,
    ski: 77,
    tugas: [78, 82, 0],
    uts: 75,
    uas: 80,
    absensi: { hadir: 46, izin: 1, sakit: 2, absen: 1 },
  },
  {
    id: 6,
    nis: "12350",
    nama: "Zahra Putri",
    kelas: "X-A",
    matematika: 88,
    fiqh: 85,
    bArab: 90,
    aqidah: 92,
    ski: 87,
    tugas: [88, 85, 90],
    uts: 85,
    uas: 90,
    absensi: { hadir: 49, izin: 1, sakit: 0, absen: 0 },
  },
  {
    id: 7,
    nis: "12351",
    nama: "Rico Hermawan",
    kelas: "X-A",
    matematika: 55,
    fiqh: 60,
    bArab: 65,
    aqidah: 70,
    ski: 62,
    tugas: [55, 60, 0],
    uts: 65,
    uas: 70,
    absensi: { hadir: 38, izin: 4, sakit: 3, absen: 5 },
  },
  {
    id: 8,
    nis: "12352",
    nama: "Nurul Hidayah",
    kelas: "X-A",
    matematika: 82,
    fiqh: 78,
    bArab: 85,
    aqidah: 80,
    ski: 83,
    tugas: [82, 78, 85],
    uts: 80,
    uas: 85,
    absensi: { hadir: 47, izin: 2, sakit: 1, absen: 0 },
  },
];

const attendanceHistory = {
  12347: generateAttendanceData(5),

  12348: generateAttendanceData(3),

  12345: generateAttendanceData(1),

  12346: generateAttendanceData(6),

  12349: generateAttendanceData(4),

  12350: generateAttendanceData(2),

  12351: generateAttendanceData(7),

  12352: generateAttendanceData(2),
};

function generateAttendanceData(mixRate = 1) {
  const data = [];
  const notes = {
    hadir: "",
    izin: [
      "Keluar kota",
      "Urusan keluarga",
      "Ikut orang tua",
      "Periksa kesehatan",
    ],
    sakit: ["Demam", "Flu", "Pusing", "Sakit kepala"],
    absen: ["Tanpa keterangan", "Terlambat", "Bolos"],
  };

  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const tanggal = date.toISOString().split("T")[0];

    let status;
    const rand = Math.random() * 10;

    if (rand < 8 - mixRate) {
      status = "hadir";
    } else if (rand < 9 - mixRate * 0.5) {
      status = "izin";
    } else if (rand < 9.5 - mixRate * 0.3) {
      status = "sakit";
    } else {
      status = "absen";
    }

    const catatan = notes[status]
      ? notes[status][Math.floor(Math.random() * notes[status].length)]
      : "";

    data.push({
      tanggal: tanggal,
      status: status,
      catatan: catatan,
    });
  }

  return data;
}
