<?php
session_start();
require_once 'auth_check.php';

// Get user ID and role from session
$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['user_role'];

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
$renewal_requests_path = __DIR__ . '/../data/renewal_requests.csv';
$books_path = __DIR__ . '/../data/books.csv';
$users_path = __DIR__ . '/../data/users.csv';
$borrowed_books_path = __DIR__ . '/../data/borrowed_books.csv';

// Check if renewal requests file exists
if (!file_exists($renewal_requests_path)) {
    // Create file with headers if it doesn't exist
    file_put_contents($renewal_requests_path, "user_id,book_id,request_date,reason,status,admin_response,new_due_date\n");
}

// Check if other required files exist
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

if (!file_exists($borrowed_books_path)) {
    logError("Borrowed books CSV file not found: $borrowed_books_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Borrowed books data file not found']);
    exit();
}

// Load renewal requests from CSV
$renewal_requests = [];
if (($handle = fopen($renewal_requests_path, 'r')) !== FALSE) {
    // Skip header row
    $header = fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (count($data) >= 5) {
            $request_user_id = $data[0];
            $book_id = $data[1];
            $request_date = $data[2];
            $reason = $data[3];
            $status = $data[4];
            $admin_response = isset($data[5]) ? $data[5] : '';
            $new_due_date = isset($data[6]) ? $data[6] : '';
            
            // For regular users, only show their own requests
            // For admins, show all requests
            if ($user_role === 'admin' || $request_user_id === $user_id) {
                // Get user details
                $user_name = ($user_role === 'admin') ? get_user_name($request_user_id, $users_path) : $_SESSION['user_name'];
                
                // Get book details
                $book_details = get_book_details($book_id, $books_path);
                
                // Get current due date
                $current_due_date = get_current_due_date($request_user_id, $book_id, $borrowed_books_path);
                
                if ($book_details) {
                    $renewal_requests[] = [
                        'user_id' => $request_user_id,
                        'user_name' => $user_name,
                        'book_id' => $book_id,
                        'book_title' => $book_details['title'],
                        'book_author' => $book_details['author'],
                        'book_course' => $book_details['course'],
                        'request_date' => $request_date,
                        'reason' => $reason,
                        'status' => $status,
                        'admin_response' => $admin_response,
                        'current_due_date' => $current_due_date,
                        'new_due_date' => $new_due_date
                    ];
                }
            }
        }
    }
    fclose($handle);
    
    // Sort by request date (newest first)
    usort($renewal_requests, function($a, $b) {
        return strtotime($b['request_date']) - strtotime($a['request_date']);
    });
    
    // Return renewal requests as JSON
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'renewal_requests' => $renewal_requests]);
    exit();
} else {
    logError("Failed to open renewal requests CSV file: $renewal_requests_path");
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Error loading renewal requests data']);
    exit();
}

// Function to get user name by ID
function get_user_name($user_id, $users_path) {
    if (($handle = fopen($users_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 2 && $data[0] === $user_id) {
                $name = $data[1];
                fclose($handle);
                return $name;
            }
        }
        fclose($handle);
    }
    return 'Unknown User';
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

// Function to get current due date for a borrowed book
function get_current_due_date($user_id, $book_id, $borrowed_books_path) {
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'approved') {
                $due_date = $data[3];
                fclose($handle);
                return $due_date;
            }
        }
        fclose($handle);
    }
    return null;
}
?>
