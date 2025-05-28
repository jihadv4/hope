console.log("Admin dashboard script loaded");

// Test function to verify JavaScript is working
window.testDelete = function() {
  alert("Test function works!");
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded");
  // Elements
  const borrowRequestsList = document.getElementById("borrowRequestsList")
  const returnRequestsList = document.getElementById("returnRequestsList")
  const borrowedBooksList = document.getElementById("borrowedBooksList")
  const penaltiesList = document.getElementById("penaltiesList")
  const booksList = document.getElementById("booksList")
  const usersList = document.getElementById("usersList")
  const borrowRequestCount = document.getElementById("borrowRequestCount")
  const returnRequestCount = document.getElementById("returnRequestCount")
  const overdueCount = document.getElementById("overdueCount")
  const penaltyCount = document.getElementById("penaltyCount")
  const uploadBooksForm = document.getElementById("uploadBooksForm")
  const uploadUsersForm = document.getElementById("uploadUsersForm")
  const renewalRequestsList = document.getElementById("renewalRequestsList")
  const renewalSearchInput = document.getElementById("renewalSearchInput")
  const renewalSearchBtn = document.getElementById("renewalSearchBtn")
  const renewalResetBtn = document.getElementById("renewalResetBtn")
  const renewalStatusFilter = document.getElementById("renewalStatusFilter")
  const pendingRenewalsCount = document.getElementById("pendingRenewalsCount")

  // Search elements
  const borrowedSearchInput = document.getElementById("borrowedSearchInput")
  const borrowedSearchBtn = document.getElementById("borrowedSearchBtn")
  const borrowedResetBtn = document.getElementById("borrowedResetBtn")
  const statusFilter = document.getElementById("statusFilter")
  const daysLeftFilter = document.getElementById("daysLeftFilter")
  const bookSearchInput = document.getElementById("bookSearchInput")
  const bookSearchBtn = document.getElementById("bookSearchBtn")
  const bookResetBtn = document.getElementById("bookResetBtn")
  const userSearchInput = document.getElementById("userSearchInput")
  const userSearchBtn = document.getElementById("userSearchBtn")
  const userResetBtn = document.getElementById("userResetBtn")

  // Add Book Form Elements
  const toggleAddBookForm = document.getElementById("toggleAddBookForm")
  const addBookSection = document.getElementById("addBookSection")
  const addBookForm = document.getElementById("addBookForm")
  const cancelAddBook = document.getElementById("cancelAddBook")

  // Store data for filtering
  let allBorrowedBooks = []
  let allBooks = []
  let allUsers = []
  let allRenewalRequests = []
  let allNotices = []

  // Store timers
  const returnTimers = {}

  // Load initial data
  loadBorrowRequests()
  loadReturnRequests()
  loadAllBorrowedBooks()
  loadBooks()
  loadUsers()
  loadPenalties()
  loadRenewalRequests()
  loadNotices()

  // Add Book Form functionality
  if (toggleAddBookForm) {
    toggleAddBookForm.addEventListener("click", () => {
      const isHidden = addBookSection.style.display === "none"
      addBookSection.style.display = isHidden ? "block" : "none"
      toggleAddBookForm.textContent = isHidden ? "Cancel" : "Add New Book"
    })
  }

  if (cancelAddBook) {
    cancelAddBook.addEventListener("click", () => {
      addBookSection.style.display = "none"
      toggleAddBookForm.textContent = "Add New Book"
      addBookForm.reset()
      clearFormErrors()
    })
  }

  if (addBookForm) {
    addBookForm.addEventListener("submit", handleAddBook)
  }

  // Search functionality for borrowed books
  if (borrowedSearchBtn) {
    borrowedSearchBtn.addEventListener("click", filterBorrowedBooks)
  }

  if (borrowedSearchInput) {
    borrowedSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterBorrowedBooks()
      }
    })
  }

  if (borrowedResetBtn) {
    borrowedResetBtn.addEventListener("click", () => {
      borrowedSearchInput.value = ""
      statusFilter.value = ""
      daysLeftFilter.value = ""
      displayAllBorrowedBooks(allBorrowedBooks)
    })
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterBorrowedBooks)
  }

  if (daysLeftFilter) {
    daysLeftFilter.addEventListener("change", filterBorrowedBooks)
  }

  // Search functionality for books
  if (bookSearchBtn) {
    bookSearchBtn.addEventListener("click", filterBooks)
  }

  if (bookSearchInput) {
    bookSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterBooks()
      }
    })
    // Real-time search
    bookSearchInput.addEventListener("input", debounce(filterBooks, 300))
  }

  if (bookResetBtn) {
    bookResetBtn.addEventListener("click", () => {
      bookSearchInput.value = ""
      displayBooks(allBooks)
    })
  }

  // Search functionality for users - FIXED
  if (userSearchBtn) {
    userSearchBtn.addEventListener("click", filterUsers)
  }

  if (userSearchInput) {
    userSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterUsers()
      }
    })
    // Real-time search
    userSearchInput.addEventListener("input", debounce(filterUsers, 300))
  }

  if (userResetBtn) {
    userResetBtn.addEventListener("click", () => {
      userSearchInput.value = ""
      displayUsers(allUsers)
    })
  }

  // Renewal search functionality
  if (renewalSearchBtn) {
    renewalSearchBtn.addEventListener("click", filterRenewalRequests)
  }

  if (renewalSearchInput) {
    renewalSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterRenewalRequests()
      }
    })
    renewalSearchInput.addEventListener("input", debounce(filterRenewalRequests, 300))
  }

  if (renewalResetBtn) {
    renewalResetBtn.addEventListener("click", () => {
      renewalSearchInput.value = ""
      renewalStatusFilter.value = ""
      displayRenewalRequests(allRenewalRequests)
    })
  }

  if (renewalStatusFilter) {
    renewalStatusFilter.addEventListener("change", filterRenewalRequests)
  }

  // Upload forms
  if (uploadBooksForm) {
    uploadBooksForm.addEventListener("submit", handleBooksUpload)
  }

  if (uploadUsersForm) {
    uploadUsersForm.addEventListener("submit", handleUsersUpload)
  }

  // Debounce function for real-time search
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // FIXED: Filter books function
  function filterBooks() {
    if (!bookSearchInput || !allBooks) return

    const searchTerm = bookSearchInput.value.toLowerCase().trim()

    if (!searchTerm) {
      displayBooks(allBooks)
      return
    }

    const filteredBooks = allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.course.toLowerCase().includes(searchTerm) ||
        book.book_id.toLowerCase().includes(searchTerm) ||
        book.year.toLowerCase().includes(searchTerm),
    )

    displayBooks(filteredBooks)
  }

  // FIXED: Filter users function
  function filterUsers() {
    if (!userSearchInput || !allUsers) return

    const searchTerm = userSearchInput.value.toLowerCase().trim()

    if (!searchTerm) {
      displayUsers(allUsers)
      return
    }

    const filteredUsers = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.user_id.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm),
    )

    displayUsers(filteredUsers)
  }

  // Filter borrowed books function
  function filterBorrowedBooks() {
    if (!borrowedSearchInput || !allBorrowedBooks) return

    const searchTerm = borrowedSearchInput.value.toLowerCase().trim()
    const statusValue = statusFilter ? statusFilter.value : ""
    const daysLeftValue = daysLeftFilter ? daysLeftFilter.value : ""

    let filteredBooks = [...allBorrowedBooks]

    // Apply search filter
    if (searchTerm) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.user_name.toLowerCase().includes(searchTerm) ||
          book.user_id.toLowerCase().includes(searchTerm) ||
          book.book_title.toLowerCase().includes(searchTerm) ||
          book.book_author.toLowerCase().includes(searchTerm) ||
          book.book_course.toLowerCase().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusValue) {
      if (statusValue === "overdue") {
        filteredBooks = filteredBooks.filter((book) => book.days_left < 0)
      } else if (statusValue === "active") {
        filteredBooks = filteredBooks.filter((book) => book.days_left >= 0)
      }
    }

    // Apply days left filter
    if (daysLeftValue) {
      const daysLeftNumber = Number.parseInt(daysLeftValue)
      filteredBooks = filteredBooks.filter((book) => {
        const daysLeft = Number.parseInt(book.days_left)
        return daysLeft >= 0 && daysLeft <= daysLeftNumber
      })
    }

    displayAllBorrowedBooks(filteredBooks)
  }

  // Handle add book form submission
  function handleAddBook(e) {
    e.preventDefault()

    clearFormErrors()

    const formData = {
      bookId: document.getElementById("bookId").value.trim(),
      title: document.getElementById("bookTitle").value.trim(),
      author: document.getElementById("bookAuthor").value.trim(),
      year: document.getElementById("bookYear").value,
      semester: document.getElementById("bookSemester").value,
      course: document.getElementById("bookCourse").value.trim(),
      totalCopies: document.getElementById("totalCopies").value,
    }

    if (!validateAddBookForm(formData)) {
      return
    }

    const submitData = new FormData()
    submitData.append("book_id", formData.bookId)
    submitData.append("title", formData.title)
    submitData.append("author", formData.author)
    submitData.append("year", formData.year)
    submitData.append("semester", formData.semester)
    submitData.append("course", formData.course)
    submitData.append("total_copies", formData.totalCopies)
    submitData.append("available_copies", formData.totalCopies)

    fetch("php/add_book.php", {
      method: "POST",
      body: submitData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccessMessage("Book added successfully!")
          addBookForm.reset()
          loadBooks()

          setTimeout(() => {
            addBookSection.style.display = "none"
            toggleAddBookForm.textContent = "Add New Book"
          }, 2000)
        } else {
          showErrorMessage(data.message || "Error adding book")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showErrorMessage("An error occurred while adding the book")
      })
  }

  // Validate add book form
  function validateAddBookForm(data) {
    let isValid = true

    if (!data.bookId) {
      showFieldError("bookId", "Book ID is required")
      isValid = false
    } else if (!/^\d+$/.test(data.bookId)) {
      showFieldError("bookId", "Book ID must be numeric")
      isValid = false
    }

    if (!data.title) {
      showFieldError("bookTitle", "Title is required")
      isValid = false
    }

    if (!data.author) {
      showFieldError("bookAuthor", "Author is required")
      isValid = false
    }

    if (!data.year) {
      showFieldError("bookYear", "Year is required")
      isValid = false
    }

    if (!data.semester) {
      showFieldError("bookSemester", "Semester is required")
      isValid = false
    }

    if (!data.course) {
      showFieldError("bookCourse", "Course code is required")
      isValid = false
    }

    if (!data.totalCopies || Number.parseInt(data.totalCopies) < 1) {
      showFieldError("totalCopies", "Total copies must be at least 1")
      isValid = false
    }

    return isValid
  }

  // Show field error
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)
    field.classList.add("error")

    const existingError = field.parentNode.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
  }

  // Clear form errors
  function clearFormErrors() {
    const errorFields = document.querySelectorAll(".error")
    errorFields.forEach((field) => field.classList.remove("error"))

    const errorMessages = document.querySelectorAll(".error-message")
    errorMessages.forEach((message) => message.remove())

    const successMessages = document.querySelectorAll(".success-message")
    successMessages.forEach((message) => message.remove())
  }

  // Show success message
  function showSuccessMessage(message) {
    const existingSuccess = addBookSection.querySelector(".success-message")
    if (existingSuccess) {
      existingSuccess.remove()
    }

    const successDiv = document.createElement("div")
    successDiv.className = "success-message"
    successDiv.textContent = message
    addBookForm.appendChild(successDiv)
  }

  // Show error message
  function showErrorMessage(message) {
    const existingError = addBookSection.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    addBookForm.appendChild(errorDiv)
  }

  // Handle books upload
  function handleBooksUpload(e) {
    e.preventDefault()

    const formData = new FormData(uploadBooksForm)

    fetch("php/upload_books.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadBooks()
          uploadBooksForm.reset()
        } else {
          alert("❌ " + (data.message || "Error uploading books CSV"))
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred while uploading books CSV")
      })
  }

  // Handle users upload
  function handleUsersUpload(e) {
    e.preventDefault()

    const formData = new FormData(uploadUsersForm)

    fetch("php/upload_users.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadUsers()
          uploadUsersForm.reset()
        } else {
          alert("❌ " + (data.message || "Error uploading users CSV"))
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred while uploading users CSV")
      })
  }

  // Load borrow requests
  function loadBorrowRequests() {
    if (!borrowRequestsList) return

    borrowRequestsList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading borrow requests...</div>'

    fetch("php/get_borrow_requests.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayBorrowRequests(data.borrow_requests)
          if (borrowRequestCount) {
            borrowRequestCount.textContent = data.borrow_requests.length
          }
        } else {
          borrowRequestsList.innerHTML = `<div class="alert alert-danger">${data.message || "Error loading borrow requests"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowRequestsList.innerHTML = '<div class="alert alert-danger">Error loading borrow requests</div>'
      })
  }

  // Display borrow requests
  function displayBorrowRequests(requests) {
    if (requests.length === 0) {
      borrowRequestsList.innerHTML = '<div class="alert alert-info">No pending borrow requests.</div>'
      return
    }

    let html = '<div class="item-list">'

    requests.forEach((request) => {
      html += `
        <div class="item">
          <div class="item-info">
            <h3>${request.book_title}</h3>
            <p><strong>Author:</strong> ${request.book_author}</p>
            <p><strong>Requested by:</strong> ${request.user_name} (ID: ${request.user_id})</p>
            <p><strong>Request date:</strong> ${formatDate(request.request_date)}</p>
          </div>
          <div class="item-actions">
            <button class="btn btn-success btn-sm approve-borrow" data-user-id="${request.user_id}" data-book-id="${request.book_id}">
              Approve
            </button>
            <button class="btn btn-danger btn-sm deny-borrow" data-user-id="${request.user_id}" data-book-id="${request.book_id}">
              Deny
            </button>
          </div>
        </div>`
    })

    html += "</div>"
    borrowRequestsList.innerHTML = html

    // Add event listeners
    document.querySelectorAll(".approve-borrow").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        approveBorrow(userId, bookId)
      })
    })

    document.querySelectorAll(".deny-borrow").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        denyBorrow(userId, bookId)
      })
    })
  }

  // Load return requests
  function loadReturnRequests() {
    if (!returnRequestsList) return

    returnRequestsList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading return requests...</div>'

    fetch("php/get_return_requests.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayReturnRequests(data.return_requests)
          if (returnRequestCount) {
            returnRequestCount.textContent = data.return_requests.length
          }
        } else {
          returnRequestsList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        returnRequestsList.innerHTML = '<div class="alert alert-danger">Error loading return requests</div>'
      })
  }

  // Display return requests
  function displayReturnRequests(requests) {
    if (requests.length === 0) {
      returnRequestsList.innerHTML = '<div class="alert alert-info">No pending return requests.</div>'
      return
    }

    let html = '<div class="item-list">'

    requests.forEach((request) => {
      const daysLeft = Number.parseInt(request.days_left)
      let statusClass = ""
      let statusText = ""

      if (daysLeft < 0) {
        statusClass = "danger"
        statusText = `Overdue by ${Math.abs(daysLeft)} days`
      } else if (daysLeft <= 3) {
        statusClass = "warning"
        statusText = `${daysLeft} days left`
      } else {
        statusText = `${daysLeft} days left`
      }

      html += `
        <div class="item">
          <div class="item-info">
            <h3>${request.book_title}</h3>
            <p><strong>Author:</strong> ${request.book_author}</p>
            <p><strong>Returning by:</strong> ${request.user_name} (ID: ${request.user_id})</p>
            <p><strong>Borrow date:</strong> ${formatDate(request.borrow_date)}</p>
            <p><strong>Due date:</strong> ${formatDate(request.due_date)}</p>
            <p class="${statusClass ? "text-" + statusClass : ""}"><strong>Status:</strong> ${statusText}</p>
          </div>
          <div class="item-actions">
            <button class="btn btn-success btn-sm approve-return" data-user-id="${request.user_id}" data-book-id="${request.book_id}">
              Approve Return
            </button>
          </div>
        </div>`
    })

    html += "</div>"
    returnRequestsList.innerHTML = html

    // Add event listeners
    document.querySelectorAll(".approve-return").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        approveReturn(userId, bookId)
      })
    })
  }

  // Load all borrowed books
  function loadAllBorrowedBooks() {
    if (!borrowedBooksList) return

    borrowedBooksList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading borrowed books...</div>'

    fetch("php/get_all_borrowed_books.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allBorrowedBooks = data.borrowed_books
          displayAllBorrowedBooks(data.borrowed_books)

          const overdueBooks = data.borrowed_books.filter((book) => book.days_left < 0)
          if (overdueCount) {
            overdueCount.textContent = overdueBooks.length
          }
        } else {
          borrowedBooksList.innerHTML = `<div class="alert alert-danger">${data.message || "Error loading borrowed books"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowedBooksList.innerHTML = '<div class="alert alert-danger">Error loading borrowed books</div>'
      })
  }

  // Display all borrowed books
  function displayAllBorrowedBooks(books) {
    if (!books || books.length === 0) {
      borrowedBooksList.innerHTML = '<div class="alert alert-info">No books are currently borrowed.</div>'
      return
    }

    // Clear existing timers
    Object.keys(returnTimers).forEach((key) => {
      clearInterval(returnTimers[key])
      delete returnTimers[key]
    })

    let html = '<div class="table-container"><table class="table">'
    html += `
      <thead>
        <tr>
          <th>Student</th>
          <th>Student ID</th>
          <th>Book Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Course</th>
          <th>Borrowed On</th>
          <th>Due Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>`

    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      let statusBadge = ""
      let timerHtml = ""

      if (daysLeft < 0) {
        statusBadge = `<span class="badge badge-danger">Overdue by ${Math.abs(daysLeft)} days</span>`
      } else if (daysLeft <= 3) {
        statusBadge = `<span class="badge badge-warning">${daysLeft} days left</span>`
        timerHtml = `<div class="countdown-timer" id="admin-timer-${book.book_id}-${book.user_id}">
                        <span class="timer-value">Loading...</span>
                     </div>`
      } else {
        statusBadge = `<span class="badge badge-success">${daysLeft} days left</span>`
      }

      html += `
        <tr>
          <td>${book.user_name}</td>
          <td>${book.user_id}</td>
          <td>${book.book_title}</td>
          <td>${book.book_author}</td>
          <td>${book.book_year}</td>
          <td>${book.book_course}</td>
          <td>${formatDate(book.borrow_date)}</td>
          <td>${formatDate(book.due_date)}</td>
          <td>
            ${statusBadge}
            ${timerHtml}
          </td>
        </tr>`
    })

    html += "</tbody></table></div>"
    borrowedBooksList.innerHTML = html

    // Initialize timers for books due within 3 days
    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      if (daysLeft <= 3 && daysLeft >= 0) {
        initializeAdminTimer(`${book.book_id}-${book.user_id}`, book.due_date)
      }
    })
  }

  // Initialize countdown timer for admin
  function initializeAdminTimer(id, dueDate) {
    const timerElement = document.getElementById(`admin-timer-${id}`)
    if (!timerElement) return

    const timerValueElement = timerElement.querySelector(".timer-value")
    const dueDateTime = new Date(dueDate).getTime()

    function updateTimer() {
      const now = new Date().getTime()
      const distance = dueDateTime - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      timerValueElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`

      if (distance < 0) {
        clearInterval(returnTimers[id])
        timerValueElement.textContent = "OVERDUE!"
        timerElement.classList.add("text-danger")
      }
    }

    updateTimer()
    returnTimers[id] = setInterval(updateTimer, 1000)
  }

  // Load books
  function loadBooks() {
    if (!booksList) return

    booksList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading books...</div>'

    fetch("php/get_books.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allBooks = data.books
          displayBooks(data.books)
        } else {
          booksList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        booksList.innerHTML = '<div class="alert alert-danger">Error loading books</div>'
      })
  }

  // Display books
  function displayBooks(books) {
    if (books.length === 0) {
      booksList.innerHTML = '<div class="alert alert-info">No books found.</div>'
      return
    }

    let html = '<div class="table-container"><table class="table">'
    html += `
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Semester</th>
          <th>Course</th>
          <th>Total Copies</th>
          <th>Available</th>
        </tr>
      </thead>
      <tbody>`

    books.forEach((book) => {
      const availableClass = Number.parseInt(book.available_copies) === 0 ? 'style="color: var(--danger);"' : ""

      html += `
        <tr>
          <td>${book.book_id}</td>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.year}</td>
          <td>${book.semester}</td>
          <td>${book.course}</td>
          <td>${book.total_copies}</td>
          <td ${availableClass}>${book.available_copies}</td>
        </tr>`
    })

    html += "</tbody></table></div>"
    booksList.innerHTML = html
  }

  // Load users
  function loadUsers() {
    if (!usersList) return

    usersList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading users...</div>'

    fetch("php/get_users.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allUsers = data.users
          displayUsers(data.users)
        } else {
          usersList.innerHTML = `<div class="alert alert-danger">${data.message || "Error loading users"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        usersList.innerHTML = '<div class="alert alert-danger">Error loading users</div>'
      })
  }

  // Display users
  function displayUsers(users) {
    if (users.length === 0) {
      usersList.innerHTML = '<div class="alert alert-info">No users found.</div>'
      return
    }

    let html = '<div class="table-container"><table class="table">'
    html += `
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>`

    users.forEach((user) => {
      const roleBadge =
        user.role === "admin"
          ? '<span class="badge badge-primary">Admin</span>'
          : '<span class="badge badge-secondary">User</span>'

      html += `
        <tr>
          <td>${user.user_id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${roleBadge}</td>
        </tr>`
    })

    html += "</tbody></table></div>"
    usersList.innerHTML = html
  }

  // Load penalties
  function loadPenalties() {
    if (!penaltiesList) return

    penaltiesList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading penalties...</div>'

    fetch("php/get_all_penalties.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayPenalties(data.users)
          if (penaltyCount) {
            penaltyCount.textContent = data.users.length
          }
        } else {
          penaltiesList.innerHTML = `<div class="alert alert-danger">${data.message || "Error loading penalties"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        penaltiesList.innerHTML = '<div class="alert alert-danger">Error loading penalties</div>'
      })
  }

  // Display penalties
  function displayPenalties(users) {
    if (!users || users.length === 0) {
      penaltiesList.innerHTML = '<div class="alert alert-info">No users have penalties.</div>'
      return
    }

    let html = ""

    users.forEach((user) => {
      const capacity = user.capacity
      const penalties = capacity.penalties

      html += `
        <div class="card mb-4">
          <div class="card-header">
            <h3>${user.name} (ID: ${user.user_id})</h3>
            <p><strong>Borrowing Capacity:</strong> ${capacity.current_capacity}/${capacity.max_capacity}</p>
            <p><strong>Active Penalties:</strong> ${capacity.penalty_count}</p>
          </div>
          <div class="card-content">
            <h4>Overdue Books with Penalties</h4>
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th>Penalty Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>`

      penalties.forEach((penalty) => {
        html += `
          <tr>
            <td>${penalty.book_id}</td>
            <td>${formatDate(penalty.penalty_date)}</td>
            <td>
              <button class="btn btn-primary btn-sm forgive-penalty" data-user-id="${user.user_id}" data-book-id="${penalty.book_id}">
                Forgive Penalty
              </button>
            </td>
          </tr>`
      })

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>`
    })

    penaltiesList.innerHTML = html

    // Add event listeners to forgive buttons
    document.querySelectorAll(".forgive-penalty").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        forgivePenalty(userId, bookId)
      })
    })
  }

  // Function to load renewal requests
  function loadRenewalRequests() {
    if (!renewalRequestsList) return

    renewalRequestsList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading renewal requests...</div>'

    fetch("php/get_renewal_requests.php")
      .then((response) => response.json())
      .then((data) => {
        console.log("Renewal requests response:", data) // Debug log
        if (data.success) {
          allRenewalRequests = data.renewal_requests
          displayRenewalRequests(data.renewal_requests)

          // Update pending renewals count
          const pendingRenewals = data.renewal_requests.filter((request) => request.status === "pending")
          if (pendingRenewalsCount) {
            pendingRenewalsCount.textContent = pendingRenewals.length
          }
        } else {
          renewalRequestsList.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error loading renewal requests:", error)
        renewalRequestsList.innerHTML = '<div class="alert alert-danger">❌ Error loading renewal requests</div>'
      })
  }

  // Function to display renewal requests
  function displayRenewalRequests(requests) {
    console.log("Displaying renewal requests:", requests) // Debug log

    if (!requests || requests.length === 0) {
      renewalRequestsList.innerHTML = '<div class="alert alert-info">ℹ️ No renewal requests found.</div>'
      return
    }

    let html = '<div class="item-list">'

    requests.forEach((request) => {
      let statusBadge = ""
      let actionButtons = ""

      switch (request.status) {
        case "pending":
          statusBadge = '<span class="badge badge-warning">⏳ Pending</span>'
          actionButtons = `
          <button class="btn btn-success btn-sm approve-renewal" data-user-id="${request.user_id}" data-book-id="${request.book_id}">
            ✅ Approve
          </button>
          <button class="btn btn-danger btn-sm deny-renewal" data-user-id="${request.user_id}" data-book-id="${request.book_id}">
            ❌ Deny
          </button>`
          break
        case "approved":
          statusBadge = '<span class="badge badge-success">✅ Approved</span>'
          break
        case "denied":
          statusBadge = '<span class="badge badge-danger">❌ Denied</span>'
          break
      }

      html += `
      <div class="item">
        <div class="item-info">
          <h3>${request.book_title}</h3>
          <p><strong>Author:</strong> ${request.book_author}</p>
          <p><strong>Student:</strong> ${request.user_name} (ID: ${request.user_id})</p>
          <p><strong>Request Date:</strong> ${formatDate(request.request_date)}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Current Due Date:</strong> ${formatDate(request.current_due_date)}</p>
          ${request.new_due_date ? `<p><strong>New Due Date:</strong> ${formatDate(request.new_due_date)}</p>` : ""}
          ${request.admin_response ? `<p><strong>Admin Response:</strong> ${request.admin_response}</p>` : ""}
        </div>
        <div class="item-actions">
          ${statusBadge}
          ${actionButtons}
        </div>
      </div>`
    })

    html += "</div>"
    renewalRequestsList.innerHTML = html

    // Add event listeners for approval/denial buttons
    document.querySelectorAll(".approve-renewal").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        showRenewalResponseModal(userId, bookId, "approve")
      })
    })

    document.querySelectorAll(".deny-renewal").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        showRenewalResponseModal(userId, bookId, "deny")
      })
    })
  }

  // Function to filter renewal requests
  function filterRenewalRequests() {
    if (!renewalSearchInput || !allRenewalRequests) return

    const searchTerm = renewalSearchInput.value.toLowerCase().trim()
    const statusValue = renewalStatusFilter ? renewalStatusFilter.value : ""

    let filteredRequests = [...allRenewalRequests]

    // Apply search filter
    if (searchTerm) {
      filteredRequests = filteredRequests.filter(
        (request) =>
          request.user_name.toLowerCase().includes(searchTerm) ||
          request.user_id.toLowerCase().includes(searchTerm) ||
          request.book_title.toLowerCase().includes(searchTerm) ||
          request.book_author.toLowerCase().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusValue) {
      filteredRequests = filteredRequests.filter((request) => request.status === statusValue)
    }

    displayRenewalRequests(filteredRequests)
  }

  // Function to show renewal response modal (simplified version)
  function showRenewalResponseModal(userId, bookId, action) {
    const actionText = action === "approve" ? "approve" : "deny"
    const response = prompt(`Please provide a response for ${actionText}ing this renewal request:`)

    if (response !== null) {
      manageRenewalRequest(userId, bookId, action, response)
    }
  }

  // Function to manage renewal request (approve/deny)
  function manageRenewalRequest(userId, bookId, action, adminResponse) {
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("book_id", bookId)
    formData.append("action", action)
    formData.append("admin_response", adminResponse)

    fetch("php/manage_renewal.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadRenewalRequests()
          // Reload other data that might be affected
          loadAllBorrowedBooks()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred while processing the renewal request")
      })
  }

  // API functions
  function approveBorrow(userId, bookId) {
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("book_id", bookId)

    fetch("php/approve_borrow.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadBorrowRequests()
          loadAllBorrowedBooks()
          loadBooks()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred")
      })
  }

  function denyBorrow(userId, bookId) {
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("book_id", bookId)

    fetch("php/deny_borrow.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadBorrowRequests()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred")
      })
  }

  function approveReturn(userId, bookId) {
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("book_id", bookId)

    fetch("php/approve_return.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadReturnRequests()
          loadAllBorrowedBooks()
          loadBooks()
          loadPenalties()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred")
      })
  }

  function forgivePenalty(userId, bookId) {
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("book_id", bookId)

    fetch("php/forgive_penalty.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          loadPenalties()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred")
      })
  }

  // Notices Management Functions
  function loadNotices() {
    fetch("php/get_notices.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allNotices = data.notices
          displayNotices(allNotices)
        } else {
          document.getElementById("noticesManagementList").innerHTML = 
            '<div class="no-data">No notices found</div>'
        }
      })
      .catch((error) => {
        console.error("Error loading notices:", error)
        document.getElementById("noticesManagementList").innerHTML = 
          '<div class="error">Error loading notices</div>'
      })
  }

  function displayNotices(notices) {
    const noticesManagementList = document.getElementById("noticesManagementList")
    
    if (notices.length === 0) {
      noticesManagementList.innerHTML = '<div class="no-data">No notices found</div>'
      return
    }

    let html = '<div class="table-container"><table class="data-table">'
    html += `
      <thead>
        <tr>
          <th>📝 Title</th>
          <th>📄 Content</th>
          <th>📅 Date Created</th>
          <th>👨‍💼 Admin</th>
          <th>⚡ Actions</th>
        </tr>
      </thead>
      <tbody>
    `

    notices.forEach((notice) => {
      const date = new Date(notice.date_created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const shortContent = notice.content.length > 100 ? 
        notice.content.substring(0, 100) + '...' : notice.content

      html += `
        <tr>
          <td><strong>${notice.title}</strong></td>
          <td>${shortContent}</td>
          <td>${date}</td>
          <td>${notice.admin_id}</td>
          <td>
            <button class="btn btn-danger btn-sm delete-notice-btn" data-notice-id="${notice.id}" onclick="testInline()">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `
    })

    html += '</tbody></table></div>'
    noticesManagementList.innerHTML = html
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-notice-btn').forEach(button => {
      button.addEventListener('click', function() {
        const noticeId = this.getAttribute('data-notice-id');
        deleteNotice(noticeId);
      });
    });
  }

  function toggleAddNoticeForm() {
    const addNoticeSection = document.getElementById("addNoticeSection")
    if (addNoticeSection.style.display === "none") {
      addNoticeSection.style.display = "block"
    } else {
      addNoticeSection.style.display = "none"
      // Reset form
      document.getElementById("addNoticeForm").reset()
    }
  }

  // Add Notice Form Handler
  const addNoticeForm = document.getElementById("addNoticeForm")
  if (addNoticeForm) {
    addNoticeForm.addEventListener("submit", (e) => {
      e.preventDefault()
      
      const formData = new FormData(addNoticeForm)
      
      fetch("php/add_notice.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("✅ " + data.message)
            addNoticeForm.reset()
            toggleAddNoticeForm()
            loadNotices()
          } else {
            alert("❌ " + data.message)
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("❌ An error occurred while adding the notice")
        })
    })
  }

  // Delete Notice Function
  function deleteNotice(noticeId) {
    console.log("Delete function called for notice ID:", noticeId);
    if (confirm("Are you sure you want to delete this notice?")) {
      console.log("User confirmed deletion");
      const formData = new FormData()
      formData.append("notice_id", noticeId)
      
      fetch("php/delete_notice.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          console.log("Response received:", response);
          return response.json();
        })
        .then((data) => {
          console.log("Response data:", data);
          if (data.success) {
            alert("✅ " + data.message)
            loadNotices()
          } else {
            alert("❌ " + data.message)
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("❌ An error occurred while deleting the notice")
        })
    } else {
      console.log("User cancelled deletion");
    }
  }

  // Make functions globally available
  window.toggleAddNoticeForm = toggleAddNoticeForm
  window.loadNotices = loadNotices

  // Utility function to format date
  function formatDate(dateString) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
})
