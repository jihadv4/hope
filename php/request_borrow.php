<?php
session_start();
require_once 'auth_check.php';
require_once 'get_user_penalties.php';

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
    $user_name = $_SESSION['user_name'];
    
    // Check user's borrowing capacity
    $capacity = get_borrowing_capacity($user_id);
    
    // Check if user has active penalties
    if ($capacity['penalty_count'] > 0) {
        $remaining = $capacity['current_capacity'];
        $penalty_message = $capacity['penalty_count'] == 1 ? 
            "You have 1 overdue book penalty." : 
            "You have {$capacity['penalty_count']} overdue book penalties.";
        
        if ($remaining == 0) {
            echo json_encode([
                'success' => false, 
                'message' => "You cannot borrow any more books. $penalty_message Please return your overdue books or contact the librarian."
            ]);
            exit();
        }
    }
    
    // Check if user has already borrowed the maximum allowed books
    $borrowed_count = count_borrowed_books($user_id);
    if ($borrowed_count >= $capacity['current_capacity']) {
        $penalty_message = $capacity['penalty_count'] > 0 ? 
            " Your borrowing capacity is reduced due to overdue books." : 
            "";
        echo json_encode([
            'success' => false, 
            'message' => "You have already borrowed the maximum of {$capacity['current_capacity']} books.$penalty_message"
        ]);
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
    
    // Check if user has already requested or borrowed this book
    if (has_book_request($user_id, $book_id)) {
        echo json_encode(['success' => false, 'message' => 'You have already requested or borrowed this book']);
        exit();
    }
    
    // Create borrow request
    $request_date = date('Y-m-d');
    $due_date = date('Y-m-d', strtotime('+14 days'));
    
    // Add to borrowed_books.csv with status 'pending'
    if (($handle = fopen('../data/borrowed_books.csv', 'a')) !== FALSE) {
        fputcsv($handle, [$user_id, $book_id, $request_date, $due_date, 'pending']);
        fclose($handle);
        
        echo json_encode(['success' => true, 'message' => 'Borrow request submitted successfully']);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating borrow request']);
        exit();
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to count how many books a user has borrowed
function count_borrowed_books($user_id) {
    $count = 0;
    if (($handle = fopen('../data/borrowed_books.csv', 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && ($data[4] === 'approved' || $data[4] === 'pending')) {
                $count++;
            }
        }
        fclose($handle);
    }
    return $count;
}

// Function to check if user has already requested or borrowed a book
function has_book_request($user_id, $book_id) {
    if (($handle = fopen('../data/borrowed_books.csv', 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && 
                ($data[4] === 'approved' || $data[4] === 'pending')) {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    return false;
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
?>
