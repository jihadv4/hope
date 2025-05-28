<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Path to the users CSV file
$usersFile = '../data/users.csv';

// Check if the file exists
if (!file_exists($usersFile)) {
    echo json_encode([
        'success' => false,
        'message' => 'Users file not found'
    ]);
    exit();
}

// Read the users CSV file
if (($handle = fopen($usersFile, 'r')) !== FALSE) {
    // Get header row
    $header = fgetcsv($handle);
    
    // Initialize users array
    $users = [];
    
    // Read data rows
    while (($data = fgetcsv($handle)) !== FALSE) {
        // Create associative array using header as keys
        $user = [];
        for ($i = 0; $i < count($header); $i++) {
            if (isset($data[$i])) {
                $user[$header[$i]] = $data[$i];
            } else {
                $user[$header[$i]] = '';
            }
        }
        
        // Add user to users array
        $users[] = $user;
    }
    
    fclose($handle);
    
    // Return users as JSON
    echo json_encode([
        'success' => true,
        'users' => $users
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error reading users file'
    ]);
}
?>
