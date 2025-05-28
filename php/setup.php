<?php
// Create necessary directories if they don't exist
$directories = ['data', 'logs'];

foreach ($directories as $dir) {
    $path = __DIR__ . '/../' . $dir;
    if (!file_exists($path)) {
        mkdir($path, 0755, true);
        echo "Created directory: $path<br>";
    } else {
        echo "Directory already exists: $path<br>";
    }
}

// Create empty CSV files with headers if they don't exist
$csv_files = [
    'data/books.csv' => 'book_id,title,author,year,semester,course,total_copies,available_copies',
    'data/users.csv' => 'user_id,name,role,email,password',
    'data/borrowed_books.csv' => 'user_id,book_id,borrow_date,due_date,status',
    'data/penalties.csv' => 'user_id,book_id,penalty_date,forgiven'
];

foreach ($csv_files as $file => $header) {
    $path = __DIR__ . '/../' . $file;
    if (!file_exists($path)) {
        file_put_contents($path, $header . "\n");
        chmod($path, 0644);
        echo "Created file: $path<br>";
    } else {
        echo "File already exists: $path<br>";
    }
}

// Add sample data if books.csv is empty
$books_path = __DIR__ . '/../data/books.csv';
$books_content = file_get_contents($books_path);
if (trim($books_content) == 'book_id,title,author,year,semester,course,total_copies,available_copies') {
    $sample_books = [
        '101,Advanced Calculus,John Doe,1st Year,1,Math101,5,4',
        '102,Introduction to Programming,Jane Smith,1st Year,1,CS101,10,8',
        '103,Data Structures and Algorithms,Alan Turing,2nd Year,2,CS201,7,5',
        '104,Physics Fundamentals,Marie Curie,1st Year,1,PHY101,6,3',
        '105,Organic Chemistry,Robert Boyle,2nd Year,2,CHEM201,8,6',
        '106,Introduction to Literature,Emily Bronte,1st Year,1,LIT101,4,2',
        '107,Advanced Database Systems,Ada Lovelace,3rd Year,1,CS301,5,3',
        '108,Software Engineering,Grace Hopper,3rd Year,2,CS302,6,4',
        '109,Artificial Intelligence,Alan Turing,4th Year,1,CS401,4,2',
        '110,Machine Learning,Andrew Ng,4th Year,2,CS402,3,2',
        '111,Research Methodology,Richard Feynman,Master\'s,1,RES501,5,3',
        '112,Advanced Network Security,Tim Berners-Lee,Master\'s,2,NET502,4,2'
    ];
    
    $books_content .= implode("\n", $sample_books) . "\n";
    file_put_contents($books_path, $books_content);
    echo "Added sample books data<br>";
}

// Add sample data if users.csv is empty
$users_path = __DIR__ . '/../data/users.csv';
$users_content = file_get_contents($users_path);
if (trim($users_content) == 'user_id,name,role,email,password') {
    $sample_users = [
        '2411028121,Alice,user,alice@email.com,password123',
        '2411028122,Bob,admin,bob@email.com,admin123',
        '2411028123,Charlie,user,charlie@email.com,user123',
        '2411028124,David,user,david@email.com,user456',
        '2411028125,Emma,user,emma@email.com,user789'
    ];
    
    $users_content .= implode("\n", $sample_users) . "\n";
    file_put_contents($users_path, $users_content);
    echo "Added sample users data<br>";
}

// Add sample data if borrowed_books.csv is empty
$borrowed_books_path = __DIR__ . '/../data/borrowed_books.csv';
$borrowed_books_content = file_get_contents($borrowed_books_path);
if (trim($borrowed_books_content) == 'user_id,book_id,borrow_date,due_date,status') {
    // Create dates relative to current date
    $today = date('Y-m-d');
    $five_days_ago = date('Y-m-d', strtotime('-5 days'));
    $ten_days_ago = date('Y-m-d', strtotime('-10 days'));
    $due_in_nine_days = date('Y-m-d', strtotime('+9 days'));
    $due_in_four_days = date('Y-m-d', strtotime('+4 days'));
    $overdue_by_two_days = date('Y-m-d', strtotime('-2 days'));
    $overdue_by_five_days = date('Y-m-d', strtotime('-5 days'));
    
    $sample_borrowed = [
        "2411028121,102,$ten_days_ago,$due_in_four_days,approved",
        "2411028121,104,$five_days_ago,$due_in_nine_days,approved",
        "2411028123,106,$today," . date('Y-m-d', strtotime('+14 days')) . ",pending",
        "2411028124,107,$ten_days_ago,$overdue_by_two_days,approved",
        "2411028125,109,$five_days_ago," . date('Y-m-d', strtotime('+9 days')) . ",approved",
        "2411028123,111,$ten_days_ago," . date('Y-m-d', strtotime('+4 days')) . ",approved"
    ];
    
    $borrowed_books_content .= implode("\n", $sample_borrowed) . "\n";
    file_put_contents($borrowed_books_path, $borrowed_books_content);
    echo "Added sample borrowed books data<br>";
    
    // Add sample penalties for overdue books
    $penalties_path = __DIR__ . '/../data/penalties.csv';
    $penalties_content = file_get_contents($penalties_path);
    if (trim($penalties_content) == 'user_id,book_id,penalty_date,forgiven') {
        $sample_penalties = [
            "2411028124,107,$overdue_by_two_days,0"
        ];
        
        $penalties_content .= implode("\n", $sample_penalties) . "\n";
        file_put_contents($penalties_path, $penalties_content);
        echo "Added sample penalties data<br>";
    }
}

echo "<p>Setup completed successfully!</p>";
echo "<p><a href='../login.html'>Go to Login Page</a></p>";
?>
