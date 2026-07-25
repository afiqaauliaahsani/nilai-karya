<?php

session_start();
include "service/database.php";


if (isset($_POST['login_guru'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE username='$username' AND password='$password' AND role='guru'";
    $result = $db->query($sql);

    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();


        session_unset();

        $_SESSION['id'] = $data['id'];
        $_SESSION['nama'] = $data['nama_lengkap'];
        $_SESSION['gender'] = $data['gender'];
        $_SESSION['is_login'] = true;
        $_SESSION['role'] = 'guru';

        header("location: guru/dashboard.php");
        exit;
    } else {
        echo "<script>alert('Username atau password salah!'); window.location.href='index.php';</script>";
    }
}


if (isset($_POST['login_parent'])) {
    $nis = $_POST['nis'];

    $sql = "SELECT * FROM users WHERE nis='$nis' AND role='parent'";
    $result = $db->query($sql);

    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();


        session_unset();

        $_SESSION['id'] = $data['id'];
        $_SESSION['nama_santri'] = $data['nama_lengkap'];
        $_SESSION['is_login_parent'] = true;
        $_SESSION['role'] = 'parent';

        header("location: orang-tua/dashboard.php");
        exit;
    } else {
        echo "<script>alert('NIS tidak ditemukan!'); window.location.href='index.php';</script>";
    }
}
