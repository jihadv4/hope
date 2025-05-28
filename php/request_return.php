<?php
session_start();
require_once 'auth_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get book ID from POST data
    $book_id = isset($_POST['book_id']) ? trim($_POST['book_id']) : '';
    
    // Validate input
    if (empty($book_id)) {
        echo json_encode(['success' => false, 'message' => 'Book ID is required']);
        exit();
    }
    
    // Get user ID from session
    $user_id = $_SESSION['user_id'];
    
    // Check if user has borrowed this book
    $borrowed_book = get_borrowed_book($user_id, $book_id);
    if (!$borrowed_book) {
        echo json_encode(['success' => false, 'message' => 'You have not borrowed this book']);
        exit();
    }
    
    if ($borrowed_book['status'] !== 'approved') {
        echo json_encode(['success' => false, 'message' => 'This book is not currently borrowed by you']);
        exit();
    }
    
    // Update status to 'return_pending'
    if (update_borrow_status($user_id, $book_id, 'return_pending')) {
        echo json_encode(['success' => true, 'message' => 'Return request submitted successfully']);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating return request']);
        exit();
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to get borrowed book details
function get_borrowed_book($user_id, $book_id) {
    if (($handle = fopen('../data/borrowed_books.csv', 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id) {
                $borrowed_book = [
                    'user_id' => $data[0],
                    'book_id' => $data[1],
                    'borrow_date' => $data[2],
                    'due_date' => $data[3],
                    'status' => $data[4]
                ];
                fclose($handle);
                return $borrowed_book;
            }
        }
        fclose($handle);
    }
    return null;
}

// Function to update borrow status
function update_borrow_status($user_id, $book_id, $new_status) {
    $borrowed_books = [];
    $updated = false;
    
    // Read all borrowed books
    if (($handle = fopen('../data/borrowed_books.csv', 'r')) !== FALSE) {
        // Get header row
        $header = fgetcsv($handle);
        $borrowed_books[] = $header;
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id) {
                // Update status
                $data[4] = $new_status;
                $updated = true;
            }
            $borrowed_books[] = $data;
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
        return $updated;
    } else {
        return false;
    }
}
?>
