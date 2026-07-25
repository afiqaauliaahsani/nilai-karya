<?php
include "service/database.php";
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Madrasah Hub - Babul Khaer</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <div class="container min-vh-100 d-flex align-items-center justify-content-center p-3">
        <div class="card-white shadow-lg text-center" style="max-width: 420px; width: 100%;">
            <div class="mb-4">
                <div class="bg-primary d-inline-block p-3 rounded-4 text-white mb-3 shadow">
                    <i class="bi bi-mortarboard-fill fs-2"></i>
                </div>
                <h2 class="fw-bold mb-1">Madrasah Hub</h2>
                <p class="text-muted small">MA Babul Khaer - Sistem Informasi Akademik</p>
            </div>

            <ul class="nav nav-pills nav-fill mb-4 bg-light p-1 rounded-3">
                <li class="nav-item"><button class="nav-link active rounded-3" data-bs-toggle="pill" data-bs-target="#login-parent">Orang Tua</button></li>
                <li class="nav-item"><button class="nav-link rounded-3" data-bs-toggle="pill" data-bs-target="#login-guru">Guru</button></li>
            </ul>

            <div class="tab-content text-start">
                <div class="tab-pane fade show active" id="login-parent">
                    <form action="login_process.php" method="POST">
                        <input type="text" name="nis" class="form-control mb-3" placeholder="Masukkan NIS Santri" required>
                        <button type="submit" name="login_parent" class="btn btn-primary w-100 py-2 fw-bold">Cek Laporan Santri</button>
                    </form>
                </div>

                <div class="tab-pane fade" id="login-guru">
                    <form action="login_process.php" method="POST">
                        <input type="text" name="username" class="form-control mb-2" placeholder="Username" required>
                        <input type="password" name="password" class="form-control mb-3" placeholder="Password" required>
                        <button type="submit" name="login_guru" class="btn btn-dark w-100 py-2 fw-bold">Masuk Dashboard</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>