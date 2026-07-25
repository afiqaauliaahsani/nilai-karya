function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

const app = {
  students,

  parentFilterType: "minggu",
  parentFilterValue: 0,

  activeClass: "",
  activeMode: "attendance",
  globalTaskIndex: 0,
  isWaliKelas: true,
  waliKelas: "X-A",

  init() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";

    const menuWali = document.getElementById("menu-wali-kelas");
    if (menuWali) menuWali.classList.remove("d-none");

    const today = new Date().toISOString().split("T")[0];
    const dateEl = document.getElementById("attendance-date");
    if (dateEl) dateEl.value = today;

    this.updateSidebarAccess();
    this.updateDetailButtons();

    this.activateSidebarSection("dashboard");

    if (document.getElementById("chartGuruDashboard")) {
      this.renderGuruDashboard();
    }

    if (document.getElementById("view-parent")) {
      this.parentFilterType = "minggu";
      this.parentFilterValue = 0;
      this.renderParentView();
    }

    document
      .getElementById("attendance-date")
      ?.addEventListener("change", () => {
        this.loadAttendanceData();
      });

    if (this.activeMode === "attendance" && this.activeClass) {
      this.loadAttendanceData();
    }

    if (this.activeMode === "tasks" && this.activeClass) {
      this.loadNilaiData();
    }
  },

  loadAttendanceData() {
    const dateEl = document.getElementById("attendance-date");
    const currentClass = this.activeClass;
    if (!dateEl || !currentClass) return;

    const dateValue = dateEl.value;
    console.log("Mengambil data untuk tanggal: " + dateValue);

    fetch(`api_get_attendance.php?tanggal=${dateValue}&kelas=${currentClass}`)
      .then((res) => res.json())
      .then((data) => {
        this.renderManagementContent();

        setTimeout(() => {
          this.students
            .filter((s) => s.kelas === this.activeClass)
            .forEach((s) => {
              const c = document.getElementById(`catatan_${s.id}`);
              if (c) c.value = "";
            });

          if (data && data.length > 0) {
            data.forEach((item) => {
              const radio = document.getElementById(
                `${item.status}_${item.id_santri}`,
              );
              const catatan = document.getElementById(
                `catatan_${item.id_santri}`,
              );

              if (radio) radio.checked = true;
              if (catatan) catatan.value = item.catatan;
            });
          }
        }, 50);
      })
      .catch((err) => console.error("Gagal load data: ", err));
  },

  updateSidebarAccess() {
    const hasClass = Boolean(this.activeClass);
    const detailLink = document.getElementById("sidebar-link-detail");
    const attendanceLink = document.getElementById("sidebar-link-attendance");
    const tasksLink = document.getElementById("sidebar-link-tasks");

    [detailLink, attendanceLink, tasksLink].forEach((link) => {
      if (!link) return;
      if (hasClass) {
        link.classList.remove("disabled");
        link.removeAttribute("aria-disabled");
        link.style.pointerEvents = "";
        link.style.opacity = "";
      } else {
        link.classList.add("disabled");
        link.setAttribute("aria-disabled", "true");
        link.style.pointerEvents = "none";
        link.style.opacity = "0.55";
      }
    });
  },

  updateDetailButtons() {
    const enabled = Boolean(this.activeClass);
    const btnAbs = document.getElementById("btn-detail-absensi");
    const btnNilai = document.getElementById("btn-detail-nilai");
    if (btnAbs) btnAbs.disabled = !enabled;
    if (btnNilai) btnNilai.disabled = !enabled;
  },

  activateSidebarSection(section, fromElement) {
    document
      .querySelectorAll(".sidebar-link")
      .forEach((el) => el.classList.remove("active"));
    if (fromElement) {
      fromElement.classList.add("active");
      return;
    }
    const target = document.querySelector(
      `.sidebar-link[data-section="${section}"]`,
    );
    if (target) target.classList.add("active");
  },

  setSection(section) {
    const dash = document.getElementById("section-dashboard");
    const manage = document.getElementById("section-management");
    const detailMapel = document.getElementById("section-class-detail-mapel");
    const detailWali = document.getElementById("section-class-detail-wali");
    const nilaiGabungan = document.getElementById("section-nilai-gabungan");
    const absensiKumulatif = document.getElementById(
      "section-absensi-kumulatif",
    );

    if (
      (section === "attendance" || section === "tasks") &&
      !this.activeClass
    ) {
      alert("Silakan pilih kelas terlebih dahulu di dropdown sidebar!");
      return;
    }

    if (section === "nilai-gabungan" || section === "absensi-kumulatif") {
      const kelasWali = this.isWaliKelas ? this.waliKelas : this.activeClass;
      if (!kelasWali) {
        alert("Silakan pilih kelas terlebih dahulu di dropdown sidebar!");
        return;
      }

      if (this.isWaliKelas) {
        this.activeClass = this.waliKelas;
        const label = document.getElementById("active-class-label");
        if (label) label.innerText = "Kelas " + this.waliKelas;
      }
    }

    this.activateSidebarSection(section, event && event.currentTarget);

    if (section === "dashboard") {
      dash?.classList.remove("d-none");
      manage?.classList.add("d-none");
      detailMapel?.classList.add("d-none");
      detailWali?.classList.add("d-none");
      nilaiGabungan?.classList.add("d-none");
      absensiKumulatif?.classList.add("d-none");
    } else if (
      section === "nilai-gabungan" ||
      section === "absensi-kumulatif"
    ) {
      dash?.classList.add("d-none");
      manage?.classList.add("d-none");
      detailMapel?.classList.add("d-none");
      detailWali?.classList.add("d-none");
      nilaiGabungan?.classList.add("d-none");
      absensiKumulatif?.classList.add("d-none");

      if (section === "nilai-gabungan") {
        nilaiGabungan?.classList.remove("d-none");
        this.renderNilaiGabungan();
      } else if (section === "absensi-kumulatif") {
        absensiKumulatif?.classList.remove("d-none");
        this.renderAbsensiKumulatif();
      }
    } else {
      this.activeMode = section;
      dash?.classList.add("d-none");
      manage?.classList.remove("d-none");
      detailMapel?.classList.add("d-none");
      detailWali?.classList.add("d-none");
      nilaiGabungan?.classList.add("d-none");
      absensiKumulatif?.classList.add("d-none");

      if (section === "tasks") {
        this.loadNilaiData();
      } else if (section === "attendance") {
        this.loadAttendanceData();
      } else {
        this.renderManagementContent();
      }
    }

    if (window.innerWidth <= 992) this.toggleSidebar();
  },

  changeFilterType() {
    const filterType = document.getElementById("filter-type").value;
    const mingguContainer = document.getElementById("minggu-select-container");
    const bulanContainer = document.getElementById("bulan-select-container");

    this.parentFilterType = filterType;

    if (filterType === "minggu") {
      mingguContainer.classList.remove("d-none");
      bulanContainer.classList.add("d-none");
    } else {
      mingguContainer.classList.add("d-none");
      bulanContainer.classList.remove("d-none");
    }
  },

  applyParentFilter() {
    const filterType = document.getElementById("filter-type").value;
    this.parentFilterType = filterType;

    if (filterType === "minggu") {
      this.parentFilterValue =
        parseInt(document.getElementById("minggu-select").value) || 0;
    } else {
      this.parentFilterValue =
        parseInt(document.getElementById("bulan-select").value) || 0;
    }

    this.renderParentView();
  },

  getDateRange() {
    const today = new Date();
    let startDate, endDate, label;

    if (this.parentFilterType === "minggu") {
      const weekNum = this.parentFilterValue;
      const daysAgo = weekNum * 7;
      const dayOfWeek = today.getDay();

      endDate = new Date(today);
      endDate.setDate(today.getDate() - daysAgo - dayOfWeek);

      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);

      const weekNames = ["Ini", "Lalu", "2 Lalu", "3 Lalu"];
      label = `Minggu ke-${weekNum + 1} (${weekNames[Math.min(weekNum, 3)]})`;
    } else {
      const monthNum = this.parentFilterValue;
      const targetMonth = new Date(
        today.getFullYear(),
        today.getMonth() - monthNum,
        1,
      );

      startDate = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        1,
      );
      endDate = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      );

      const monthNames = ["Ini", "Lalu", "2 Bulan Lalu", "3 Bulan Lalu"];
      label = `Bulan ${monthNames[Math.min(monthNum, 3)]}`;
    }

    return { startDate, endDate, label };
  },

  getFilteredAttendance(nis) {
    const history = attendanceHistory[nis] || [];
    const { startDate, endDate } = this.getDateRange();

    const filtered = history.filter((h) => {
      const date = new Date(h.tanggal);
      return date >= startDate && date <= endDate;
    });

    return filtered;
  },

  renderParentView() {
    const nisParam = getQueryParam("nis");
    const student =
      this.students.find((s) => s.nis === nisParam) || this.students[0];
    const nis = student.nis;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    const avatar = document.getElementById("student-avatar");

    setText("student-name", student.nama);
    setText("student-nis", student.nis);
    setText("student-kelas", student.kelas);
    setText("student-wali", "Ustadzah Afiqa");
    if (avatar)
      avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.nama)}&background=2563eb&color=fff`;

    const history = this.getFilteredAttendance(nis);

    const hadirCount = history.filter((h) => h.status === "hadir").length;
    const izinCount = history.filter((h) => h.status === "izin").length;
    const sakitCount = history.filter((h) => h.status === "sakit").length;
    const absenCount = history.filter((h) => h.status === "absen").length;
    const totalDays = history.length;
    const persentaseAbsensi =
      totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;

    setText("parent-absensi-quick", persentaseAbsensi + "%");
    setText("parent-absensi-detail-quick", `${hadirCount}/${totalDays} Hari`);

    const tugas = student.tugas || [];
    const tugasSelesai = tugas.filter((t) => t > 0).length;
    const totalTugas = tugas.length;
    const persentaseTugas =
      totalTugas > 0 ? Math.round((tugasSelesai / totalTugas) * 100) : 0;
    setText("parent-tugas-quick", persentaseTugas + "%");
    setText(
      "parent-tugas-detail-quick",
      `${tugasSelesai}/${totalTugas} Selesai`,
    );

    const nilaiMapel = [
      student.matematika,
      student.fiqh,
      student.bArab,
      student.aqidah,
      student.ski,
    ];
    const rerata = (nilaiMapel.reduce((a, b) => a + b, 0) / 5).toFixed(1);
    setText("parent-rerata", rerata);

    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setText("last-update", today.toLocaleDateString("id-ID", options));

    const { label: filterLabel } = this.getDateRange();
    const currentFilterLabel = document.getElementById("current-filter-label");
    if (currentFilterLabel) currentFilterLabel.textContent = filterLabel;

    const totalTidakHadir = izinCount + sakitCount + absenCount;
    const alertEl = document.getElementById("parent-alert");
    const alertText = document.getElementById("parent-alert-text");
    if (alertEl && alertText) {
      if (totalTidakHadir > 3 || persentaseAbsensi < 80) {
        alertEl.classList.remove("d-none");
        alertText.textContent =
          "Santri memiliki absensi di bawah 80% atau lebih dari 3 kali tidak hadir. Mohon koordinasi dengan guru.";
      } else if (rerata < 70) {
        alertEl.classList.remove("d-none");
        alertText.textContent =
          "Nilai rata-rata Santri di bawah KKM. Mohon dibimbing tambahan.";
      } else {
        alertEl.classList.add("d-none");
      }
    }

    this.renderChartNilai(student);

    this.renderChartAbsensi(hadirCount, izinCount, sakitCount, absenCount);

    this.renderRingkasanNilai(student);

    this.renderRingkasanAbsensi(hadirCount, izinCount, sakitCount, absenCount);

    this.renderTabelAbsensi(history);

    this.renderTabelTugas(student);

    this.renderNilaiUAS(student);
  },

  renderChartNilai(student) {
    const ctx = document.getElementById("chartNilai");
    if (!ctx) return;

    if (this._chartNilai) this._chartNilai.destroy();

    const mapel = [
      { nama: "Matematika", nilai: student.matematika },
      { nama: "Fiqh", nilai: student.fiqh },
      { nama: "B. Arab", nilai: student.bArab },
      { nama: "Aqidah", nilai: student.aqidah },
      { nama: "SKI", nilai: student.ski },
    ];

    const chartColors = mapel.map((m) =>
      m.nilai >= 70 ? "#10b981" : "#ef4444",
    );

    this._chartNilai = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: mapel.map((m) => m.nama),
        datasets: [
          {
            label: "Nilai",
            data: mapel.map((m) => m.nilai),
            backgroundColor: chartColors,
            borderRadius: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const nilai = context.raw;
                const status =
                  nilai >= 80
                    ? "Sangat Baik"
                    : nilai >= 70
                      ? "Baik"
                      : nilai >= 60
                        ? "Cukup"
                        : "Perlu Perhatian";
                return `Nilai: ${nilai} (${status})`;
              },
            },
          },
        },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    });
  },

  renderChartAbsensi(hadir, izin, sakit, absen) {
    const ctx = document.getElementById("chartAbsensi");
    if (!ctx) return;

    if (this._chartAbsensi) this._chartAbsensi.destroy();

    this._chartAbsensi = new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Hadir", "Izin", "Sakit", "Absen"],
        datasets: [
          {
            data: [hadir, izin, sakit, absen],
            backgroundColor: ["#10b981", "#f59e0b", "#0ea5e9", "#ef4444"],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  },

  renderRingkasanNilai(student) {
    const mapel = [
      { nama: "Matematika", nilai: student.matematika },
      { nama: "Fiqh", nilai: student.fiqh },
      { nama: "B. Arab", nilai: student.bArab },
      { nama: "Aqidah", nilai: student.aqidah },
      { nama: "SKI", nilai: student.ski },
    ];

    const highest = mapel.reduce((a, b) => (a.nilai > b.nilai ? a : b));
    const lowest = mapel.reduce((a, b) => (a.nilai < b.nilai ? a : b));
    const unggul = mapel.filter((m) => m.nilai >= 70).length;

    document.getElementById("nilai-tertinggi").textContent =
      `${highest.nama} (${highest.nilai})`;
    document.getElementById("nilai-terendah").textContent =
      `${lowest.nama} (${lowest.nilai})`;
    document.getElementById("nilai-mapel-unggul").textContent =
      `${unggul}/5 Mapel`;
  },

  renderRingkasanAbsensi(hadir, izin, sakit, absen) {
    document.getElementById("absensi-hadir-ring").textContent = hadir;
    document.getElementById("absensi-izin-ring").textContent = izin;
    document.getElementById("absensi-sakit-ring").textContent = sakit;
    document.getElementById("absensi-alpha-ring").textContent = absen;
  },

  renderTabelAbsensi(history) {
    const tbody = document.getElementById("absensi-filter-body");
    if (!tbody) return;

    if (history.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center text-muted">Belum ada data absensi</td></tr>';
      return;
    }

    tbody.innerHTML = history
      .map((h) => {
        let statusBadge = "",
          badgeClass = "";

        switch (h.status) {
          case "hadir":
            statusBadge = '<span class="badge bg-success">Hadir</span>';
            badgeClass = "text-success";
            break;
          case "izin":
            statusBadge =
              '<span class="badge bg-warning text-dark">Izin</span>';
            badgeClass = "text-warning";
            break;
          case "sakit":
            statusBadge = '<span class="badge bg-info text-dark">Sakit</span>';
            badgeClass = "text-info";
            break;
          case "absen":
            statusBadge = '<span class="badge bg-danger">Absen</span>';
            badgeClass = "text-danger";
            break;
        }

        const tanggalObj = new Date(h.tanggal);
        const formattedDate = tanggalObj.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        return `<tr><td class="text-center">${formattedDate}</td><td class="text-center ${badgeClass}">${statusBadge}</td><td>${h.catatan || "-"}</td></tr>`;
      })
      .join("");
  },

  renderTabelTugas(student) {
    const tbody = document.getElementById("tugas-filter-body");
    if (!tbody) return;

    const tugas = student.tugas || [];
    const mapelTugas = [
      { nama: "Matematika", key: "matematika" },
      { nama: "Fiqh", key: "fiqh" },
      { nama: "B. Arab", key: "bArab" },
      { nama: "Aqidah", key: "aqidah" },
      { nama: "SKI", key: "ski" },
    ];

    const rows = [];
    const maxTugas = Math.max(tugas.length, 3);

    for (let i = 0; i < maxTugas; i++) {
      const tugasNum = i + 1;
      const rowCells = mapelTugas
        .map((m) => {
          if (tugas[i] === undefined || tugas[i] === 0) {
            return `<td class="text-center"><span class="badge bg-secondary">-</span></td>`;
          }
          const statusTugas = tugas[i] > 0;
          return `<td class="text-center">${statusTugas ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i></span>' : '<span class="badge bg-danger"><i class="bi bi-x-circle"></i></span>'}</td>`;
        })
        .join("");

      rows.push(
        `<tr><td class="fw-bold">Tugas ${tugasNum}</td>${rowCells}</tr>`,
      );
    }

    rows.push(
      `<tr><td class="fw-bold">UTS</td>${mapelTugas.map(() => '<td class="text-center"><span class="badge bg-success"><i class="bi bi-check-circle"></i></span></td>').join("")}</tr>`,
    );

    tbody.innerHTML = rows.join("");
  },

  renderNilaiUAS(student) {
    const tbody = document.getElementById("nilai-siswa-body");
    if (!tbody) return;

    const mapel = [
      { nama: "Matematika", nilai: student.matematika },
      { nama: "Fiqh", nilai: student.fiqh },
      { nama: "Bahasa Arab", nilai: student.bArab },
      { nama: "Aqidah Akhlak", nilai: student.aqidah },
      { nama: "SKI", nilai: student.ski },
    ];

    const rerataUAS = (mapel.reduce((a, b) => a + b.nilai, 0) / 5).toFixed(1);
    document.getElementById("rerata-uas").textContent = rerataUAS;

    const statusUAS = document.getElementById("status-uas");
    if (rerataUAS >= 70) {
      statusUAS.textContent = "Lulus";
      statusUAS.className = "badge bg-success fs-6";
    } else {
      statusUAS.textContent = "Remedial";
      statusUAS.className = "badge bg-danger fs-6";
    }

    tbody.innerHTML = mapel
      .map((m) => {
        let status = "",
          warna = "";
        if (m.nilai >= 80) {
          status = "Sangat Baik";
          warna = "text-success";
        } else if (m.nilai >= 70) {
          status = "Baik";
          warna = "text-primary";
        } else if (m.nilai >= 60) {
          status = "Cukup";
          warna = "text-warning";
        } else {
          status = "Perlu Perhatian";
          warna = "text-danger";
        }
        return `<tr><td>${m.nama}</td><td class="text-center fw-bold">${m.nilai}</td><td class="${warna}">${status}</td><td>${m.nilai >= 70 ? "Lulus" : "Remedial"}</td></tr>`;
      })
      .join("");
  },

  renderNilaiGabungan() {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);

    const studentsWithAvg = filtered
      .map((s) => {
        const avg = (s.matematika + s.fiqh + s.bArab + s.aqidah + s.ski) / 5;
        return { ...s, rerata: avg };
      })
      .sort((a, b) => b.rerata - a.rerata);

    studentsWithAvg.forEach((s, i) => (s.ranking = i + 1));

    const tbody = document.getElementById("nilai-gabungan-body");
    if (!tbody) return;

    tbody.innerHTML = studentsWithAvg
      .map((s, i) => {
        const getScoreClass = (score) => {
          if (score >= 80) return "score-good";
          if (score >= 70) return "score-medium";
          return "score-poor";
        };

        return `
                <tr>
                    <td class="text-center">${i + 1}</td>
                    <td>${s.nis}</td>
                    <td class="fw-bold">${s.nama}</td>
                    <td class="score-cell ${getScoreClass(s.matematika)}">${s.matematika}</td>
                    <td class="score-cell ${getScoreClass(s.fiqh)}">${s.fiqh}</td>
                    <td class="score-cell ${getScoreClass(s.bArab)}">${s.bArab}</td>
                    <td class="score-cell ${getScoreClass(s.aqidah)}">${s.aqidah}</td>
                    <td class="score-cell ${getScoreClass(s.ski)}">${s.ski}</td>
                    <td class="text-center fw-bold bg-success bg-opacity-10">${s.rerata.toFixed(1)}</td>
                    <td class="text-center"><span class="badge bg-primary">${s.ranking}</span></td>
                </tr>
            `;
      })
      .join("");
  },

  renderAbsensiKumulatif() {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);
    const tbody = document.getElementById("absensi-kumulatif-body");
    if (!tbody) return;

    tbody.innerHTML = filtered
      .map((s, i) => {
        const abs = s.absensi || { hadir: 0, izin: 0, sakit: 0, absen: 0 };
        const totalTidakHadir =
          (abs.izin || 0) + (abs.sakit || 0) + (abs.absen || 0);
        const total = abs.hadir + totalTidakHadir;
        const persentase = Math.round((abs.hadir / total) * 100);

        let statusBadge = "";
        let rowClass = "";

        if (totalTidakHadir > 3 || persentase < 80) {
          statusBadge =
            '<span class="badge-danger-custom"><i class="bi bi-exclamation-triangle me-1"></i>Panggil Ortu</span>';
          rowClass = "row-danger";
        } else if (totalTidakHadir > 0) {
          statusBadge =
            '<span class="badge bg-warning text-dark">Waspada</span>';
        } else {
          statusBadge = '<span class="badge bg-success">Sangat Baik</span>';
        }

        return `
                <tr class="${rowClass}">
                    <td class="text-center">${i + 1}</td>
                    <td>${s.nis}</td>
                    <td class="fw-bold">${s.nama}</td>
                    <td class="text-center fw-bold text-success">${abs.hadir}</td>
                    <td class="text-center">${abs.izin}</td>
                    <td class="text-center">${abs.sakit}</td>
                    <td class="text-center text-danger fw-bold">${abs.absen}</td>
                    <td class="text-center fw-bold ${totalTidakHadir > 3 ? "text-danger" : ""}">${totalTidakHadir}</td>
                    <td class="text-center">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar ${persentase >= 80 ? "bg-success" : persentase >= 70 ? "bg-warning" : "bg-danger"}" 
                                 role="progressbar" style="width: ${persentase}%" aria-valuenow="${persentase}" aria-valuemin="0" aria-valuemax="100">
                                ${persentase}%
                            </div>
                        </div>
                    </td>
                    <td class="text-center">${statusBadge}</td>
                </tr>
            `;
      })
      .join("");
  },

  exportExcel(type) {
    if (type === "nilai-gabungan") {
      const filtered = this.students.filter(
        (s) => s.kelas === this.activeClass,
      );
      const data = filtered.map((s) => ({
        NIS: s.nis,
        "Nama Santri": s.nama,
        Matematika: s.matematika,
        Fiqh: s.fiqh,
        "B. Arab": s.bArab,
        Aqidah: s.aqidah,
        SKI: s.ski,
        Rerata: (
          (s.matematika + s.fiqh + s.bArab + s.aqidah + s.ski) /
          5
        ).toFixed(1),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Nilai Gabungan");
      XLSX.writeFile(wb, `Rekap_Nilai_Gabungan_${this.activeClass}.xlsx`);
    } else if (type === "absensi-kumulatif") {
      const filtered = this.students.filter(
        (s) => s.kelas === this.activeClass,
      );
      const data = filtered.map((s) => {
        const abs = s.absensi || { hadir: 0, izin: 0, sakit: 0, absen: 0 };
        const totalTidakHadir =
          (abs.izin || 0) + (abs.sakit || 0) + (abs.absen || 0);
        const tidakHadir = abs.izin + abs.sakit + abs.absen;
        return {
          NIS: s.nis,
          "Nama Santri": s.nama,
          Hadir: abs.hadir,
          Izin: abs.izin,
          Sakit: abs.sakit,
          Absen: abs.absen,
          "Total Tidak Hadir": tidakHadir,
          "Persentase Kehadiran": Math.round((abs.hadir / total) * 100) + "%",
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Absensi Kumulatif");
      XLSX.writeFile(wb, `Monitoring_Absensi_${this.activeClass}.xlsx`);
    }
    alert("Berhasil export ke Excel!");
  },

  exportPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (type === "nilai-gabungan") {
      doc.setFontSize(16);
      doc.text("Rekap Nilai Gabungan", 14, 20);
      doc.setFontSize(10);
      doc.text(`Kelas: ${this.activeClass} | Tahun Ajaran 2024/2025`, 14, 28);

      const filtered = this.students.filter(
        (s) => s.kelas === this.activeClass,
      );
      const tableData = filtered.map((s) => [
        s.nis,
        s.nama,
        s.matematika,
        s.fiqh,
        s.bArab,
        s.aqidah,
        s.ski,
        ((s.matematika + s.fiqh + s.bArab + s.aqidah + s.ski) / 5).toFixed(1),
      ]);

      doc.autoTable({
        head: [
          ["NIS", "Nama", "MTK", "Fiqh", "B.Arab", "Aqidah", "SKI", "Rerata"],
        ],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
      });
    } else if (type === "absensi-kumulatif") {
      doc.setFontSize(16);
      doc.text("Monitoring Absensi Kumulatif", 14, 20);
      doc.setFontSize(10);
      doc.text(`Kelas: ${this.activeClass} | Tahun Ajaran 2024/2025`, 14, 28);

      const filtered = this.students.filter(
        (s) => s.kelas === this.activeClass,
      );
      const tableData = filtered.map((s) => {
        const abs = s.absensi || { hadir: 0, izin: 0, sakit: 0, absen: 0 };
        const totalTidakHadir =
          (abs.izin || 0) + (abs.sakit || 0) + (abs.absen || 0);
        const total = abs.hadir + tidakHadir;
        const pct = Math.round((abs.hadir / total) * 100);
        return [
          s.nis,
          s.nama,
          abs.hadir,
          abs.izin,
          abs.sakit,
          abs.absen,
          tidakHadir,
          pct + "%",
        ];
      });

      doc.autoTable({
        head: [
          ["NIS", "Nama", "Hadir", "Izin", "Sakit", "Absen", "Total", "%"],
        ],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
      });
    }

    doc.save(`${type}_${this.activeClass}.pdf`);
    alert("Berhasil export ke PDF!");
  },

  changeClass(c) {
    if (!c) {
      this.activeClass = "";
      const label = document.getElementById("active-class-label");
      if (label) label.innerText = "(Pilih Kelas)";
      this.updateSidebarAccess();
      return;
    }

    this.activeClass = c;
    const label = document.getElementById("active-class-label");
    if (label) label.innerText = "Kelas " + c;

    this.updateDetailButtons();
    this.updateSidebarAccess();

    if (this.activeMode === "attendance") {
      this.loadAttendanceData();
    } else if (this.activeMode === "tasks") {
      this.loadNilaiData();
    } else if (this.activeMode === "tasks") {
      this.renderManagementContent();
    } else {
      this.goToClassDetail(false);
    }
  },

  goToClassDetail(useWali = false) {
    const kelas = useWali ? this.waliKelas : this.activeClass;

    if (!kelas) {
      alert("Silakan pilih kelas terlebih dahulu!");
      return;
    }

    console.log("Mode:", useWali ? "WALI" : "MAPEL");
    console.log("Kelas:", kelas);

    const urlNilai = useWali
      ? `api_nilai_kumulatif.php?kelas=${kelas}`
      : `api_get_nilai.php?kelas=${kelas}&mapel=${this.mapel}`;

    Promise.all([
      fetch(urlNilai).then((res) => res.json()),
      fetch(`api_attendance_kumulatif.php?kelas=${kelas}`).then((res) =>
        res.json(),
      ),
    ])
      .then(([nilaiData, absenData]) => {
        console.log("Nilai Data:", nilaiData);

        this.students.forEach((s) => {
          if (s.kelas === kelas) {
            const n = nilaiData.find((v) => v.id_santri == s.id);

            if (n) {
              s.tugas = n.tugas || [0, 0, 0, 0, 0, 0, 0, 0];
              s.uts = Number(n.uts) || 0;
              s.uas = Number(n.uas) || 0;
            } else {
              s.tugas = [0, 0, 0, 0, 0, 0, 0, 0];
              s.uts = 0;
              s.uas = 0;
            }

            const a = absenData.find((v) => v.id_santri == s.id);
            s.absensi = a ? a : { hadir: 0, izin: 0, sakit: 0, absen: 0 };
          }
        });

        this.activeClass = kelas;
        this.showSectionDetail(useWali);
        this.renderClassDetail(useWali);
      })
      .catch((err) => console.error("Gagal sinkronisasi data detail:", err));
  },

  showSectionDetail(useWali) {
    const sections = [
      "section-dashboard",
      "section-management",
      "section-class-detail-mapel",
      "section-class-detail-wali",
      "section-nilai-gabungan",
      "section-absensi-kumulatif",
    ];
    sections.forEach((id) =>
      document.getElementById(id)?.classList.add("d-none"),
    );

    const target = useWali
      ? "section-class-detail-wali"
      : "section-class-detail-mapel";
    document.getElementById(target)?.classList.remove("d-none");
    this.activateSidebarSection(useWali ? "detail-wali" : "detail-mapel");
  },

  renderGuruDashboard() {
    const canvas = document.getElementById("chartGuruDashboard");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["X-A", "X-B", "XI-A", "XI-B"],
        datasets: [
          {
            label: "Rerata Nilai",
            data: [85, 72, 90, 75],
            backgroundColor: ["#10b981", "#ef4444", "#10b981", "#ef4444"],
            borderRadius: 8,
            barThickness: 40,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  },

  renderClassDetail(useWali = false) {
    const kelas = useWali ? this.waliKelas : this.activeClass;
    const filtered = this.students.filter((s) => s.kelas === kelas);

    const elements = {
      rerata: document.getElementById(
        useWali ? "detail-rerata-kelas-wali" : "detail-rerata-kelas",
      ),
      atensi: document.getElementById(
        useWali ? "detail-perlu-perhatian-wali" : "detail-perlu-perhatian",
      ),
      absensi: document.getElementById(
        useWali ? "detail-absensi-wali" : "detail-absensi",
      ),
      list: document.getElementById(
        useWali ? "detail-attention-list-wali" : "detail-attention-list",
      ),
    };

    let totalRerataSeluruhSiswa = 0;
    let totalPersenHadirSeluruhSiswa = 0;
    let akumulasiDonut = { h: 0, i: 0, s: 0, a: 0 };
    let listAtensiHTML = "";
    let jumlahAtensi = 0;

    const studentsWithStats = filtered.map((s) => {
      const t = Array.isArray(s.tugas) ? s.tugas : [0, 0, 0, 0, 0, 0, 0, 0];
      const uts = Number(s.uts) || 0;
      const uas = Number(s.uas) || 0;

      const tugasValid = t.filter((v) => v != null && v != 0);
      const avgTugas = tugasValid.length
        ? tugasValid.reduce((a, b) => Number(a) + Number(b), 0) /
          tugasValid.length
        : 0;

      const finalAvgSiswa = ((avgTugas + uts + uas) / 3) * 10;

      const abs = s.absensi || { hadir: 0, izin: 0, sakit: 0, absen: 0 };
      const totalH = Number(abs.hadir) || 0;
      const totalI = Number(abs.izin) || 0;
      const totalS = Number(abs.sakit) || 0;
      const totalA = Number(abs.absen) || 0;

      const totalHariSiswa = totalH + totalI + totalS + totalA;
      const hadirPctSiswa =
        totalHariSiswa === 0
          ? 100
          : Math.round((totalH / totalHariSiswa) * 100);

      totalRerataSeluruhSiswa += finalAvgSiswa;
      totalPersenHadirSeluruhSiswa += hadirPctSiswa;
      akumulasiDonut.h += totalH;
      akumulasiDonut.i += totalI;
      akumulasiDonut.s += totalS;
      akumulasiDonut.a += totalA;

      if (finalAvgSiswa < 70 || hadirPctSiswa < 80) {
        jumlahAtensi++;
        listAtensiHTML += `
          <div class="student-item d-flex align-items-center p-2 border-bottom">
              <div class="flex-grow-1">
                  <div class="fw-bold small">${s.nama}</div>
                  <div class="text-muted" style="font-size: 0.7rem;">Rerata: ${finalAvgSiswa.toFixed(1)} | Hadir: ${hadirPctSiswa}%</div>
              </div>
              <span class="badge bg-danger bg-opacity-10 text-danger" style="font-size: 0.6rem;">Atensi</span>
          </div>`;
      }

      return { ...s, finalAvgSiswa, hadirPctSiswa, t, uts, uas };
    });

    const totalSiswa = filtered.length || 1;

    if (elements.rerata)
      elements.rerata.innerText = (
        totalRerataSeluruhSiswa / totalSiswa
      ).toFixed(1);
    if (elements.absensi)
      elements.absensi.innerText =
        Math.round(totalPersenHadirSeluruhSiswa / totalSiswa) + "%";
    if (elements.atensi) elements.atensi.innerText = jumlahAtensi;
    if (elements.list)
      elements.list.innerHTML =
        listAtensiHTML ||
        '<p class="text-center small text-muted py-3">Kelas Aman</p>';

    const ctxLine = document.getElementById(
      useWali ? "chartClassDetailWali" : "chartClassDetail",
    );
    if (ctxLine) {
      if (this._chartClassDetail) this._chartClassDetail.destroy();
      const labels = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "UTS",
        "UAS",
      ];
      const chartData = labels.map((_, idx) => {
        let sum = 0;
        studentsWithStats.forEach((s) => {
          if (idx < 8) sum += Number(s.t?.[idx]) || 0;
          else if (idx === 8) sum += s.uts;
          else sum += s.uas;
        });
        return parseFloat((sum / totalSiswa).toFixed(1));
      });

      this._chartClassDetail = new Chart(ctxLine.getContext("2d"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Rerata",
              data: chartData,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
    }

    const ctxDonut = document.getElementById(
      useWali ? "chartAttendanceDetailWali" : "chartAttendanceDetail",
    );
    if (ctxDonut) {
      if (this._chartAttendanceDetail) this._chartAttendanceDetail.destroy();
      this._chartAttendanceDetail = new Chart(ctxDonut.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Hadir", "Izin", "Sakit", "Absen"],
          datasets: [
            {
              data: [
                akumulasiDonut.h,
                akumulasiDonut.i,
                akumulasiDonut.s,
                akumulasiDonut.a,
              ],
              backgroundColor: ["#10b981", "#f59e0b", "#0ea5e9", "#ef4444"],
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }
  },
  renderManagementContent() {
    const theadRow = document.getElementById("table-head-row");
    const tbody = document.getElementById("management-table-body");
    const controls = document.getElementById("attendance-controls");
    const taskControls = document.getElementById("task-global-controls");
    const btnSave = document.getElementById("btn-save");

    if (!theadRow || !tbody || !controls || !taskControls || !btnSave) return;

    if (this.activeMode === "attendance") {
      controls.classList.remove("d-none");
      taskControls.classList.add("d-none");
      btnSave.innerHTML = '<i class="bi bi-floppy me-2"></i> Simpan Absensi';
      this.renderAttendance(theadRow, tbody);
    } else {
      controls.classList.add("d-none");
      taskControls.classList.remove("d-none");
      btnSave.innerHTML = '<i class="bi bi-floppy me-2"></i> Simpan Nilai';
      this.renderTasks(theadRow, tbody);
    }
  },

  renderAttendance(theadRow, tbody) {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);

    theadRow.innerHTML = `
        <th class="text-center" style="width: 50px;">No</th>
        <th>NIS</th>
        <th>Nama Santri</th>
        <th class="text-center">Hadir</th>
        <th class="text-center">Izin</th>
        <th class="text-center">Sakit</th>
        <th class="text-center">Absen</th>
        <th class="text-center" style="width: 150px;">Keterangan</th>
    `;

    tbody.innerHTML = filtered
      .map(
        (s, i) => `
        <tr>
            <td class="text-center align-middle">${i + 1}</td>
            <td class="align-middle">${s.nis}</td>
            <td class="fw-bold align-middle">${s.nama}</td>
            
            <td class="text-center">
                <input type="radio" name="absensi_${s.id}" value="hadir" id="hadir_${s.id}" checked>
                <label class="btn-status hadir" for="hadir_${s.id}"><i class="bi bi-check-lg"></i></label>
            </td>
            <td class="text-center">
                <input type="radio" name="absensi_${s.id}" value="izin" id="izin_${s.id}">
                <label class="btn-status izin" for="izin_${s.id}"><i class="bi bi-envelope"></i></label>
            </td>
            <td class="text-center">
                <input type="radio" name="absensi_${s.id}" value="sakit" id="sakit_${s.id}">
                <label class="btn-status sakit" for="sakit_${s.id}"><i class="bi bi-thermometer-half"></i></label>
            </td>
            <td class="text-center">
                <input type="radio" name="absensi_${s.id}" value="absen" id="absen_${s.id}">
                <label class="btn-status absen" for="absen_${s.id}"><i class="bi bi-x-lg"></i></label>
            </td>
            
            <td class="align-middle">
                <input type="text" class="form-control form-control-sm" placeholder="Catatan" id="catatan_${s.id}">
            </td>
        </tr>
    `,
      )
      .join("");
  },

  renderTasks(theadRow, tbody) {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);
    const taskIdx = this.globalTaskIndex;
    const taskNum = parseInt(taskIdx) + 1;

    theadRow.innerHTML = `
            <th class="text-center" style="width: 50px;">No</th>
            <th>NIS</th>
            <th>Nama Santri</th>
            <th class="text-center">Tugas ${taskNum}</th>
            <th class="text-center bg-warning bg-opacity-10">Rata-rata Tugas</th>
            <th class="text-center">UTS</th>
            <th class="text-center">UAS</th>
            <th class="text-center bg-success bg-opacity-10">Rerata</th>
        `;

    tbody.innerHTML = filtered
      .map((s, i) => {
        const tugas = Array.isArray(s.tugas)
          ? s.tugas
          : [0, 0, 0, 0, 0, 0, 0, 0];

        const taskIdx = parseInt(this.globalTaskIndex) || 0;

        const tugasNilai = Number(tugas[taskIdx]) || 0;
        const uts = Number(s.uts) || 0;
        const uas = Number(s.uas) || 0;

        const totalTugas = tugas.reduce((a, b) => Number(a) + Number(b), 0);
        const avgTugas = (totalTugas / 8).toFixed(1);

        const rerataHitung = (Number(avgTugas) + uts + uas) / 3;
        const rerata = isNaN(rerataHitung) ? "0.0" : rerataHitung.toFixed(1);

        const getScoreClass = (val) => {
          if (val >= 80) return "score-good";
          if (val >= 70) return "score-medium";
          return "score-poor";
        };

        return `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td>${s.nis}</td>
                <td class="fw-bold">${s.nama}</td>
                <td class="text-center">
                    <input type="number" class="form-control input-score ${getScoreClass(tugasNilai)}" 
                        value="${tugasNilai}" min="0" max="100" 
                        data-student="${s.id}" data-type="tugas" data-idx="${taskIdx}">
                </td>
                <td class="text-center fw-bold bg-warning bg-opacity-10">
                    <span class="rerata-tugas">${avgTugas}</span>
                </td>
                <td class="text-center">
                    <input type="number" class="form-control input-score ${getScoreClass(uts)}" 
                        value="${uts}" min="0" max="100" data-student="${s.id}" data-type="uts">
                </td>
                <td class="text-center">
                    <input type="number" class="form-control input-score ${getScoreClass(uas)}" 
                        value="${uas}" min="0" max="100" data-student="${s.id}" data-type="uas">
                </td>
                <td class="text-center fw-bold bg-success bg-opacity-10">
                    <span class="rerata-badge">${rerata}</span>
                </td>
            </tr>
        `;
      })
      .join("");

    document.querySelectorAll(".input-score").forEach((input) => {
      input.addEventListener("input", (e) => {
        const studentId = e.target.getAttribute("data-student");
        const type = e.target.getAttribute("data-type");
        const val = parseFloat(e.target.value) || 0;

        const student = this.students.find((s) => s.id == studentId);
        if (student) {
          if (type === "tugas") {
            const idx = e.target.getAttribute("data-idx");
            if (!student.tugas) student.tugas = [0, 0, 0, 0, 0, 0, 0, 0];
            student.tugas[idx] = val;
          } else {
            student[type] = val;
          }
        }

        this.calculateRowTotal(e.target.closest("tr"), student);
      });
    });
  },

  calculateRowTotal(row, student) {
    const tugas = student.tugas || [0, 0, 0, 0, 0, 0, 0, 0];
    const uts = Number(student.uts) || 0;
    const uas = Number(student.uas) || 0;

    const tugasValid = tugas.filter((v) => v != null && v != 0);

    const avgTugas = tugasValid.length
      ? tugasValid.reduce((a, b) => a + Number(b), 0) / tugasValid.length
      : 0;

    const rerataAkhir = ((avgTugas + uts + uas) / 3) * 10;

    const avgTugasFix = avgTugas.toFixed(1);
    const rerataFix = rerataAkhir.toFixed(1);

    student.avgTugas = avgTugas;
    student.finalAvgSiswa = rerataAkhir;

    const avgTugasEl = row.querySelector(".rerata-tugas");
    const rerataBadgeEl = row.querySelector(".rerata-badge");

    if (avgTugasEl) avgTugasEl.innerText = avgTugasFix;

    if (rerataBadgeEl) {
      rerataBadgeEl.innerText = rerataFix;
      rerataBadgeEl.parentElement.className = `text-center fw-bold ${rerataAkhir >= 70 ? "bg-success" : "bg-danger"} bg-opacity-10`;
    }
  },

  changeTask(taskIdx) {
    this.globalTaskIndex = taskIdx;
    if (this.activeMode === "tasks") {
      const theadRow = document.getElementById("table-head-row");
      const tbody = document.getElementById("management-table-body");
      if (theadRow && tbody) this.renderTasks(theadRow, tbody);
    }
  },

  updateRerata() {
    const rows = document.querySelectorAll("#management-table-body tr");
    rows.forEach((row) => {
      const inputs = row.querySelectorAll(".input-score");
      let total = 0;
      let count = 0;

      inputs.forEach((input) => {
        const val = parseFloat(input.value) || 0;
        total += val;
        count++;
      });

      const rerata = (total / count).toFixed(1);
      const badge = row.querySelector(".rerata-badge");
      if (badge) {
        badge.innerText = rerata;
      }
    });
  },

  saveData() {
    console.log("Mode saat ini:", this.activeMode);

    if (this.activeMode === "attendance") {
      this.saveAbsensi();
    } else if (this.activeMode === "tasks") {
      this.saveNilai();
    }
  },

  saveAbsensi() {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);
    const dateValue = document.getElementById("attendance-date")?.value;

    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(dateValue).toLocaleDateString(
      "id-ID",
      options,
    );

    if (!dateValue) {
      return Swal.fire({
        icon: "warning",
        title: "Waduh...",
        text: "Pilih tanggalnya dulu ya Ustadz/Ustadzah!",
      });
    }

    let successCount = 0;
    let errorCount = 0;

    filtered.forEach((s) => {
      const radioChecked = document.querySelector(
        `input[name="absensi_${s.id}"]:checked`,
      );
      const status = radioChecked ? radioChecked.value : "hadir";
      const catatan = document.getElementById(`catatan_${s.id}`)?.value || "";

      const formData = new FormData();
      formData.append("id_santri", s.id);
      formData.append("tanggal", dateValue);
      formData.append("status", status);
      formData.append("catatan", catatan);

      fetch("api_absensi.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.text())
        .then((txt) => {
          console.log("Respon dari PHP:", txt);
          if (txt.includes("Berhasil")) {
            successCount++;
          } else {
            errorCount++;
          }
        })
        .catch((err) => {
          errorCount++;
          console.error("❌ Network error:", err);
        });
    });

    setTimeout(() => {
      Swal.fire({
        title: "Berhasil Disimpan!",
        html: `Absensi <b>${this.activeClass}</b> tanggal <b>${formattedDate}</b> telah tercatat di sistem.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Mantap!",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    }, 1000);
  },

  saveNilai() {
    const filtered = this.students.filter((s) => s.kelas === this.activeClass);
    let successCount = 0;

    filtered.forEach((s) => {
      const formData = new FormData();
      formData.append("id_santri", s.id);

      const inputs = document.querySelectorAll(`input[data-student="${s.id}"]`);

      let nilaiTugas = s.tugas || [0, 0, 0, 0, 0, 0, 0, 0];

      inputs.forEach((input) => {
        const type = input.getAttribute("data-type");
        const val = input.value || 0;

        if (type === "tugas") {
          const idx = input.getAttribute("data-idx");
          formData.append(`tugas${parseInt(idx) + 1}`, val);
        } else {
          formData.append(type, val);
        }
      });

      fetch("api_nilai.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) successCount++;
        });
    });

    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Nilai Berhasil Disimpan",
        text: `Data nilai kelas ${this.activeClass} telah diperbarui.`,
        confirmButtonColor: "#3085d6",
      });
    }, 1000);
  },

  loadNilaiData() {
    if (!this.activeClass) return;

    fetch(`api_get_nilai.php?kelas=${this.activeClass}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data Nilai Diterima:", data);

        if (data && data.length > 0) {
          data.forEach((val) => {
            const s = this.students.find((item) => item.id == val.id_santri);
            if (s) {
              s.tugas = val.tugas;
              s.uts = val.uts;
              s.uas = val.uas;
            }
          });
        }

        this.renderManagementContent();
      })
      .catch((err) => console.error("Gagal load nilai:", err));
  },
};

window.addEventListener("DOMContentLoaded", () => app.init());
