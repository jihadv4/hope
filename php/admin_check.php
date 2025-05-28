<?php
// Check if user is an admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    // Redirect to user dashboard if not admin
    header("Location: dashboard_user.php");
    exit();
}
?>
