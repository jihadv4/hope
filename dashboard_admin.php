<?php
session_start();
require_once 'php/auth_check.php';
require_once 'php/admin_check.php';
require_once 'php/check_overdue.php';

// Check for overdue books and add penalties
check_overdue_books();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JWGFJNPYPM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-JWGFJNPYPM');
</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Digital Library</title>
    <link rel="stylesheet" href="css/simplified-theme.css">
    <link rel="stylesheet" href="css/timer-styles.css">
    <link rel="icon" href="ls/ls/logo.png" type="image/x-icon">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <img src="ls/ls/logo.png" alt="Library Logo">
                    <div>
                        <div>🚀 Digital Library</div>
                        <div style="font-size: var(--text-sm); opacity: 0.9;">Applied Mathematics - RU</div>
                    </div>
                </div>
                <div class="user-info">
                    <span>👨‍💼 <?php echo $_SESSION['user_name']; ?> (Administrator)</span>
                    <a href="php/logout.php" class="btn btn-secondary btn-sm">🚪 Logout</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav class="main-nav">
        <div class="container">
            <div class="nav-container">
                <ul class="nav-menu" id="navMenu">
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-tab="borrow-requests">
                            <span class="nav-icon">📥</span>
                            <span>Borrow Requests</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="return-requests">
                            <span class="nav-icon">📤</span>
                            <span>Return Requests</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="borrowed-books">
                            <span class="nav-icon">📊</span>
                            <span>Borrowed Books</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="penalties">
                            <span class="nav-icon">⚠️</span>
                            <span>Penalties</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="renewals">
                        <span class="nav-icon">🔄</span>
                        <span>Renewals</span>
                    </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="books">
                            <span class="nav-icon">📚</span>
                            <span>Books</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="users">
                            <span class="nav-icon">👥</span>
                            <span>Users</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="notices">
                            <span class="nav-icon">📢</span>
                            <span>Notices</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <h1>🎛️ Library Administration</h1>
                <p>Manage digital resources and oversee academic operations</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📥 Pending Borrow Requests</h3>
                    <div class="value" id="borrowRequestCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>📤 Pending Return Requests</h3>
                    <div class="value" id="returnRequestCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>⏰ Overdue Books</h3>
                    <div class="value danger" id="overdueCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>⚠️ Users with Penalties</h3>
                    <div class="value danger" id="penaltyCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>🔄 Pending Renewals</h3>
                    <div class="value" id="pendingRenewalsCount">0</div>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="tab-content active" id="borrow-requests">
                <div class="card">
                    <div class="card-header">
                        <h2>📥 Pending Borrow Requests</h2>
                        <p>Review and approve student requests to borrow books</p>
                    </div>
                    <div class="card-content">
                        <div id="borrowRequestsList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading borrow requests...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="return-requests">
                <div class="card">
                    <div class="card-header">
                        <h2>📤 Pending Return Requests</h2>
                        <p>Process student requests to return books</p>
                    </div>
                    <div class="card-content">
                        <div id="returnRequestsList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading return requests...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="borrowed-books">
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Currently Borrowed Books</h2>
                        <p>Monitor all borrowed books and their due dates</p>
                    </div>
                    <div class="card-content">
                        <!-- Search and Filters -->
                        <div class="search-bar">
                            <input type="text" id="borrowedSearchInput" class="form-input search-input" placeholder="🔍 Search by student name, book title...">
                            <button class="btn btn-primary" id="borrowedSearchBtn">🔍 Search</button>
                            <button class="btn btn-secondary" id="borrowedResetBtn">🔄 Reset</button>
                        </div>

                        <div class="filter-grid">
                            <div class="form-group">
                                <label for="statusFilter" class="form-label">📊 Status</label>
                                <select id="statusFilter" class="form-select">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="daysLeftFilter" class="form-label">⏰ Days Left</label>
                                <select id="daysLeftFilter" class="form-select">
                                    <option value="">All</option>
                                    <option value="3">3 days or less</option>
                                    <option value="7">7 days or less</option>
                                    <option value="14">14 days or less</option>
                                </select>
                            </div>
                        </div>

                        <div id="borrowedBooksList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading borrowed books...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="penalties">
                <div class="card">
                    <div class="card-header">
                        <h2>⚠️ User Penalties Management</h2>
                        <p>Manage penalties for overdue books and restore borrowing privileges</p>
                    </div>
                    <div class="card-content">
                        <div id="penaltiesList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading penalties...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="renewals">
                <div class="card">
                    <div class="card-header">
                        <h2>🔄 Book Renewal Requests</h2>
                        <p>Review and manage student renewal requests</p>
                    </div>
                    <div class="card-content">
                        <!-- Search and Filters -->
                        <div class="search-bar">
                            <input type="text" id="renewalSearchInput" class="form-input search-input" placeholder="🔍 Search by student name, book title...">
                            <button class="btn btn-primary" id="renewalSearchBtn">🔍 Search</button>
                            <button class="btn btn-secondary" id="renewalResetBtn">🔄 Reset</button>
                            <select id="renewalStatusFilter" class="form-select" style="max-width: 150px;">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="denied">Denied</option>
                            </select>
                        </div>

                        <!-- Renewal Requests List -->
                        <div id="renewalRequestsList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading renewal requests...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="books">
                <div class="card">
                    <div class="card-header">
                        <h2>📚 Book Collection Management</h2>
                        <p>Manage the library's digital book collection</p>
                        
                        <!-- Add New Book Form -->
                        <div class="form-section" id="addBookSection" style="display: none;">
                            <h3>➕ Add New Book to Collection</h3>
                            <form id="addBookForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="bookId" class="form-label">📖 Book ID *</label>
                                        <input type="text" id="bookId" name="bookId" class="form-input" required placeholder="e.g., 301">
                                    </div>
                                    <div class="form-group">
                                        <label for="bookTitle" class="form-label">📚 Title *</label>
                                        <input type="text" id="bookTitle" name="bookTitle" class="form-input" required placeholder="Enter book title">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="bookAuthor" class="form-label">✍️ Author *</label>
                                        <input type="text" id="bookAuthor" name="bookAuthor" class="form-input" required placeholder="Enter author name">
                                    </div>
                                    <div class="form-group">
                                        <label for="bookYear" class="form-label">🎓 Academic Year *</label>
                                        <select id="bookYear" name="bookYear" class="form-select" required>
                                            <option value="">Select Year</option>
                                            <option value="1st">1st Year</option>
                                            <option value="2nd">2nd Year</option>
                                            <option value="3rd">3rd Year</option>
                                            <option value="4th">4th Year</option>
                                            <option value="Master's">Master's</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="bookSemester" class="form-label">📅 Semester *</label>
                                        <select id="bookSemester" name="bookSemester" class="form-select" required>
                                            <option value="">Select Semester</option>
                                            <option value="1st">1st Semester</option>
                                            <option value="2nd">2nd Semester</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="bookCourse" class="form-label">🔢 Course Code *</label>
                                        <input type="text" id="bookCourse" name="bookCourse" class="form-input" required placeholder="e.g., AMAT3101">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="totalCopies" class="form-label">📦 Total Copies *</label>
                                        <input type="number" id="totalCopies" name="totalCopies" class="form-input" required min="1" placeholder="Enter number of copies">
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-success">✅ Add Book</button>
                                    <button type="button" class="btn btn-secondary" id="cancelAddBook">❌ Cancel</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Management Actions -->
                        <div class="search-bar">
                            <button class="btn btn-primary" id="toggleAddBookForm">➕ Add New Book</button>
                            <form id="uploadBooksForm" enctype="multipart/form-data" style="display: flex; gap: var(--space-2); align-items: center;">
                                <input type="file" name="booksFile" accept=".csv" required class="form-input" style="max-width: 200px;">
                                <button type="submit" class="btn btn-primary btn-sm">📤 Upload CSV</button>
                            </form>
                            <a href="php/download_books.php" class="btn btn-secondary btn-sm">📥 Download CSV</a>
                        </div>
                    </div>
                    <div class="card-content">
                        <!-- Search Bar -->
                        <div class="search-bar">
                            <input type="text" id="bookSearchInput" class="form-input search-input" placeholder="🔍 Search books by title, author, course...">
                            <button class="btn btn-primary" id="bookSearchBtn">🔍 Search</button>
                            <button class="btn btn-secondary" id="bookResetBtn">🔄 Reset</button>
                        </div>

                        <!-- Books List -->
                        <div id="booksList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading books...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="users">
                <div class="card">
                    <div class="card-header">
                        <h2>👥 User Management</h2>
                        <p>Manage library users and their accounts</p>
                        
                        <!-- Management Actions -->
                        <div class="search-bar">
                            <form id="uploadUsersForm" enctype="multipart/form-data" style="display: flex; gap: var(--space-2); align-items: center;">
                                <input type="file" name="usersFile" accept=".csv" required class="form-input" style="max-width: 200px;">
                                <button type="submit" class="btn btn-primary btn-sm">📤 Upload CSV</button>
                            </form>
                            <a href="php/download_users.php" class="btn btn-secondary btn-sm">📥 Download CSV</a>
                        </div>
                    </div>
                    <div class="card-content">
                        <!-- Search Bar -->
                        <div class="search-bar">
                            <input type="text" id="userSearchInput" class="form-input search-input" placeholder="🔍 Search users by name, ID, email...">
                            <button class="btn btn-primary" id="userSearchBtn">🔍 Search</button>
                            <button class="btn btn-secondary" id="userResetBtn">🔄 Reset</button>
                        </div>

                        <!-- Users List -->
                        <div id="usersList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading users...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="notices">
                <div class="card">
                    <div class="card-header">
                        <h2>📢 Notice Management</h2>
                        <p>Create and manage library notices for users</p>
                        
                        <!-- Add New Notice Form -->
                        <div class="form-section" id="addNoticeSection" style="display: none;">
                            <h3>➕ Add New Notice</h3>
                            <form id="addNoticeForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="noticeTitle" class="form-label">📝 Notice Title *</label>
                                        <input type="text" id="noticeTitle" name="noticeTitle" class="form-input" required placeholder="Enter notice title" maxlength="200">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="noticeContent" class="form-label">📄 Notice Content *</label>
                                        <textarea id="noticeContent" name="noticeContent" class="form-input" required placeholder="Enter notice content" rows="4" maxlength="1000"></textarea>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-success">✅ Add Notice</button>
                                    <button type="button" class="btn btn-secondary" onclick="toggleAddNoticeForm()">❌ Cancel</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="search-bar">
                            <button class="btn btn-primary" onclick="toggleAddNoticeForm()">➕ Add New Notice</button>
                            <button class="btn btn-secondary" onclick="loadNotices()">🔄 Refresh</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <!-- Notices List -->
                        <div id="noticesManagementList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading notices...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>
                All rights reserved &copy; 2025<br>
                🚀 Digital Library Management System<br>
                Developed with ❤️ by CJ and AMPE
            </p>
        </div>
    </footer>

    <script>
        console.log("Inline script loaded");
        window.testInline = function() {
            alert("Inline test works!");
        }
    </script>
    <script src="js/theme-switcher.js"></script>
    <script src="js/admin_dashboard_fixed.js"></script>
    <script src="js/navigation.js"></script>
</body>
</html>
