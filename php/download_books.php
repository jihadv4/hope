<?php
session_start();
require_once 'auth_check.php';
require_once 'admin_check.php';

// Set headers for CSV download
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="books.csv"');

// Open books.csv for reading
if (($handle = fopen('../data/books.csv', 'r')) !== FALSE) {
    // Output directly to the browser
    while (($data = fgetcsv($handle)) !== FALSE) {
        echo implode(',', $data) . "\n";
    }
    fclose($handle);
} else {
    echo "Error: Could not open books.csv for reading.";
}
?>
