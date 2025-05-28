<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = isset($_POST['noticeTitle']) ? trim($_POST['noticeTitle']) : '';
    $content = isset($_POST['noticeContent']) ? trim($_POST['noticeContent']) : '';
    
    // Get admin ID from session
    $admin_id = $_SESSION['user_id'];
    
    // Validate input
    if (empty($title) || empty($content)) {
        echo json_encode(['success' => false, 'message' => 'Title and content are required']);
        exit();
    }
    
    // Check if title is too long
    if (strlen($title) > 200) {
        echo json_encode(['success' => false, 'message' => 'Title must be 200 characters or less']);
        exit();
    }
    
    // Check if content is too long
    if (strlen($content) > 1000) {
        echo json_encode(['success' => false, 'message' => 'Content must be 1000 characters or less']);
        exit();
    }
    
    // Create notice
    if (create_notice($title, $content, $admin_id)) {
        echo json_encode(['success' => true, 'message' => 'Notice added successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding notice. Please try again.']);
    }
    
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to create notice
function create_notice($title, $content, $admin_id) {
    $notices_path = '../data/notices.csv';
    
    // Create file with headers if it doesn't exist
    if (!file_exists($notices_path)) {
        file_put_contents($notices_path, "id,title,content,date_created,admin_id,status\n");
    }
    
    // Generate unique ID
    $id = uniqid();
    $date_created = date('Y-m-d H:i:s');
    $status = 'active';
    
    // Append to CSV file
    if (($handle = fopen($notices_path, 'a')) !== FALSE) {
        $data = [$id, $title, $content, $date_created, $admin_id, $status];
        fputcsv($handle, $data);
        fclose($handle);
        return true;
    }
    
    return false;
}
?>