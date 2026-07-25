<?php
include "../service/database.php";
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Madrasah Hub - Laporan Orang Tua</title>

    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../css/style.css" />
  </head>

  <body>
    <div id="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div id="view-parent">
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold text-primary mb-0">
            <i class="bi bi-mortarboard-fill me-2"></i>Laporan Belajar
          </h4>
          <button
            class="btn btn-sm btn-outline-secondary px-3 rounded-pill"
            onclick="window.location.href = '../index.php'"
          >
            Logout
          </button>
        </div>

        <!-- Filter Section -->
        <div class="card-white mb-4 p-3">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label small text-muted">Tipe Filter</label>
              <select
                class="form-select"
                id="filter-type"
                onchange="app.changeFilterType()"
              >
                <option value="minggu">Per Minggu</option>
                <option value="bulan">Per Bulan</option>
              </select>
            </div>
            <div class="col-md-3" id="minggu-select-container">
              <label class="form-label small text-muted">Pilih Minggu</label>
              <select
                class="form-select"
                id="minggu-select"
                onchange="app.applyParentFilter()"
              >
                <option value="1">Minggu ke-1</option>
                <option value="2">Minggu ke-2</option>
                <option value="3">Minggu ke-3</option>
                <option value="4">Minggu ke-4</option>
              </select>
            </div>
            <div class="col-md-3 d-none" id="bulan-select-container">
              <label class="form-label small text-muted">Pilih Bulan</label>
              <select
                class="form-select"
                id="bulan-select"
                onchange="app.applyParentFilter()"
              >
                <option value="0">Bulan Ini</option>
                <option value="1">Bulan Lalu</option>
                <option value="2">2 Bulan Lalu</option>
                <option value="3">3 Bulan Lalu</option>
              </select>
            </div>
            <!-- <div class="col-md-3">
              <button
                class="btn btn-primary w-100"
                onclick="app.applyParentFilter()"
              >
                <i class="bi bi-filter me-1"></i> Terapkan
              </button>
            </div> -->
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-3">
            <div class="card-white mb-4 shadow-sm">
              <h6 class="fw-bold mb-3 small text-muted">SISWA</h6>
              <div class="mb-3">
                <div class="text-muted small">NIS</div>
                <div class="fw-bold" id="student-nis">12347</div>
              </div>
              <div class="mb-3">
                <div class="text-muted small">Nama</div>
                <div class="fw-bold" id="student-name">Budi Santoso</div>
              </div>
              <div class="mb-3">
                <div class="text-muted small">Kelas</div>
                <div class="fw-bold" id="student-kelas">X-A</div>
              </div>
              <div class="mb-3">
                <div class="text-muted small">Wali Kelas</div>
                <div class="fw-bold" id="student-wali">Ustadzah Afiqa</div>
              </div>
              <div class="text-center">
                <img
                  id="student-avatar"
                  class="avatar"
                  src="https://ui-avatars.com/api/?name=Budi+Santoso&background=2563eb&color=fff"
                  alt="Avatar"
                />
              </div>
            </div>
          </div>
          <div class="col-lg-9">
            <div class="card-white h-100">
              <!-- Quick Stats -->
              <div class="row g-4 mb-4">
                <div class="col-md-4">
                  <div class="card-white p-3">
                    <div class="text-muted small">Rerata Nilai</div>
                    <div class="fw-bold fs-3" id="parent-rerata">0.0</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card-white p-3">
                    <div class="text-muted small">Kehadiran</div>
                    <div class="fw-bold fs-3" id="parent-absensi-quick">
                      100%
                    </div>
                    <!-- <small class="text-muted" id="parent-absensi-detail-quick"
                      >0/0 Hari</small
                    > -->
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card-white p-3">
                    <div class="text-muted small">Tugas Selesai</div>
                    <div class="fw-bold fs-3" id="parent-tugas-quick">0%</div>
                    <!-- <small class="text-muted" id="parent-tugas-detail-quick"
                      >0/0 Selesai</small
                    > -->
                  </div>
                </div>
              </div>

              <!-- <div class="alert alert-info mb-4" role="alert">
                <i class="bi bi-clock-history me-2"></i>
                <strong>Update Terakhir:</strong>
                <span id="last-update">Hari ini</span>
                <span class="ms-2 badge bg-secondary" id="current-filter-label"
                  >Minggu ke-4</span
                >
              </div> -->

              <div
                class="alert alert-warning d-none"
                id="parent-alert"
                role="alert"
              >
                <strong>Perhatian!</strong> <span id="parent-alert-text"></span>
              </div>

              <!-- Grafik Nilai -->
              <div class="card-white mb-4">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h6 class="fw-bold mb-0 small text-muted">
                    <i class="bi bi-bar-chart me-2"></i>Grafik Nilai
                  </h6>
                </div>
                <div
                  class="chart-container"
                  style="position: relative; height: 250px"
                >
                  <canvas id="chartNilai"></canvas>
                </div>
                <!-- Ringkasan Nilai -->
                <div class="mt-3 p-3 bg-light rounded" id="ringkasan-nilai">
                  <div class="row text-center">
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-success"
                        id="nilai-tertinggi"
                      >
                        -
                      </div>
                      <small class="text-muted">Nilai Tertinggi</small>
                    </div>
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-warning"
                        id="nilai-terendah"
                      >
                        -
                      </div>
                      <small class="text-muted">Perlu Perbaikan</small>
                    </div>
                    <div class="col">
                      <div class="fw-bold fs-5" id="nilai-mapel-unggul">-</div>
                      <small class="text-muted">Mapel Unggul</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grafik Absensi -->
              <div class="card-white mb-4">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h6 class="fw-bold mb-0 small text-muted">
                    <i class="bi bi-pie-chart me-2"></i>Grafik Kehadiran
                  </h6>
                </div>
                <div
                  class="chart-container"
                  style="position: relative; height: 250px"
                >
                  <canvas id="chartAbsensi"></canvas>
                </div>
                <!-- Ringkasan Absensi -->
                <div class="mt-3 p-3 bg-light rounded" id="ringkasan-absensi">
                  <div class="row text-center">
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-success"
                        id="absensi-hadir-ring"
                      >
                        0
                      </div>
                      <small class="text-muted">Hadir</small>
                    </div>
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-warning"
                        id="absensi-izin-ring"
                      >
                        0
                      </div>
                      <small class="text-muted">Izin</small>
                    </div>
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-info"
                        id="absensi-sakit-ring"
                      >
                        0
                      </div>
                      <small class="text-muted">Sakit</small>
                    </div>
                    <div class="col">
                      <div
                        class="fw-bold fs-5 text-danger"
                        id="absensi-alpha-ring"
                      >
                        0
                      </div>
                      <small class="text-muted">Absen</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabel Absensi -->
              <div class="card-white mb-4">
                <h6 class="fw-bold mb-3 small text-muted">
                  <i class="bi bi-calendar2-check me-2"></i>Riwayat Kehadiran
                </h6>
                <div class="table-responsive">
                  <table
                    class="table table-bordered table-sm"
                    id="table-absensi-filter"
                  >
                    <thead>
                      <tr class="text-center">
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Catatan</th>
                      </tr>
                    </thead>
                    <tbody id="absensi-filter-body">
                      <tr>
                        <td colspan="3" class="text-center text-muted">
                          Memuat data...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tabel Tugas -->
              <div class="card-white mb-4">
                <h6 class="fw-bold mb-3 small text-muted">
                  <i class="bi bi-journal-text me-2"></i>Status Pengumpulan
                  Tugas
                </h6>
                <div class="table-responsive">
                  <table
                    class="table table-bordered table-sm"
                    id="table-tugas-filter"
                  >
                    <thead>
                      <tr class="text-center">
                        <th>Tugas</th>
                        <th>Matematika</th>
                        <th>Fiqh</th>
                        <th>B. Arab</th>
                        <th>Aqidah</th>
                        <th>SKI</th>
                      </tr>
                    </thead>
                    <tbody id="tugas-filter-body">
                      <tr>
                        <td colspan="6" class="text-center text-muted">
                          Memuat data...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Ringkasan Nilai Semester ( UAS ) - Paling Bawah -->
              <div class="card-white mt-4 border-primary">
                <h6 class="fw-bold mb-3 text-primary">
                  <i class="bi bi-award me-2"></i>Ringkasan Nilai Semester ( UAS
                  )
                </h6>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th>Mapel</th>
                        <th class="text-center">Nilai UAS</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody id="nilai-siswa-body"></tbody>
                  </table>
                </div>
                <div class="mt-3 p-3 bg-primary bg-opacity10 rounded">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>Rata-rata Nilai UAS:</strong>
                      <span
                        class="fs-4 fw-bold text-primary ms-2"
                        id="rerata-uas"
                        >0.0</span
                      >
                    </div>
                    <div>
                      <span class="badge bg-success fs-6" id="status-uas"
                        >Lulus</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/main.js"></script>
  </body>
</html>
