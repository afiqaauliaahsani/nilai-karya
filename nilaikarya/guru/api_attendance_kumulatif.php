<?php

include "../service/database.php";
session_start();
header('Content-Type: application/json');

$user_id = $_SESSION['id'] ?? null;
$kelas = $_GET['kelas'] ?? null;

if (!$user_id || !$kelas) {
    echo json_encode([]);
    exit;
}


$q_mapel = mysqli_query($db, "SELECT id FROM mapel WHERE id_guru = '$user_id' LIMIT 1");
$data_mapel = mysqli_fetch_assoc($q_mapel);
$id_mapel = $data_mapel['id'] ?? null;


$sql = "SELECT id_santri, 
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN status = 'absen' THEN 1 ELSE 0 END) as absen
        FROM absensi 
        WHERE id_santri IN (SELECT id FROM santri WHERE id_kelas = (SELECT id FROM kelas WHERE nama_kelas = '$kelas'))
        GROUP BY id_santri";

$result = mysqli_query($db, $sql);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = [
        "id_santri" => $row['id_santri'],
        "hadir" => (int)$row['hadir'],
        "izin" => (int)$row['izin'],
        "sakit" => (int)$row['sakit'],
        "absen" => (int)$row['absen']
    ];
}

echo json_encode($data);
