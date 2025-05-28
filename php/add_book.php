<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $book_id = isset($_POST['book_id']) ? trim($_POST['book_id']) : '';
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $author = isset($_POST['author']) ? trim($_POST['author']) : '';
    $year = isset($_POST['year']) ? trim($_POST['year']) : '';
    $semester = isset($_POST['semester']) ? trim($_POST['semester']) : '';
    $course = isset($_POST['course']) ? trim($_POST['course']) : '';
    $total_copies = isset($_POST['total_copies']) ? trim($_POST['total_copies']) : '';
    $available_copies = isset($_POST['available_copies']) ? trim($_POST['available_copies']) : '';
    
    // Validate required fields
    if (empty($book_id) || empty($title) || empty($author) || empty($year) || 
        empty($semester) || empty($course) || empty($total_copies)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    // Validate book ID is numeric
    if (!is_numeric($book_id)) {
        echo json_encode(['success' => false, 'message' => 'Book ID must be numeric']);
        exit();
    }
    
    // Validate total copies is numeric and positive
    if (!is_numeric($total_copies) || intval($total_copies) < 1) {
        echo json_encode(['success' => false, 'message' => 'Total copies must be a positive number']);
        exit();
    }
    
    // Check if book ID already exists
    if (book_id_exists($book_id)) {
        echo json_encode(['success' => false, 'message' => 'Book ID already exists']);
        exit();
    }
    
    // Add book to CSV
    if (add_book_to_csv($book_id, $title, $author, $year, $semester, $course, $total_copies, $available_copies)) {
        echo json_encode(['success' => true, 'message' => 'Book added successfully']);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding book to database']);
        exit();
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to check if book ID already exists
function book_id_exists($book_id) {
    $books_path = '../data/books.csv';
    
    if (($handle = fopen($books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 1 && $data[0] === $book_id) {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    
    return false;
}

// Function to add book to CSV
function add_book_to_csv($book_id, $title, $author, $year, $semester, $course, $total_copies, $available_copies) {
    $books_path = '../data/books.csv';
    
    // Prepare the new book data
    $new_book = [
        $book_id,
        $title,
        $author,
        $year,
        $semester,
        $course,
        $total_copies,
        $available_copies
    ];
    
    // Append to CSV file
    if (($handle = fopen($books_path, 'a')) !== FALSE) {
        $result = fputcsv($handle, $new_book);
        fclose($handle);
        return $result !== FALSE;
    }
    
    return false;
}
?>
