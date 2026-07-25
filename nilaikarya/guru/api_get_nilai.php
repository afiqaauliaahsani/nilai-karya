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


$sql = "SELECT n.*, s.id as id_santri 
        FROM santri s
        JOIN kelas k ON s.id_kelas = k.id
        LEFT JOIN nilai n ON s.id = n.id_santri AND n.id_mapel = '$id_mapel'
        WHERE k.nama_kelas = '$kelas'";

$result = mysqli_query($db, $sql);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {

    $tugas = [
        (int)($row['tugas1'] ?? 0), (int)($row['tugas2'] ?? 0),
        (int)($row['tugas3'] ?? 0), (int)($row['tugas4'] ?? 0),
        (int)($row['tugas5'] ?? 0), (int)($row['tugas6'] ?? 0),
        (int)($row['tugas7'] ?? 0), (int)($row['tugas8'] ?? 0)
    ];

    $data[] = [
        "id_santri" => $row['id_santri'],
        "tugas" => $tugas,
        "uts" => (int)($row['uts'] ?? 0),
        "uas" => (int)($row['uas'] ?? 0)
    ];
}

echo json_encode($data);
