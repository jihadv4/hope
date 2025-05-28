<?php
session_start();
require_once 'auth_check.php';

// Function to get user penalties
function get_user_penalties($user_id = null) {
    $penalties_path = __DIR__ . '/../data/penalties.csv';
    $penalties = [];
    
    if (file_exists($penalties_path)) {
        if (($handle = fopen($penalties_path, 'r')) !== FALSE) {
            // Skip header row
            fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) >= 4) {
                    // If user_id is provided, only get penalties for that user
                    if ($user_id === null || $data[0] === $user_id) {
                        $penalties[] = [
                            'user_id' => $data[0],
                            'book_id' => $data[1],
                            'penalty_date' => $data[2],
                            'forgiven' => $data[3]
                        ];
                    }
                }
            }
            fclose($handle);
        }
    }
    
    return $penalties;
}

// Function to get user's active penalties (not forgiven)
function get_active_penalties($user_id) {
    $penalties = get_user_penalties($user_id);
    $active_penalties = [];
    
    foreach ($penalties as $penalty) {
        if ($penalty['forgiven'] == '0') {
            $active_penalties[] = $penalty;
        }
    }
    
    return $active_penalties;
}

// Function to get user's borrowing capacity
function get_borrowing_capacity($user_id) {
    $max_capacity = 3; // Default maximum borrowing capacity
    $active_penalties = get_active_penalties($user_id);
    $penalty_count = count($active_penalties);
    
    // Each penalty reduces capacity by 1
    $current_capacity = max(0, $max_capacity - $penalty_count);
    
    return [
        'max_capacity' => $max_capacity,
        'current_capacity' => $current_capacity,
        'penalty_count' => $penalty_count,
        'penalties' => $active_penalties
    ];
}

// If this file is accessed directly, return the user's penalties
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : $_SESSION['user_id'];
    
    // Check if admin is requesting another user's penalties
    if ($user_id != $_SESSION['user_id'] && $_SESSION['user_role'] != 'admin') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }
    
    $capacity = get_borrowing_capacity($user_id);
    
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'capacity' => $capacity]);
    exit();
}
?>
