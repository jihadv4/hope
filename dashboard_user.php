<?php
session_start();
require_once 'php/auth_check.php';
require_once 'php/user_check.php';
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
    <title>Student Dashboard - Digital Library</title>
    <link rel="stylesheet" href="css/simplified-theme.css">
    <link rel="stylesheet" href="css/timer-styles.css">
    <link rel="icon" href="ls/ls/logo.png" type="image/x-icon">
    <style>
        /* Enhanced renewal form styles for the new theme */
        .renewal-form-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-8);
            margin-bottom: var(--space-8);
        }

        .renewal-form {
            background: var(--background-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            padding: var(--space-6);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .renewal-form::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-primary);
        }

        .renewal-form:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
            border-color: var(--primary);
        }

        .form-description {
            color: var(--text-secondary);
            font-size: var(--text-sm);
            margin-bottom: var(--space-4);
            padding: var(--space-3);
            background: var(--background-elevated);
            border-radius: var(--radius);
            border-left: 3px solid var(--primary);
        }

        .form-group {
            margin-bottom: var(--space-4);
        }

        .form-label {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-2);
        }

        .label-icon {
            font-size: var(--text-lg);
        }

        .form-hint {
            font-size: var(--text-sm);
            color: var(--text-muted);
            margin-top: var(--space-1);
        }

        .character-counter {
            text-align: right;
            font-size: var(--text-sm);
            color: var(--text-muted);
            margin-top: var(--space-1);
        }

        .form-actions {
            display: flex;
            gap: var(--space-3);
            justify-content: flex-end;
            margin-top: var(--space-6);
        }

        .renewal-reason-textarea {
            min-height: 100px;
            resize: vertical;
        }

        .renewal-book-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            padding-right: 2.5rem;
        }

        .btn-with-icon {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .btn-icon {
            transition: transform 0.3s ease;
        }

        .btn:hover .btn-icon {
            transform: scale(1.2) rotate(5deg);
        }

        @media (max-width: 768px) {
            .renewal-form-section {
                grid-template-columns: 1fr;
                gap: var(--space-4);
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
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
                    <span>👋 Welcome, <?php echo $_SESSION['user_name']; ?></span>
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
                        <a href="#" class="nav-link active" data-tab="borrowed">
                            <span class="nav-icon">📖</span>
                            <span>My Books</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="browse">
                            <span class="nav-icon">🔍</span>
                            <span>Browse Books</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="requests">
                            <span class="nav-icon">📋</span>
                            <span>My Requests</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-tab="renewals">
                            <span class="nav-icon">🔄</span>
                            <span>Renewals</span>
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
                <h1>📚 Your Digital Library</h1>
                <p>Discover, learn, and grow with our extensive digital collection</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📖 Books Borrowed</h3>
                    <div class="value" id="borrowedCount">0/3</div>
                </div>
                <div class="stat-card">
                    <h3>🎯 Borrowing Capacity</h3>
                    <div class="value" id="borrowingCapacity">Loading...</div>
                </div>
                <div class="stat-card">
                    <h3>⏳ Pending Requests</h3>
                    <div class="value" id="pendingCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>⚠️ Overdue Books</h3>
                    <div class="value danger" id="overdueCount">0</div>
                </div>
            </div>

            <!-- Capacity Warning -->
            <div id="capacityWarning" class="alert alert-warning hidden">
                <strong>⚠️ Notice:</strong> Your borrowing capacity is reduced due to overdue books.
            </div>

            <!-- Tab Content -->
            <div class="tab-content active" id="borrowed">
                <div class="card">
                    <div class="card-header">
                        <h2>📖 My Borrowed Books</h2>
                        <p>Keep track of your current digital reading collection</p>
                    </div>
                    <div class="card-content">
                        <div id="borrowedBooks">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading your books...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="browse">
                <div class="card">
                    <div class="card-header">
                        <h2>🔍 Browse Our Digital Collection</h2>
                        <p>Explore thousands of academic digital resources</p>
                    </div>
                    <div class="card-content">
                        <!-- Search Bar -->
                        <div class="search-bar">
                            <input type="text" id="searchInput" class="form-input search-input" placeholder="🔍 Search by title, author, or keyword...">
                            <button class="btn btn-primary" id="searchBtn">🔍 Search</button>
                            <button class="btn btn-secondary" id="resetBtn">🔄 Reset</button>
                        </div>

                        <!-- Filters -->
                        <div class="filter-grid">
                            <div class="form-group">
                                <label for="yearFilter" class="form-label">🎓 Academic Year</label>
                                <select id="yearFilter" class="form-select">
                                    <option value="">All Years</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="semesterFilter" class="form-label">📅 Semester</label>
                                <select id="semesterFilter" class="form-select" disabled>
                                    <option value="">Select Semester</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="courseFilter" class="form-label">🔢 Course</label>
                                <select id="courseFilter" class="form-select" disabled>
                                    <option value="">Select Course</option>
                                </select>
                            </div>
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

            <div class="tab-content" id="requests">
                <div class="card">
                    <div class="card-header">
                        <h2>📋 My Requests</h2>
                        <p>Track your borrow and return requests</p>
                    </div>
                    <div class="card-content">
                        <div id="requestsList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading your requests...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="renewals">
                <div class="renewal-form-section">
                    <div class="renewal-form">
                        <h3>🔄 Request Book Renewal</h3>
                        <p class="form-description">Request to extend the due date of your borrowed books by up to 7 days.</p>
                        
                        <form id="renewalRequestForm">
                            <div class="form-group">
                                <label for="renewalBookSelect" class="form-label">
                                    <span class="label-icon">📖</span>
                                    Select Book to Renew
                                </label>
                                <select id="renewalBookSelect" name="book_id" class="form-select renewal-book-select" required>
                                    <option value="">Loading your books...</option>
                                </select>
                                <div class="form-hint">Only books that are not overdue can be renewed</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="renewalReason" class="form-label">
                                    <span class="label-icon">💭</span>
                                    Reason for Renewal
                                </label>
                                <textarea 
                                    id="renewalReason" 
                                    name="reason" 
                                    class="form-input renewal-reason-textarea" 
                                    placeholder="Please provide a brief reason for your renewal request..."
                                    required
                                    maxlength="500"
                                ></textarea>
                                <div class="character-counter">
                                    <span id="characterCount">0</span>/500 characters
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" id="clearRenewalForm" class="btn btn-secondary btn-with-icon">
                                    <span class="btn-icon">🔄</span>
                                    Clear Form
                                </button>
                                <button type="submit" class="btn btn-primary btn-with-icon">
                                    <span class="btn-icon">📤</span>
                                    Submit Renewal Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2>🔄 Your Renewal Requests</h2>
                        <p>Track the status of your book renewal requests</p>
                    </div>
                    <div class="card-content">
                        <div id="renewalRequestsList">
                            <div class="loading">
                                <div class="spinner"></div>
                                Loading your renewal requests...
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

    <script src="js/theme-switcher.js"></script>
    <script src="js/user_dashboard.js"></script>
    <script src="js/navigation.js"></script>
</body>
</html>
