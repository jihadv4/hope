<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Set headers for CSV download
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="users.csv"');

// Open users.csv for reading
if (($handle = fopen('../data/users.csv', 'r')) !== FALSE) {
    // Output directly to the browser
    while (($data = fgetcsv($handle)) !== FALSE) {
        echo implode(',', $data) . "\n";
    }
    fclose($handle);
} else {
    echo "Error: Could not open users.csv for reading.";
}
?>
