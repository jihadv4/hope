<?php
// Check if user is a regular user
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'user') {
    // Redirect to admin dashboard if not a regular user
    header("Location: dashboard_admin.php");
    exit();
}
?>
