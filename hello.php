<?php
session_start();
require_once 'php/auth_check.php';
require_once 'php/user_check.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Semi-Library of APM</title>
  <link rel="stylesheet" href="saw/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
  <link rel="icon" href="ls/ls/logo.png" type="image/x-icon">
  <link rel="shortcut icon" href="ls/ls/logo.png" type="image/x-icon">
  <style>
    /* Enhanced dynamic styles */
    .notices-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: slideInFromTop 0.8s ease-out;
    }
    
    .notices-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      color: white;
    }
    
    .notices-header i {
      font-size: 24px;
      margin-right: 10px;
      animation: pulse 2s infinite;
    }
    
    .notice-item {
      background: rgba(255,255,255,0.95);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #4CAF50;
      transition: all 0.3s ease;
      animation: fadeInUp 0.6s ease-out;
    }
    
    .notice-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .notice-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
      font-size: 16px;
    }
    
    .notice-content {
      color: #666;
      line-height: 1.5;
      margin-bottom: 8px;
    }
    
    .notice-date {
      font-size: 12px;
      color: #999;
      text-align: right;
    }
    
    .user-welcome {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideInFromLeft 0.8s ease-out;
    }
    
    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 8px 15px;
      border-radius: 5px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }
    
    @keyframes slideInFromTop {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInFromLeft {
      from { transform: translateX(-50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    /* Enhanced search section */
    .search-section {
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
      animation: slideInFromTop 1s ease-out;
    }
    
    .search-box {
      position: relative;
      margin-bottom: 20px;
    }
    
    .search-box input {
      width: 100%;
      padding: 15px 50px 15px 20px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .search-box input:focus {
      outline: none;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      transform: translateY(-2px);
    }
    
    .search-box button {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .search-box button:hover {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- User Welcome Section -->
    <div class="user-welcome">
      <div>
        <h3><i class="fas fa-user"></i> Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?>!</h3>
        <p>Explore our digital library collection</p>
      </div>
      <a href="php/logout.php" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    </div>

    <!-- Notices Section -->
    <div class="notices-section" id="noticesSection">
      <div class="notices-header">
        <i class="fas fa-bullhorn"></i>
        <h3>📢 Library Notices</h3>
      </div>
      <div id="noticesList">
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i> Loading notices...
        </div>
      </div>
    </div>

    <header class="app-header">
      <div class="header-content">
        <div class="logo-container">
          <i><img src="ls/ls/logo.png" alt="Logo" height="150" width="150"></i>
          <div class="logo-text">
            <h1>Semi-Library</h1>
            <p>Book Finder</p>
          </div>
        </div>
        <p class="header-subtitle">Find books and their exact locations in the library</p>
      </div>
    </header>

    <main class="main-content">
      <section class="search-section">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="searchInput" placeholder="Search by title, author, course title, or course code...">
          <button id="searchButton">Search</button>
        </div>

        <!-- Move Borrow button here for better visibility -->
        <div style="margin-bottom: 1rem; color: #f4cdcd;">
          <button id="dashboardButton" style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 12px 25px; border-radius: 25px; margin-right: 1rem; border: none; cursor: pointer; transition: all 0.3s ease;" class="sweet-borrow-btn" onclick="window.location.href='dashboard_user.php'" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <i class="fas fa-book-open"></i> Borrow Books
          </button>
        </div>

        <div class="filters-container">
          <div class="filter-row">
            <div class="filter-group">
              <label for="yearFilter">
                <i class="fas fa-calendar-alt"></i> Academic Year
              </label>
              <select id="yearFilter">
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="semesterFilter">
                <i class="fas fa-clock"></i> Semester
              </label>
              <select id="semesterFilter">
                <option value="">All Semesters</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group full-width">
              <label for="courseFilter">
                <i class="fas fa-graduation-cap"></i> Course
              </label>
              <select id="courseFilter">
                <option value="">All Courses</option>
                <!-- Course options will be populated by JavaScript -->
              </select>
            </div>
          </div>
          <div class="note"><i><h3>দয়া করে বইগুলো যথা স্থানে রাখবেন </h3></i></div>
          <div class="filter-actions">
            <button id="resetFilters" class="reset-button">
              <i class="fas fa-undo-alt"></i> Reset Filters
            </button>
          </div>
        </div>
      </section>
      
      <section class="results-section">
        <div class="results-header">
          <h2>Book Results</h2>
          <p id="resultCount">Showing all books</p>
        </div>
        
        <div class="books-grid" id="booksGrid">
          <!-- Book cards will be inserted here by JavaScript -->
           
        </div>
        
        <div id="noResults" class="no-results hidden">
          <i class="fas fa-search"></i>
          <p>No books found matching your search criteria.</p>
          <button id="clearSearch" class="clear-search-button">Clear Search</button>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p> All rights reserved &copy; 2025, University of Rajshahi. Applied Mathematics</p>
      <p>Developed by AMPE </p>
      <p class="footer-note">Note: Each shelf may contain books from multiple semesters and courses.</p>
    </footer>
  </div>

  <script src="saw/script.js"></script>
  <script>
    // Load notices when page loads
    document.addEventListener('DOMContentLoaded', function() {
      loadNotices();
    });

    function loadNotices() {
      fetch('php/get_notices.php')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            displayNotices(data.notices);
          } else {
            document.getElementById('noticesList').innerHTML = '<p style="color: white;">No notices available.</p>';
          }
        })
        .catch(error => {
          console.error('Error loading notices:', error);
          document.getElementById('noticesList').innerHTML = '<p style="color: white;">Error loading notices.</p>';
        });
    }

    function displayNotices(notices) {
      const noticesList = document.getElementById('noticesList');
      
      if (notices.length === 0) {
        noticesList.innerHTML = '<p style="color: white; text-align: center;">No notices available at the moment.</p>';
        return;
      }

      let html = '';
      notices.forEach((notice, index) => {
        const date = new Date(notice.date_created).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        html += `
          <div class="notice-item" style="animation-delay: ${index * 0.1}s">
            <div class="notice-title">${notice.title}</div>
            <div class="notice-content">${notice.content}</div>
            <div class="notice-date">Posted on ${date}</div>
          </div>
        `;
      });
      
      noticesList.innerHTML = html;
    }

    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>