<?php
session_start();
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? trim($_POST['action']) : '';
    $user_id = isset($_POST['user_id']) ? trim($_POST['user_id']) : '';
    $book_id = isset($_POST['book_id']) ? trim($_POST['book_id']) : '';
    $admin_response = isset($_POST['admin_response']) ? trim($_POST['admin_response']) : '';
    
    if (empty($action) || empty($user_id) || empty($book_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
        exit();
    }
    
    if ($action === 'approve') {
        approveRenewal($user_id, $book_id, $admin_response);
    } elseif ($action === 'deny') {
        denyRenewal($user_id, $book_id, $admin_response);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit();
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

function approveRenewal($user_id, $book_id, $admin_response) {
    $renewal_requests_path = '../data/renewal_requests.csv';
    $borrowed_books_path = '../data/borrowed_books.csv';
    
    // Calculate new due date (extend by 7 days)
    $current_due_date = getCurrentDueDate($user_id, $book_id);
    if (!$current_due_date) {
        echo json_encode(['success' => false, 'message' => 'Could not find current due date']);
        return;
    }
    
    $new_due_date = date('Y-m-d', strtotime($current_due_date . ' +7 days'));
    
    // Update renewal request status
    if (updateRenewalStatus($user_id, $book_id, 'approved', $admin_response, $new_due_date)) {
        // Update borrowed books due date
        if (updateBorrowedBookDueDate($user_id, $book_id, $new_due_date)) {
            echo json_encode(['success' => true, 'message' => 'Renewal approved successfully. Due date extended by 7 days.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Renewal approved but failed to update due date']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to approve renewal']);
    }
}

function denyRenewal($user_id, $book_id, $admin_response) {
    if (updateRenewalStatus($user_id, $book_id, 'denied', $admin_response, '')) {
        echo json_encode(['success' => true, 'message' => 'Renewal denied successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to deny renewal']);
    }
}

function updateRenewalStatus($user_id, $book_id, $status, $admin_response, $new_due_date) {
    $renewal_requests_path = '../data/renewal_requests.csv';
    $temp_file = '../data/renewal_requests_temp.csv';
    
    $updated = false;
    
    if (($handle = fopen($renewal_requests_path, 'r')) !== FALSE && ($temp_handle = fopen($temp_file, 'w')) !== FALSE) {
        // Copy header
        $header = fgetcsv($handle);
        fputcsv($temp_handle, $header);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[0] === $user_id && $data[1] === $book_id && $data[4] === 'pending') {
                // Update this row
                $data[4] = $status; // status
                $data[5] = $admin_response; // admin_response
                $data[6] = $new_due_date; // new_due_date
                $updated = true;
            }
            fputcsv($temp_handle, $data);
        }
        
        fclose($handle);
        fclose($temp_handle);
        
        if ($updated) {
            rename($temp_file, $renewal_requests_path);
            return true;
        } else {
            unlink($temp_file);
            return false;
        }
    }
    
    return false;
}

function getCurrentDueDate($user_id, $book_id) {
    $borrowed_books_path = '../data/borrowed_books.csv';
    
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 4 && $data[0] === $user_id && $data[1] === $book_id) {
                $due_date = $data[3];
                fclose($handle);
                return $due_date;
            }
        }
        fclose($handle);
    }
    
    return null;
}

function updateBorrowedBookDueDate($user_id, $book_id, $new_due_date) {
    $borrowed_books_path = '../data/borrowed_books.csv';
    $temp_file = '../data/borrowed_books_temp.csv';
    
    $updated = false;
    
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE && ($temp_handle = fopen($temp_file, 'w')) !== FALSE) {
        // Copy header
        $header = fgetcsv($handle);
        fputcsv($temp_handle, $header);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 4 && $data[0] === $user_id && $data[1] === $book_id) {
                // Update due date
                $data[3] = $new_due_date;
                $updated = true;
            }
            fputcsv($temp_handle, $data);
        }
        
        fclose($handle);
        fclose($temp_handle);
        
        if ($updated) {
            rename($temp_file, $borrowed_books_path);
            return true;
        } else {
            unlink($temp_file);
            return false;
        }
    }
    
    return false;
}
?>
