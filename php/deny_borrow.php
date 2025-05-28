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
    
    // Remove borrow request
    if (remove_borrow_request($user_id, $book_id)) {
        echo json_encode(['success' => true, 'message' => 'Borrow request denied successfully']);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error denying borrow request']);
        exit();
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to remove borrow request
function remove_borrow_request($user_id, $book_id) {
    $borrowed_books = [];
    $removed = false;
    
    // Read all borrowed books
    if (($handle = fopen('../data/borrowed_books.csv', 'r')) !== FALSE) {
        // Get header row
        $header = fgetcsv($handle);
        $borrowed_books[] = $header;
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'pending') {
                // Skip this row (remove it)
                $removed = true;
            } else {
                $borrowed_books[] = $data;
            }
        }
        fclose($handle);
    } else {
        return false;
    }
    
    // Write back all borrowed books
    if (($handle = fopen('../data/borrowed_books.csv', 'w')) !== FALSE) {
        foreach ($borrowed_books as $book) {
            fputcsv($handle, $book);
        }
        fclose($handle);
        return $removed;
    } else {
        return false;
    }
}
?>
