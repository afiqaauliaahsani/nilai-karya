<?php
include "../service/database.php";
session_start();






if (!isset($_SESSION['id'])) {
    header("location: ../index.php");
    exit;
}

$user_id = $_SESSION['id'];


$query_mapel = mysqli_query($db, "SELECT nama_mapel FROM mapel WHERE id_guru = '$user_id'");
$data_mapel = mysqli_fetch_assoc($query_mapel);
$nama_mapel = ($data_mapel) ? $data_mapel['nama_mapel'] : "Guru Umum";


$query_wali = mysqli_query($db, "SELECT * FROM kelas WHERE wali_kelas_id = '$user_id'");
$is_wali = mysqli_num_rows($query_wali) > 0;
$nama_kelas_perwalian = "";
if ($is_wali) {
    $row_wali = mysqli_fetch_assoc($query_wali);
    $nama_kelas_perwalian = $row_wali['nama_kelas'];
}

$query_diampu = mysqli_query($db, "
    SELECT DISTINCT k.nama_kelas 
    FROM mapel m 
    JOIN kelas k ON m.id_kelas = k.id 
    WHERE m.id_guru = '$user_id'
");

$list_kelas = [];
while ($rk = mysqli_fetch_assoc($query_diampu)) {
    $list_kelas[] = $rk['nama_kelas'];
}

$teks_kelas_diampu = (!empty($list_kelas)) ? implode(", ", $list_kelas) : "-";
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Madrasah Hub - Dashboard Guru</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-bootstrap-4/bootstrap-4.css" rel="stylesheet">

<style>
    /* 1. Sembunyikan bulatan asli */
    input[type="radio"][name^="absensi_"] {
        display: none;
    }

    /* 2. Styling Shape (Label) saat kondisi NORMAL */
    .btn-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 25px;
        border: 1px solid #dee2e6;
        border-radius: 20px; /* Membuat bentuk kapsul/shape */
        cursor: pointer;
        transition: all 0.2s ease;
        color: #6c757d;
        background-color: #fff;
    }

    /* 3. Styling Shape SAAT DIPILIH (Checked) */
    input[value="hadir"]:checked + .btn-status.hadir { background-color: #198754; color: white; border-color: #198754; }
    input[value="izin"]:checked + .btn-status.izin { background-color: #ffc107; color: white; border-color: #ffc107; }
    input[value="sakit"]:checked + .btn-status.sakit { background-color: #0dcaf0; color: white; border-color: #0dcaf0; }
    input[value="absen"]:checked + .btn-status.absen { background-color: #dc3545; color: white; border-color: #dc3545; }

    /* Efek hover biar keren */
    .btn-status:hover {
        border-color: #adb5bd;
        background-color: #f8f9fa;
    }
</style>
</head>

<body>
    <div id="loading-overlay">
        <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div id="view-guru">
        <div class="top-nav-mobile shadow-sm">
            <button class="btn btn-light" onclick="app.toggleSidebar()"><i class="bi bi-list fs-4"></i></button>
            <h6 class="fw-bold mb-0">Madrasah Hub</h6>
            <div style="width: 40px;"></div>
        </div>

        <aside class="sidebar shadow" id="main-sidebar">
            <div class="sidebar-brand">
                <div class="brand-logo"><i class="bi bi-mortarboard-fill"></i></div>
                <div class="lh-1">
                    <h6 class="mb-0 fw-bold text-white">MADRASAH HUB</h6>
                    <small style="font-size: 0.6rem; opacity: 0.6; color: white;">BABUL KHAER</small>
                </div>
                <button class="btn d-lg-none ms-auto text-white" onclick="app.toggleSidebar()"><i class="bi bi-x-lg"></i></button>
            </div>

            <div class="sidebar-section-title">Dashboard Utama</div>
            <a href="#" class="sidebar-link active" data-section="dashboard" onclick="app.setSection('dashboard')"><i class="bi bi-grid-1x2"></i> Dashboard</a>

            <div class="sidebar-section-title">Menu Guru Mapel</div>
          <select class="form-select form-select-sm class-selector" id="sidebar-class-select" onchange="app.changeClass(this.value)">
            <option value="">Pilih Kelas</option>
            <?php

            $query_select_kelas = mysqli_query($db, "
                SELECT DISTINCT k.nama_kelas 
                FROM mapel m 
                JOIN kelas k ON m.id_kelas = k.id 
                WHERE m.id_guru = '$user_id'
            ");
while ($row = mysqli_fetch_assoc($query_select_kelas)) {
    echo "<option value='".$row['nama_kelas']."'>Kelas ".$row['nama_kelas']."</option>";
}
?>
        </select>
            <a href="#" id="sidebar-link-detail" class="sidebar-link submenu disabled" data-section="detail-mapel" onclick="app.goToClassDetail(false)" aria-disabled="true" style="pointer-events: none; opacity: 0.6;">
                <i class="bi bi-info-circle"></i> Detail Kelas
            </a>
            <a href="#" id="sidebar-link-attendance" class="sidebar-link submenu disabled" data-section="attendance" onclick="app.setSection('attendance')" aria-disabled="true" style="pointer-events: none; opacity: 0.6;">
                <i class="bi bi-calendar2-check"></i> Input Absensi
            </a>

            <a href="#" id="sidebar-link-tasks" class="sidebar-link submenu disabled" data-section="tasks" onclick="app.setSection('tasks')" aria-disabled="true" style="pointer-events: none; opacity: 0.6;">
                <i class="bi bi-journal-text"></i> Input Nilai
            </a>

            <div id="menu-wali-kelas" class="<?php echo ($is_wali) ? '' : 'd-none'; ?>">
                <div class="sidebar-section-title">Menu Wali Kelas (<?php echo $nama_kelas_perwalian; ?>)</div>
                <a href="#" class="sidebar-link" data-section="detail-wali" onclick="app.goToClassDetail(true)">
                    <i class="bi bi-info-circle"></i> Detail Kelas
                </a>
                <a href="#" class="sidebar-link" data-section="nilai-gabungan" onclick="app.setSection('nilai-gabungan')">
                    <i class="bi bi-table"></i> Rekap Nilai Gabungan
                </a>
                <a href="#" class="sidebar-link" data-section="absensi-kumulatif" onclick="app.setSection('absensi-kumulatif')">
                    <i class="bi bi-calendar-range"></i> Monitoring Absensi
                </a>
            </div>

            <div class="mt-auto p-3 w-100" style="position: absolute; bottom: 0;">
                <a href="#" class="sidebar-link text-danger" onclick="window.location.href='../index.php'"><i class="bi bi-box-arrow-left"></i> Logout</a>
                <div class="text-center mt-2" style="font-size: 0.6rem; opacity: 0.4; color: white;">@afiqaauliaaaa_</div>
        </aside>

        <main class="main-content">
            <!-- Dashboard Content -->
            <div id="section-dashboard">
                <div class="hero-banner shadow-sm">
                    <span class="badge bg-white bg-opacity-25 mb-2">Portal Akademik Madrasah</span>
                    <h1 class="fw-bold mb-1">
                        Assalamu'alaikum, 
                        <span id="teacher-name">
                            <?php
    $sapaan = ($_SESSION['gender'] == 'P') ? "Ustadzah" : "Ustadz";
echo $sapaan . " " . $_SESSION['nama'];
?>
                        </span>
                    </h1>                    

                    <p class="mb-4 opacity-75"><i class="bi bi-geo-alt-fill me-1"></i> Madrasah Aliyah Babul Khaer • Tahun Ajaran 2026/2027</p>

                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="card-stats">
                            <small class="opacity-75 d-block mb-1"><i class="bi bi-person-badge me-1"></i> Wali Kelas</small>
                            <h5 class="fw-bold mb-0"><?php echo ($is_wali) ? $nama_kelas_perwalian : "-"; ?></h5>
                            <small class="text-white-50" style="font-size: 0.7rem;"><?php echo ($is_wali) ? "Kelas Perwalian Aktif" : "Bukan Wali Kelas"; ?></small>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="card-stats">
                            <small class="opacity-75 d-block mb-1"><i class="bi bi-book me-1"></i> Mata Pelajaran</small>
                            <h5 class="fw-bold mb-0"><?php echo $nama_mapel; ?></h5>
                            <small class="text-white-50" style="font-size: 0.7rem;">Mata Pelajaran Utama</small>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card-stats">
                            <small class="opacity-75 d-block mb-1"><i class="bi bi-people me-1"></i> Kelas Diampu</small>
                            <h5 class="fw-bold mb-0"><?php echo $teks_kelas_diampu; ?></h5>
                            <small class="text-white-50" style="font-size: 0.7rem;">Total <?php echo count($list_kelas); ?> Kelas Aktif</small>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card-stats bg-danger bg-opacity-50">
                            <small class="opacity-75 d-block mb-1"><i class="bi bi-exclamation-triangle me-1"></i> Perlu Atensi</small>
                            <h5 class="fw-bold mb-0">0 Santri</h5>
                            <small class="text-white-50" style="font-size: 0.7rem;">Data dari Database</small>
                        </div>
                    </div>
                </div>

                </div>

                <div class="row g-4">
                    <div class="col-lg-7">
                        <div class="card-white h-100">
                            <h6 class="fw-bold mb-4"><i class="bi bi-graph-up me-2 text-primary"></i>Ikhtisar Performa Kelas</h6>
                            <div class="chart-container" style="position: relative; height:300px;">
                                <canvas id="chartGuruDashboard"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-5">
                        <div class="card-white h-100">
                            <h6 class="fw-bold mb-4 text-danger"><i class="bi bi-person-exclamation me-2"></i>Santri Perlu Perhatian</h6>
                            <div id="attention-list">
                                <div class="student-item">
                                    <img src="https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=f1f5f9" class="avatar" alt="Ahmad">
                                    <div class="flex-grow-1">
                                        <div class="fw-bold small">Ahmad Fauzi</div>
                                        <div class="text-muted" style="font-size: 0.7rem;">Kelas XA</div>
                                    </div>
                                    <span class="badge-alert">Absensi < 80%</span>
                                </div>
                                <div class="student-item">
                                    <img src="https://ui-avatars.com/api/?name=Budi+Santoso&background=f1f5f9" class="avatar" alt="Budi">
                                    <div class="flex-grow-1">
                                        <div class="fw-bold small">Budi Santoso</div>
                                        <div class="text-muted" style="font-size: 0.7rem;">Kelas XB</div>
                                    </div>
                                    <span class="badge-alert">Absensi < 80%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Management Section -->
            <div id="section-management" class="d-none">
                <div class="mb-4">
                    <h3 class="fw-bold mb-1" id="management-title">
                        Manajemen Data <span id="active-class-label" class="fw-normal text-primary">(Pilih Kelas)</span>
                    </h3>
                    <p class="text-muted small">Update data untuk kelas yang dipilih di sidebar</p>
                </div>

                <div class="card-white mb-4">
                    <div class="row align-items-center g-3">
                        <div class="col-md-auto" id="attendance-controls">
                            <label class="text-muted small fw-medium me-2">Pilih Tanggal:</label>
                            <div class="input-group input-group-sm d-inline-flex w-auto">
                                <span class="input-group-text bg-white border-end-0"><i class="bi bi-calendar3"></i></span>
                                <input type="date" class="form-control border-start-0 ps-0" id="attendance-date">
                            </div>
                        </div>
                        <div class="col-md-auto" id="task-global-controls">
                            <label class="text-muted small fw-medium me-2">Pilih Tugas:</label>
                            <select class="form-select form-select-sm d-inline-block w-auto global-task-select" id="task-select" onchange="app.changeTask(this.value)">
                                <option value="0">Tugas 1</option>
                                <option value="1">Tugas 2</option>
                                <option value="2">Tugas 3</option>
                                <option value="3">Tugas 4</option>
                                <option value="4">Tugas 5</option>
                                <option value="5">Tugas 6</option>
                                <option value="6">Tugas 7</option>
                                <option value="7">Tugas 8</option>
                            </select>
                        </div>
                        <div class="col-md-auto ms-auto">
                            <button class="btn btn-outline-primary btn-export" onclick="app.exportExcel('nilai-gabungan')"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Export Nilai</button>
                            <button class="btn btn-outline-secondary btn-export" onclick="app.exportPDF('nilai-gabungan')"><i class="bi bi-file-earmark-pdf me-2"></i>Export PDF</button>
                        </div>
                    </div>
                </div>

                <div class="card-white mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-bold mb-0">Tabel Data</h6>
                        <button class="btn btn-primary btn-sm" id="btn-save" onclick="app.saveData()"><i class="bi bi-floppy me-2"></i> Simpan Absensi</button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead>
                                <tr id="table-head-row"></tr>
                            </thead>
                            <tbody id="management-table-body"></tbody>
                        </table>
                    </div>
                </div>

            </div>

            <!-- Class Detail (Guru Mapel) -->
            <div id="section-class-detail-mapel" class="d-none">
                <div class="mb-4">
                    <h3 class="fw-bold mb-1">Detail Kelas <span id="detail-kelas-name"></span></h3>
                    <p class="text-muted small">Jumlah siswa: <span id="detail-total-siswa"></span></p>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Rata-rata Nilai</small>
                                    <div class="fs-4 fw-bold" id="detail-rerata-kelas">-</div>
                                </div>
                                <i class="bi bi-bar-chart fs-2 text-primary"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Rata-rata Absensi</small>
                                    <div class="fs-4 fw-bold" id="detail-absensi">-</div>
                                </div>
                                <i class="bi bi-calendar-check fs-2 text-success"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Perlu Perhatian</small>
                                    <div class="fs-4 fw-bold" id="detail-perlu-perhatian">-</div>
                                </div>
                                <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="card-white h-100">
                            <h6 class="fw-bold mb-3">Distribusi Nilai Rata-Rata</h6>
                            <div class="chart-container" style="height:250px;">
                                <canvas id="chartClassDetail"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card-white h-100">
                            <h6 class="fw-bold mb-3">Status Kehadiran Kelas</h6>
                            <div class="chart-container" style="height:250px;">
                                <canvas id="chartAttendanceDetail"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-3 my-4">
                    <button id="btn-detail-absensi" class="btn btn-outline-primary btn-lg flex-fill" onclick="app.setSection('attendance')" disabled><i class="bi bi-calendar2-check me-2"></i>Input Absensi</button>
                    <button id="btn-detail-nilai" class="btn btn-outline-primary btn-lg flex-fill" onclick="app.setSection('tasks')" disabled><i class="bi bi-journal-text me-2"></i>Input Nilai</button>
                </div>

                <div class="card-white mt-4">
                    <h6 class="fw-bold mb-3">Santri Perlu Perhatian</h6>
                    <div id="detail-attention-list">
                        <p class="mb-0 text-muted">Pilih kelas untuk melihat detail.</p>
                    </div>
                </div>
            </div>

            <!-- Class Detail (Wali Kelas) -->
            <div id="section-class-detail-wali" class="d-none">
                <div class="mb-4">
                    <h3 class="fw-bold mb-1">Detail Kelas Wali <span id="detail-kelas-name-wali"></span></h3>
                    <p class="text-muted small">Jumlah siswa: <span id="detail-total-siswa-wali"></span></p>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Rata-rata Nilai</small>
                                    <div class="fs-4 fw-bold" id="detail-rerata-kelas-wali">-</div>
                                </div>
                                <i class="bi bi-bar-chart fs-2 text-primary"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Rata-rata Absensi</small>
                                    <div class="fs-4 fw-bold" id="detail-absensi-wali">-</div>
                                </div>
                                <i class="bi bi-calendar-check fs-2 text-success"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-white p-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">Perlu Perhatian</small>
                                    <div class="fs-4 fw-bold" id="detail-perlu-perhatian-wali">-</div>
                                </div>
                                <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-white mt-4">
                    <h6 class="fw-bold mb-3">Santri Perlu Perhatian</h6>
                    <div id="detail-attention-list-wali">
                        <p class="mb-0 text-muted">Pilih kelas wali untuk melihat detail.</p>
                    </div>
                </div>
            </div>

            <!-- Nilai Gabungan -->
            <div id="section-nilai-gabungan" class="d-none">
                <div class="mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    <div>
                        <h3 class="fw-bold mb-1">Rekap Nilai Gabungan</h3>
                        <p class="text-muted small">Nilai gabungan per mata pelajaran untuk kelas yang dipilih.</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" onclick="app.exportExcel('nilai-gabungan')"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export Excel</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="app.exportPDF('nilai-gabungan')"><i class="bi bi-file-earmark-pdf me-1"></i>Export PDF</button>
                    </div>
                </div>

                <div class="card-white">
                    <div class="table-responsive">
                        <table class="table table-bordered table-wali table-hover">
                            <thead>
                                <tr class="text-center">
                                    <th>No</th>
                                    <th>NIS</th>
                                    <th>Nama Santri</th>
                                    <th>Matematika</th>
                                    <th>Fiqh</th>
                                    <th>B. Arab</th>
                                    <th>Aqidah</th>
                                    <th>SKI</th>
                                    <th>Rerata</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody id="nilai-gabungan-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Absensi Kumulatif -->
            <div id="section-absensi-kumulatif" class="d-none">
                <div class="mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    <div>
                        <h3 class="fw-bold mb-1">Monitoring Absensi Kumulatif</h3>
                        <p class="text-muted small">Pantau kehadiran setiap siswa dalam satu kelas.</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" onclick="app.exportExcel('absensi-kumulatif')"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export Excel</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="app.exportPDF('absensi-kumulatif')"><i class="bi bi-file-earmark-pdf me-1"></i>Export PDF</button>
                    </div>
                </div>

                <div class="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>
                        <strong>Perhatian!</strong> Santri dengan lebih dari 3 kali ketidakhadiran (Izin/Sakit/Absen) akan ditandai dengan warna merah dan memerlukan koordinasi dengan orang tua.
                    </div>
                </div>

                <div class="card-white">
                    <div class="table-responsive">
                        <table class="table table-bordered table-wali table-hover" id="table-absensi-kumulatif">
                            <thead>
                                <tr class="text-center">
                                    <th>No</th>
                                    <th>NIS</th>
                                    <th>Nama Santri</th>
                                    <th class="bg-success bg-opacity-10">Hadir</th>
                                    <th class="bg-warning bg-opacity-10">Izin</th>
                                    <th class="bg-info bg-opacity-10">Sakit</th>
                                    <th class="bg-danger bg-opacity-10">Absen</th>
                                    <th class="bg-secondary bg-opacity-10">Total Tidak Hadir</th>
                                    <th>Persentase</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="absensi-kumulatif-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

        </main>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.7.1/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../js/data.js"></script>
    <script src="../js/main.js"></script>
    <script>
            const dataFromDB = <?php
                $query_santri = mysqli_query($db, "
                    SELECT s.id, s.nis, s.nama_lengkap as nama, k.nama_kelas as kelas 
                    FROM santri s 
                    JOIN kelas k ON s.id_kelas = k.id
                ");
$data_santri = [];
while ($s = mysqli_fetch_assoc($query_santri)) {
    $data_santri[] = $s;
}
echo json_encode($data_santri);
?>;

            
            if (typeof app !== 'undefined') {
                app.students = dataFromDB;
                console.log("Data santri asli berhasil dimuat!");
            }
        </script>
</script>
</body>
</html>
