<?php
session_start();
require_once 'auth_check.php';

// Get user ID from session
$user_id = $_SESSION['user_id'];

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

// Load borrowed books from CSV
$borrowed_books = [];
if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (count($data) >= 5 && $data[0] === $user_id) {
            $book_id = $data[1];
            $borrow_date = $data[2];
            $due_date = $data[3];
            $status = $data[4];
            
            // Get book details
            $book_details = get_book_details($book_id, $books_path);
            
            if ($book_details) {
                $borrowed_books[] = [
                    'book_id' => $book_id,
                    'title' => $book_details['title'],
                    'author' => $book_details['author'],
                    'borrow_date' => $borrow_date,
                    'due_date' => $due_date,
                    'status' => $status,
                    'days_left' => calculate_days_left($due_date)
                ];
            }
        }
    }
    fclose($handle);
    
    // Return borrowed books as JSON
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'borrowed_books' => $borrowed_books]);
    exit();
} else {
    logError("Failed to open borrowed books CSV file: $borrowed_books_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Error loading borrowed books data']);
    exit();
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

// Function to calculate days left until due date
function calculate_days_left($due_date) {
    $due = strtotime($due_date);
    $now = time();
    $diff_seconds = $due - $now;
    $diff_days = floor($diff_seconds / (60 * 60 * 24));
    return $diff_days;
}
?>
