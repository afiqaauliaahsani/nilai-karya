<?php

include "../service/database.php";
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['id'];
    $id_santri = $_POST['id_santri'];


    $q_mapel = mysqli_query($db, "SELECT id FROM mapel WHERE id_guru = '$user_id' LIMIT 1");
    $id_mapel = mysqli_fetch_assoc($q_mapel)['id'];


    $t1 = $_POST['tugas1'] ?? 0;
    $t2 = $_POST['tugas2'] ?? 0;
    $t3 = $_POST['tugas3'] ?? 0;
    $t4 = $_POST['tugas4'] ?? 0;
    $t5 = $_POST['tugas5'] ?? 0;
    $t6 = $_POST['tugas6'] ?? 0;
    $t7 = $_POST['tugas7'] ?? 0;
    $t8 = $_POST['tugas8'] ?? 0;
    $uts = $_POST['uts'] ?? 0;
    $uas = $_POST['uas'] ?? 0;

    $sql = "INSERT INTO nilai (id_santri, id_mapel, tugas1, tugas2, tugas3, tugas4, tugas5, tugas6, tugas7, tugas8, uts, uas) 
            VALUES ('$id_santri', '$id_mapel', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$uts', '$uas')
            ON DUPLICATE KEY UPDATE 
            tugas1='$t1', tugas2='$t2', tugas3='$t3', tugas4='$t4', tugas5='$t5', tugas6='$t6', tugas7='$t7', tugas8='$t8', uts='$uts', uas='$uas'";

    if (mysqli_query($db, $sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($db)]);
    }
}
