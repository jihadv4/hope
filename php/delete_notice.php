<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get notice ID
    $notice_id = isset($_POST['notice_id']) ? trim($_POST['notice_id']) : '';
    
    // Validate input
    if (empty($notice_id)) {
        echo json_encode(['success' => false, 'message' => 'Notice ID is required']);
        exit();
    }
    
    // Delete notice
    if (delete_notice($notice_id)) {
        echo json_encode(['success' => true, 'message' => 'Notice deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting notice. Please try again.']);
    }
    
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to delete notice (mark as inactive)
function delete_notice($notice_id) {
    $notices_path = '../data/notices.csv';
    
    if (!file_exists($notices_path)) {
        return false;
    }
    
    $notices = [];
    $found = false;
    
    // Read all notices
    if (($handle = fopen($notices_path, 'r')) !== FALSE) {
        $header = fgetcsv($handle);
        $notices[] = $header;
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 6) {
                if ($data[0] === $notice_id) {
                    $data[5] = 'inactive'; // Mark as inactive
                    $found = true;
                }
                $notices[] = $data;
            }
        }
        fclose($handle);
    }
    
    if (!$found) {
        return false;
    }
    
    // Write back to file
    if (($handle = fopen($notices_path, 'w')) !== FALSE) {
        foreach ($notices as $notice) {
            fputcsv($handle, $notice);
        }
        fclose($handle);
        return true;
    }
    
    return false;
}
?>