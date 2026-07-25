<?php

include "../service/database.php";
session_start();


header('Content-Type: application/json');


$tanggal = $_GET['tanggal'] ?? null;
$user_id = $_SESSION['id'] ?? null;

if (!$tanggal || !$user_id) {
    echo json_encode([]);
    exit;
}


$q_mapel = mysqli_query($db, "SELECT id FROM mapel WHERE id_guru = '$user_id' LIMIT 1");
$data_mapel = mysqli_fetch_assoc($q_mapel);
$id_mapel = $data_mapel['id'] ?? null;

if (!$id_mapel) {
    echo json_encode([]);
    exit;
}


$sql = "SELECT id_santri, status, catatan FROM absensi 
        WHERE tanggal = '$tanggal' AND id_mapel = '$id_mapel'";

$result = mysqli_query($db, $sql);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}


echo json_encode($data);
