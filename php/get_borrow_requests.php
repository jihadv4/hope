<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Error logging function
function logError($message) {
    $log_dir = __DIR__ . '/../logs';
    if (!file_exists($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $log_file = $log_dir . '/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message\n";
    error_log($log_message, 3, $log_file);
}

// Use absolute paths with __DIR__
$borrowed_books_path = __DIR__ . '/../data/borrowed_books.csv';
$books_path = __DIR__ . '/../data/books.csv';
$users_path = __DIR__ . '/../data/users.csv';

// Check if files exist
if (!file_exists($borrowed_books_path)) {
    logError("Borrowed books CSV file not found: $borrowed_books_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Borrowed books data file not found']);
    exit();
}

if (!file_exists($books_path)) {
    logError("Books CSV file not found: $books_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Books data file not found']);
    exit();
}

if (!file_exists($users_path)) {
    logError("Users CSV file not found: $users_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Users data file not found']);
    exit();
}

// Load borrow requests from CSV
$borrow_requests = [];
if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (count($data) >= 5 && $data[4] === 'pending') {
            $user_id = $data[0];
            $book_id = $data[1];
            $borrow_date = $data[2];
            $due_date = $data[3];
            
            // Get user details
            $user_name = get_user_name($user_id, $users_path);
            
            // Get book details
            $book_details = get_book_details($book_id, $books_path);
            
            if ($user_name && $book_details) {
                $borrow_requests[] = [
                    'user_id' => $user_id,
                    'user_name' => $user_name,
                    'book_id' => $book_id,
                    'book_title' => $book_details['title'],
                    'book_author' => $book_details['author'],
                    'request_date' => $borrow_date,
                    'due_date' => $due_date
                ];
            }
        }
    }
    fclose($handle);
    
    // Return borrow requests as JSON
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'borrow_requests' => $borrow_requests]);
    exit();
} else {
    logError("Failed to open borrowed books CSV file: $borrowed_books_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Error loading borrow requests data']);
    exit();
}

// Function to get user name by ID
function get_user_name($user_id, $users_path) {
    if (($handle = fopen($users_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 3 && $data[0] === $user_id) {
                $name = $data[1];
                fclose($handle);
                return $name;
            }
        }
        fclose($handle);
    }
    return null;
}

// Function to get book details by ID
function get_book_details($book_id, $books_path) {
    if (($handle = fopen($books_path, 'r')) !== FALSE) {
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
?>
