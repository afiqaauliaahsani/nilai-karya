<?php

include "../service/database.php";
session_start();
header('Content-Type: application/json');

$user_id = $_SESSION['id'];
$kelas = $_GET['kelas'] ?? null;

if (!$kelas) {
    echo json_encode([]);
    exit;
}



$q_mapel = mysqli_query($db, "
    SELECT m.id 
    FROM mapel m
    JOIN kelas k ON m.id_kelas = k.id
    WHERE m.id_guru = '$user_id' AND k.nama_kelas = '$kelas'
    LIMIT 1
");

$res_mapel = mysqli_fetch_assoc($q_mapel);
$id_mapel = $res_mapel['id'] ?? null;


if (!$id_mapel) {
    echo json_encode([]);
    exit;
}


$sql = "SELECT id_santri, 
        ((tugas1+tugas2+tugas3+tugas4+tugas5+tugas6+tugas7+tugas8)/8) as avg_tugas,
        uts, 
        uas
        FROM nilai 
        WHERE id_mapel = '$id_mapel'";

$result = mysqli_query($db, $sql);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {

    $avg_tugas = (float)$row['avg_tugas'];
    $uts = (float)$row['uts'];
    $uas = (float)$row['uas'];

    $final = ($avg_tugas + $uts + $uas) / 3;

    $data[] = [
        "id_santri" => $row['id_santri'],
        "rerata_mapel" => round($final, 1)
    ];
}

echo json_encode($data);
