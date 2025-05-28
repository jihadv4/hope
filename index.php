<?php
session_start();

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    // Redirect based on user role
    if ($_SESSION['user_role'] === 'admin') {
        header("Location: dashboard_admin.php");
    } else {
        header("Location: hello.php");
    }
    exit();
} else {
    // Redirect to login page
    header("Location: login.html");
    exit();
}
?>