<?php
// This file should be run periodically (e.g., via cron job or when admin dashboard is loaded)
// It checks for overdue books and adds penalties

// Function to check for overdue books and add penalties
function check_overdue_books() {
    $borrowed_books_path = __DIR__ . '/../data/borrowed_books.csv';
    $penalties_path = __DIR__ . '/../data/penalties.csv';
    $today = date('Y-m-d');
    $new_penalties = [];
    
    // Read all borrowed books
    if (($handle = fopen($borrowed_books_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5 && $data[4] === 'approved') {
                $user_id = $data[0];
                $book_id = $data[1];
                $due_date = $data[3];
                
                // Check if book is overdue
                if (strtotime($due_date) < strtotime($today)) {
                    // Check if penalty already exists
                    if (!penalty_exists($user_id, $book_id)) {
                        $new_penalties[] = [$user_id, $book_id, $today, '0'];
                    }
                }
            }
        }
        fclose($handle);
    }
    
    // Add new penalties
    if (!empty($new_penalties)) {
        if (($handle = fopen($penalties_path, 'a')) !== FALSE) {
            foreach ($new_penalties as $penalty) {
                fputcsv($handle, $penalty);
            }
            fclose($handle);
            return count($new_penalties);
        }
    }
    
    return 0;
}

// Function to check if penalty already exists
function penalty_exists($user_id, $book_id) {
    $penalties_path = __DIR__ . '/../data/penalties.csv';
    
    if (($handle = fopen($penalties_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 4 && $data[0] === $user_id && $data[1] === $book_id) {
                fclose($handle);
                return true;
            }
        }
        fclose($handle);
    }
    
    return false;
}

// If this file is accessed directly, run the check
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $new_penalties = check_overdue_books();
    echo "Checked for overdue books. Added $new_penalties new penalties.";
}
?>
