<?php
session_start();

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get user ID and password from POST data
    $user_id = isset($_POST['user_id']) ? trim($_POST['user_id']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Validate input
    if (empty($user_id) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'User ID and password are required']);
        exit();
    }
    
    // Load users from CSV
    $users = [];
    if (($handle = fopen('../data/users.csv', 'r')) !== FALSE) {
        // Skip header row
        fgetcsv($handle);
        
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 5) {
                $users[] = [
                    'user_id' => $data[0],
                    'name' => $data[1],
                    'role' => $data[2],
                    'email' => $data[3],
                    'password' => $data[4]
                ];
            }
        }
        fclose($handle);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error loading user data']);
        exit();
    }
    
    // Find user by user ID
    $user = null;
    foreach ($users as $u) {
        if ($u['user_id'] === $user_id) {
            $user = $u;
            break;
        }
    }
    
    // Check if user exists and password is correct
    if ($user) {
        // In a real application, you would use password_verify() to check hashed passwords
        // For simplicity, we're comparing directly (not secure for production)
        if ($password === $user['password']) {
            // Set session variables
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_email'] = $user['email'];
            
            // Return success response with redirect URL
            if ($user['role'] === 'admin') {
                echo json_encode(['success' => true, 'redirect' => 'dashboard_admin.php']);
            } else {
                echo json_encode(['success' => true, 'redirect' => 'hello.php']);
            }
            exit();
        }
    }
    
    // If we get here, authentication failed
    echo json_encode(['success' => false, 'message' => 'Invalid User ID or password']);
    exit();
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}
?>
