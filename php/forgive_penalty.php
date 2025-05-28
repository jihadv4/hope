<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get user ID and book ID from POST data
    $user_id = isset($_POST['user_id']) ? trim($_POST['user_id']) : '';
    $book_id = isset($_POST['book_id']) ? trim($_POST['book_id']) : '';
    
    // Validate input
    if (empty($user_id) || empty($book_id)) {
        echo json_encode(['success' => false, 'message' => 'User ID and Book ID are required']);
        exit();
    }
    
    // Update penalty status to forgiven
    if (forgive_penalty($user_id, $book_id)) {
        echo json_encode(['success' => true, 'message' => 'Penalty forgiven successfully']);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error forgiving penalty']);
        exit();
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to forgive a penalty
function forgive_penalty($user_id, $book_id) {
    $penalties_path = __DIR__ . '/../data/penalties.csv';
    $penalties = [];
    $updated = false;
    
    // Read all penalties
    if (($handle = fopen($penalties_path, 'r')) !== FALSE) {
        // Get header row
        $header = fgetcsv($handle);
        $penalties[] = $header;
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 4 && $data[0] === $user_id && $data[1] === $book_id && $data[3] === '0') {
                // Update forgiven status
                $data[3] = '1';
                $updated = true;
            }
            $penalties[] = $data;
        }
        fclose($handle);
    } else {
        return false;
    }
    
    // Write back all penalties
    if (($handle = fopen($penalties_path, 'w')) !== FALSE) {
        foreach ($penalties as $penalty) {
            fputcsv($handle, $penalty);
        }
        fclose($handle);
        return $updated;
    } else {
        return false;
    }
}
?>
