<?php

include "../service/database.php";
session_start();
header('Content-Type: application/json');

$kelas = $_GET['kelas'] ?? null;

if (!$kelas) {
    echo json_encode([]);
    exit;
}


$sql = "SELECT id_santri, 
        AVG(((tugas1+tugas2+tugas3+tugas4+tugas5+tugas6+tugas7+tugas8)/8 + uts + uas) / 3) as rerata_total
        FROM nilai 
        WHERE id_santri IN (
            SELECT id FROM santri WHERE id_kelas = (SELECT id FROM kelas WHERE nama_kelas = '$kelas')
        )
        GROUP BY id_santri";

$result = mysqli_query($db, $sql);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = [
        "id_santri" => $row['id_santri'],
        "rerata_kumulatif" => round((float)$row['rerata_total'], 1)
    ];
}

echo json_encode($data);
