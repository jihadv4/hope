<?php
session_start();
require_once 'auth_check.php';
require_once 'user_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $book_id = isset($_POST['book_id']) ? trim($_POST['book_id']) : '';
    $reason = isset($_POST['reason']) ? trim($_POST['reason']) : '';
    
    // Get user ID from session
    $user_id = $_SESSION['user_id'];
    
    // Validate input
    if (empty($book_id) || empty($reason)) {
        echo json_encode(['success' => false, 'message' => 'Please select a book and provide a reason for renewal']);
        exit();
    }
    
    // Check if reason is too long
    if (strlen($reason) > 500) {
        echo json_encode(['success' => false, 'message' => 'Reason must be 500 characters or less']);
        exit();
    }
    
    // Check if user has this book borrowed
    if (!is_book_borrowed_by_user($user_id, $book_id)) {
        echo json_encode(['success' => false, 'message' => 'You do not have this book borrowed']);
        exit();
    }
    
    // Check if book is overdue
    if (is_book_overdue($user_id, $book_id)) {
        echo json_encode(['success' => false, 'message' => 'Cannot renew overdue books. Please return the book first.']);
        exit();
    }
    
    // Check if user already has a pending renewal request for this book
    if (has_pending_renewal($user_id, $book_id)) {
        echo json_encode(['success' => false, 'message' => 'You already have a pending renewal request for this book']);
        exit();
    }
    
    // Check if book has already been renewed
    if (has_been_renewed($user_id, $book_id)) {
        echo json_encode(['success' => false, 'message' => 'This book has already been renewed once. Maximum one renewal per book.']);
        exit();
    }
    
    // Create renewal request
    if (create_renewal_request($user_id, $book_id, $reason)) {
        echo json_encode(['success' => true, 'message' => 'Renewal request submitted successfully! You will be notified once it is reviewed.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error submitting renewal request. Please try again.']);
    }
    
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Function to check if user has the book borrowed
function is_book_borrowed_by_user($user_id, $book_id) {
    $borrowed_books_path = '../data/borrowed_books.csv';
    
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'approved') {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    
    return false;
}

// Function to check if book is overdue
function is_book_overdue($user_id, $book_id) {
    $borrowed_books_path = '../data/borrowed_books.csv';
    
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'approved') {
                $due_date = $data[3];
                $today = date('Y-m-d');
                fclose($handle);
                return strtotime($due_date) < strtotime($today);
            }
        }
        fclose($handle);
    }
    
    return false;
}

// Function to check if user has pending renewal request
function has_pending_renewal($user_id, $book_id) {
    $renewals_path = '../data/renewal_requests.csv';
    
    if (!file_exists($renewals_path)) {
        return false;
    }
    
    if (($handle = fopen($renewals_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'pending') {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    
    return false;
}

// Function to check if book has been renewed before
function has_been_renewed($user_id, $book_id) {
    $renewals_path = '../data/renewal_requests.csv';
    
    if (!file_exists($renewals_path)) {
        return false;
    }
    
    if (($handle = fopen($renewals_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'approved') {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    
    return false;
}

// Function to create renewal request
function create_renewal_request($user_id, $book_id, $reason) {
    $renewals_path = '../data/renewal_requests.csv';
    
    // Create file with headers if it doesn't exist
    if (!file_exists($renewals_path)) {
        file_put_contents($renewals_path, "user_id,book_id,request_date,reason,status,admin_response,new_due_date\n");
    }
    
    // Prepare data
    $request_date = date('Y-m-d H:i:s');
    $status = 'pending';
    $admin_response = '';
    $new_due_date = '';
    
    // Append to CSV file
    if (($handle = fopen($renewals_path, 'a')) !== FALSE) {
        $data = [$user_id, $book_id, $request_date, $reason, $status, $admin_response, $new_due_date];
        fputcsv($handle, $data);
        fclose($handle);
        return true;
    }
    
    return false;
}
?>
