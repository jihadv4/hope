<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';
require_once 'get_user_penalties.php';

// Get all users with penalties
function get_all_users_with_penalties() {
    $users_path = __DIR__ . '/../data/users.csv';
    $users = [];
    $users_with_penalties = [];
    
    // Load all users
    if (($handle = fopen($users_path, 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5) {
                $users[] = [
                    'user_id' => $data[0],
                    'name' => $data[1],
                    'role' => $data[2],
                    'email' => $data[3]
                ];
            }
        }
        fclose($handle);
    }
    
    // Get penalties for each user
    foreach ($users as $user) {
        if ($user['role'] === 'user') { // Only check regular users, not admins
            $capacity = get_borrowing_capacity($user['user_id']);
            
            if ($capacity['penalty_count'] > 0) {
                $user['capacity'] = $capacity;
                $users_with_penalties[] = $user;
            }
        }
    }
    
    return $users_with_penalties;
}

// Return all users with penalties
$users_with_penalties = get_all_users_with_penalties();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'users' => $users_with_penalties]);
exit();
?>
