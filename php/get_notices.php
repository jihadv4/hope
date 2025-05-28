<?php
session_start();
require_once 'auth_check.php';

// Get notices
$notices = get_notices();
echo json_encode(['success' => true, 'notices' => $notices]);

// Function to get all active notices
function get_notices() {
    $notices_path = '../data/notices.csv';
    $notices = [];
    
    if (!file_exists($notices_path)) {
        return $notices;
    }
    
    if (($handle = fopen($notices_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 6 && $data[5] === 'active') {
                $notices[] = [
                    'id' => $data[0],
                    'title' => $data[1],
                    'content' => $data[2],
                    'date_created' => $data[3],
                    'admin_id' => $data[4],
                    'status' => $data[5]
                ];
            }
        }
        fclose($handle);
    }
    
    // Sort by date created (newest first)
    usort($notices, function($a, $b) {
        return strtotime($b['date_created']) - strtotime($a['date_created']);
    });
    
    return $notices;
}
?>