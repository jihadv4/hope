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
    
    // Check if book is available
    $book = get_book_details($book_id);
    if (!$book) {
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit();
    }
    
    if (intval($book['available_copies']) <= 1) {
        echo json_encode(['success' => false, 'message' => 'This book has only one copy left and cannot be borrowed']);
        exit();
    }
    
    // Update borrow status to 'approved'
    if (!update_borrow_status($user_id, $book_id, 'approved')) {
        echo json_encode(['success' => false, 'message' => 'Error approving borrow request']);
        exit();
    }
    
    // Decrement available copies
    if (!update_book_copies($book_id, intval($book['available_copies']) - 1)) {
        echo json_encode(['success' => false, 'message' => 'Error updating book copies']);
        exit();
    }
    
    echo json_encode(['success' => true, 'message' => 'Borrow request approved successfully']);
    exit();
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to get book details by ID
function get_book_details($book_id) {
    if (($handle = fopen('../data/books.csv', 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 8 && $data[0] === $book_id) {
                $book = [
                    'book_id' => $data[0],
                    'title' => $data[1],
                    'author' => $data[2],
                    'year' => $data[3],
                    'semester' => $data[4],
                    'course' => $data[5],
                    'total_copies' => $data[6],
                    'available_copies' => $data[7]
                ];
                fclose($handle);
                return $book;
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
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'pending') {
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

// Function to update book copies
function update_book_copies($book_id, $new_available_copies) {
    $books = [];
    $updated = false;
    
    // Read all books
    if (($handle = fopen('../data/books.csv', 'r')) !== FALSE) {
        // Get header row
        $header = fgetcsv($handle);
        $books[] = $header;
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 8 && $data[0] === $book_id) {
                // Update available copies
                $data[7] = $new_available_copies;
                $updated = true;
            }
            $books[] = $data;
        }
        fclose($handle);
    } else {
        return false;
    }
    
    // Write back all books
    if (($handle = fopen('../data/books.csv', 'w')) !== FALSE) {
        foreach ($books as $book) {
            fputcsv($handle, $book);
        }
        fclose($handle);
        return $updated;
    } else {
        return false;
    }
}
?>
