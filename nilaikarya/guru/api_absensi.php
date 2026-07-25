<?php

include "../service/database.php";
session_start();


header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['id'] ?? null;
    $id_santri = $_POST['id_santri'] ?? null;
    $tanggal = $_POST['tanggal'] ?? null;
    $status = $_POST['status'] ?? null;
    $catatan = $_POST['catatan'] ?? '';

    if (!$user_id || !$id_santri || !$tanggal || !$status) {
        echo json_encode(["success" => false, "error" => "Data tidak lengkap"]);
        exit;
    }


    $query_mapel = mysqli_query($db, "SELECT id FROM mapel WHERE id_guru = '$user_id' LIMIT 1");
    $data_mapel = mysqli_fetch_assoc($query_mapel);
    $id_mapel = $data_mapel['id'] ?? null;

    if (!$id_mapel) {
        echo json_encode(["success" => false, "error" => "Mapel tidak ditemukan"]);
        exit;
    }


    $sql = "INSERT INTO absensi (id_santri, id_mapel, tanggal, status, catatan) 
            VALUES ('$id_santri', '$id_mapel', '$tanggal', '$status', '$catatan')
            ON DUPLICATE KEY UPDATE status = '$status', catatan = '$catatan'";

    if (mysqli_query($db, $sql)) {
        echo json_encode(["success" => true, "message" => "Berhasil disimpan"]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($db)]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Metode harus POST"]);
}
