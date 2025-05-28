<?php
// Path to the books CSV file
$booksFile = '../data/books.csv';

// Check if the file exists
if (!file_exists($booksFile)) {
    echo json_encode([
        'success' => false,
        'message' => 'Books file not found'
    ]);
    exit();
}

// Read the books CSV file
if (($handle = fopen($booksFile, 'r')) !== FALSE) {
    // Get header row
    $header = fgetcsv($handle);
    
    // Initialize books array
    $books = [];
    
    // Read data rows
    while (($data = fgetcsv($handle)) !== FALSE) {
        // Create associative array using header as keys
        $book = [];
        for ($i = 0; $i < count($header); $i++) {
            if (isset($data[$i])) {
                $book[$header[$i]] = $data[$i];
            } else {
                $book[$header[$i]] = '';
            }
        }
        
        // Add book to books array
        $books[] = $book;
    }
    
    fclose($handle);
    
    // Return books as JSON
    echo json_encode([
        'success' => true,
        'books' => $books
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error reading books file'
    ]);
}
?>
