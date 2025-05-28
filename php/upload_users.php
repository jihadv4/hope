<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file was uploaded without errors
    if (isset($_FILES['usersFile']) && $_FILES['usersFile']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['usersFile']['tmp_name'];
        
        // Check if file is a CSV
        $fileType = mime_content_type($file);
        if ($fileType !== 'text/csv' && $fileType !== 'text/plain') {
            echo json_encode(['success' => false, 'message' => 'Uploaded file is not a CSV']);
            exit();
        }
        
        // Read the CSV file
        if (($handle = fopen($file, 'r')) !== FALSE) {
            // Get header row
            $header = fgetcsv($handle);
            
            // Check if header has the required columns
            $required_columns = ['user_id', 'name', 'role', 'email', 'password'];
            $valid_header = true;
            
            foreach ($required_columns as $column) {
                if (!in_array($column, $header)) {
                    $valid_header = false;
                    break;
                }
            }
            
            if (!$valid_header) {
                echo json_encode(['success' => false, 'message' => 'CSV file does not have the required columns']);
                fclose($handle);
                exit();
            }
            
            // Write to users.csv
            if (($output = fopen('../data/users.csv', 'w')) !== FALSE) {
                // Write header
                fputcsv($output, $header);
                
                // Write data rows
                while (($data = fgetcsv($handle)) !== FALSE) {
                    fputcsv($output, $data);
                }
                
                fclose($output);
                fclose($handle);
                
                echo json_encode(['success' => true, 'message' => 'Users CSV uploaded successfully']);
                exit();
            } else {
                echo json_encode(['success' => false, 'message' => 'Error writing to users.csv']);
                fclose($handle);
                exit();
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Error reading uploaded CSV file']);
            exit();
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error uploading file']);
        exit();
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}
?>
