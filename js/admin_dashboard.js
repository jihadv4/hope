document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")
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
  const totalBooks = document.getElementById("totalBooks")
  const uploadBooksForm = document.getElementById("uploadBooksForm")
  const uploadUsersForm = document.getElementById("uploadUsersForm")
  const borrowedSearchInput = document.getElementById("borrowedSearchInput")
  const borrowedSearchBtn = document.getElementById("borrowedSearchBtn")
  const borrowedResetBtn = document.getElementById("borrowedResetBtn")
  const statusFilter = document.getElementById("statusFilter")
  const daysLeftFilter = document.getElementById("daysLeftFilter")

  // Book search elements
  const bookSearchInput = document.getElementById("bookSearchInput")
  const bookSearchBtn = document.getElementById("bookSearchBtn")
  const bookResetBtn = document.getElementById("bookResetBtn")

  // User search elements
  const userSearchInput = document.getElementById("userSearchInput")
  const userSearchBtn = document.getElementById("userSearchBtn")
  const userResetBtn = document.getElementById("userResetBtn")

  // Add Book Form Elements
  const toggleAddBookForm = document.getElementById("toggleAddBookForm")
  const addBookFormContainer = document.getElementById("addBookFormContainer")
  const addBookForm = document.getElementById("addBookForm")
  const cancelAddBook = document.getElementById("cancelAddBook")

  // Store data for filtering
  let allBorrowedBooks = []
  let allBooks = []
  let allUsers = []

  // Store timers
  const returnTimers = {}

  // Load data
  loadBorrowRequests()
  loadReturnRequests()
  loadAllBorrowedBooks()
  loadBooks()
  loadUsers()
  loadPenalties()

  // Tab switching
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Show active tab content
      tabContents.forEach((content) => {
        if (content.id === tabId) {
          content.classList.add("active")
        } else {
          content.classList.remove("active")
        }
      })
    })
  })

  // Book search functionality
  if (bookSearchBtn) {
    bookSearchBtn.addEventListener("click", filterBooks)
  }

  if (bookSearchInput) {
    bookSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterBooks()
      }
    })
  }

  if (bookResetBtn) {
    bookResetBtn.addEventListener("click", () => {
      bookSearchInput.value = ""
      displayBooks(allBooks)
    })
  }

  // User search functionality
  if (userSearchBtn) {
    userSearchBtn.addEventListener("click", filterUsers)
  }

  if (userSearchInput) {
    userSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterUsers()
      }
    })
  }

  if (userResetBtn) {
    userResetBtn.addEventListener("click", () => {
      userSearchInput.value = ""
      displayUsers(allUsers)
    })
  }

  // Function to filter books
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

  // Function to filter users
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

  // Add Book Form functionality
  if (toggleAddBookForm) {
    toggleAddBookForm.addEventListener("click", () => {
      addBookFormContainer.style.display = addBookFormContainer.style.display === "none" ? "block" : "none"
      if (addBookFormContainer.style.display === "block") {
        toggleAddBookForm.textContent = "❌ Hide Form"
      } else {
        toggleAddBookForm.textContent = "➕ Add New Book"
      }
    })
  }

  if (cancelAddBook) {
    cancelAddBook.addEventListener("click", () => {
      addBookFormContainer.style.display = "none"
      toggleAddBookForm.textContent = "➕ Add New Book"
      addBookForm.reset()
      clearFormErrors()
    })
  }

  if (addBookForm) {
    addBookForm.addEventListener("submit", handleAddBook)
  }

  // Borrowed books search and filters
  if (borrowedSearchBtn) {
    borrowedSearchBtn.addEventListener("click", filterBorrowedBooks)
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

  // Upload books form
  if (uploadBooksForm) {
    uploadBooksForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(uploadBooksForm)

      fetch("php/upload_books.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          if (data.success) {
            alert("✅ " + data.message)
            // Reload books
            loadBooks()
            uploadBooksForm.reset()
          } else {
            alert("❌ " + (data.message || "Error uploading books CSV"))
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert(`❌ An error occurred: ${error.message}. Please check server logs.`)
        })
    })
  }

  // Upload users form
  if (uploadUsersForm) {
    uploadUsersForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(uploadUsersForm)

      fetch("php/upload_users.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          if (data.success) {
            alert("✅ " + data.message)
            // Reload users
            loadUsers()
            uploadUsersForm.reset()
          } else {
            alert("❌ " + (data.message || "Error uploading users CSV"))
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert(`❌ An error occurred: ${error.message}. Please check server logs.`)
        })
    })
  }

  // Function to handle adding a new book
  function handleAddBook(e) {
    e.preventDefault()

    // Clear previous errors
    clearFormErrors()

    // Get form data
    const formData = {
      bookId: document.getElementById("bookId").value.trim(),
      title: document.getElementById("bookTitle").value.trim(),
      author: document.getElementById("bookAuthor").value.trim(),
      year: document.getElementById("bookYear").value,
      semester: document.getElementById("bookSemester").value,
      course: document.getElementById("bookCourse").value.trim(),
      totalCopies: document.getElementById("totalCopies").value,
    }

    // Validate form
    if (!validateAddBookForm(formData)) {
      return
    }

    // Prepare data for submission
    const submitData = new FormData()
    submitData.append("book_id", formData.bookId)
    submitData.append("title", formData.title)
    submitData.append("author", formData.author)
    submitData.append("year", formData.year)
    submitData.append("semester", formData.semester)
    submitData.append("course", formData.course)
    submitData.append("total_copies", formData.totalCopies)
    submitData.append("available_copies", formData.totalCopies) // Initially all copies are available

    // Submit form
    fetch("php/add_book.php", {
      method: "POST",
      body: submitData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccessMessage("✅ Book added successfully!")
          addBookForm.reset()
          loadBooks() // Reload books list

          // Hide form after successful submission
          setTimeout(() => {
            addBookFormContainer.style.display = "none"
            toggleAddBookForm.textContent = "➕ Add New Book"
          }, 2000)
        } else {
          showErrorMessage("❌ " + (data.message || "Error adding book"))
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showErrorMessage("❌ An error occurred while adding the book")
      })
  }

  // Function to validate add book form
  function validateAddBookForm(data) {
    let isValid = true

    // Book ID validation
    if (!data.bookId) {
      showFieldError("bookId", "Book ID is required")
      isValid = false
    } else if (!/^\d+$/.test(data.bookId)) {
      showFieldError("bookId", "Book ID must be numeric")
      isValid = false
    }

    // Title validation
    if (!data.title) {
      showFieldError("bookTitle", "Title is required")
      isValid = false
    } else if (data.title.length < 2) {
      showFieldError("bookTitle", "Title must be at least 2 characters")
      isValid = false
    }

    // Author validation
    if (!data.author) {
      showFieldError("bookAuthor", "Author is required")
      isValid = false
    } else if (data.author.length < 2) {
      showFieldError("bookAuthor", "Author must be at least 2 characters")
      isValid = false
    }

    // Year validation
    if (!data.year) {
      showFieldError("bookYear", "Year is required")
      isValid = false
    }

    // Semester validation
    if (!data.semester) {
      showFieldError("bookSemester", "Semester is required")
      isValid = false
    }

    // Course validation
    if (!data.course) {
      showFieldError("bookCourse", "Course code is required")
      isValid = false
    } else if (data.course.length < 3) {
      showFieldError("bookCourse", "Course code must be at least 3 characters")
      isValid = false
    }

    // Total copies validation
    if (!data.totalCopies) {
      showFieldError("totalCopies", "Total copies is required")
      isValid = false
    } else if (Number.parseInt(data.totalCopies) < 1) {
      showFieldError("totalCopies", "Total copies must be at least 1")
      isValid = false
    } else if (Number.parseInt(data.totalCopies) > 100) {
      showFieldError("totalCopies", "Total copies cannot exceed 100")
      isValid = false
    }

    return isValid
  }

  // Function to show field error
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)
    field.classList.add("error")

    // Remove existing error message
    const existingError = field.parentNode.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    // Add new error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
  }

  // Function to clear form errors
  function clearFormErrors() {
    const errorFields = document.querySelectorAll(".error")
    errorFields.forEach((field) => field.classList.remove("error"))

    const errorMessages = document.querySelectorAll(".error-message")
    errorMessages.forEach((message) => message.remove())

    const successMessages = document.querySelectorAll(".success-message")
    successMessages.forEach((message) => message.remove())
  }

  // Function to show success message
  function showSuccessMessage(message) {
    const existingSuccess = addBookFormContainer.querySelector(".success-message")
    if (existingSuccess) {
      existingSuccess.remove()
    }

    const successDiv = document.createElement("div")
    successDiv.className = "success-message"
    successDiv.textContent = message
    addBookForm.appendChild(successDiv)
  }

  // Function to show error message
  function showErrorMessage(message) {
    const existingError = addBookFormContainer.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    addBookForm.appendChild(errorDiv)
  }

  // Function to load penalties
  function loadPenalties() {
    if (!penaltiesList) return

    penaltiesList.innerHTML = '<div class="loading">Loading penalties...</div>'

    fetch("php/get_all_penalties.php", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          displayPenalties(data.users)
          if (penaltyCount) {
            penaltyCount.textContent = data.users.length
          }
        } else {
          penaltiesList.innerHTML = `<div class="alert alert-danger">❌ ${data.message || "Unknown error loading penalties"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        penaltiesList.innerHTML = `<div class="alert alert-danger">❌ Error loading penalties: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display penalties
  function displayPenalties(users) {
    if (!users || users.length === 0) {
      penaltiesList.innerHTML = '<div class="alert alert-info">ℹ️ No users have penalties.</div>'
      return
    }

    let html = ""

    users.forEach((user) => {
      const capacity = user.capacity
      const penalties = capacity.penalties

      html += `<div class="card mb-4">
                <div class="card-header">
                  <h3>👤 ${user.name} (ID: ${user.user_id})</h3>
                  <p><strong>📊 Borrowing Capacity:</strong> ${capacity.current_capacity}/${capacity.max_capacity}</p>
                  <p><strong>⚠️ Active Penalties:</strong> ${capacity.penalty_count}</p>
                </div>
                <div class="card-body">
                  <h4>📚 Overdue Books with Penalties</h4>
                  <table class="w-100">
                    <thead>
                      <tr>
                        <th>📋 Book ID</th>
                        <th>📅 Penalty Date</th>
                        <th>⚡ Action</th>
                      </tr>
                    </thead>
                    <tbody>`

      penalties.forEach((penalty) => {
        html += `<tr>
                  <td>${penalty.book_id}</td>
                  <td>${formatDate(penalty.penalty_date)}</td>
                  <td>
                    <button class="btn btn-primary forgive-penalty" data-user-id="${user.user_id}" data-book-id="${penalty.book_id}">
                      ✅ Forgive Penalty
                    </button>
                  </td>
                </tr>`
      })

      html += `    </tbody>
                  </table>
                </div>
              </div>`
    })

    penaltiesList.innerHTML = html

    // Add event listeners to forgive buttons
    const forgiveButtons = document.querySelectorAll(".forgive-penalty")
    forgiveButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        forgivePenalty(userId, bookId)
      })
    })
  }

  // Function to forgive a penalty
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
          // Reload penalties
          loadPenalties()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred. Please try again later.")
      })
  }

  // Function to load borrow requests
  function loadBorrowRequests() {
    if (!borrowRequestsList) return

    borrowRequestsList.innerHTML = '<div class="loading">Loading borrow requests...</div>'

    fetch("php/get_borrow_requests.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          displayBorrowRequests(data.borrow_requests)
          if (borrowRequestCount) {
            borrowRequestCount.textContent = data.borrow_requests.length
          }
        } else {
          borrowRequestsList.innerHTML = `<div class="alert alert-danger">❌ ${data.message || "Unknown error loading borrow requests"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowRequestsList.innerHTML = `<div class="alert alert-danger">❌ Error loading borrow requests: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display borrow requests
  function displayBorrowRequests(requests) {
    if (requests.length === 0) {
      borrowRequestsList.innerHTML = '<div class="alert alert-info">ℹ️ No pending borrow requests.</div>'
      return
    }

    let html = ""

    requests.forEach((request) => {
      html += `<div class="book-item">
                <div class="book-info">
                    <h3>📖 ${request.book_title}</h3>
                    <p><strong>✍️ Author:</strong> ${request.book_author}</p>
                    <p><strong>👤 Requested by:</strong> ${request.user_name} (ID: ${request.user_id})</p>
                    <p><strong>📅 Request date:</strong> ${formatDate(request.request_date)}</p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-success approve-borrow" data-user-id="${request.user_id}" data-book-id="${request.book_id}">✅ Approve</button>
                    <button class="btn btn-danger deny-borrow" data-user-id="${request.user_id}" data-book-id="${request.book_id}">❌ Deny</button>
                </div>
            </div>`
    })

    borrowRequestsList.innerHTML = html

    // Add event listeners to buttons
    const approveButtons = document.querySelectorAll(".approve-borrow")
    const denyButtons = document.querySelectorAll(".deny-borrow")

    approveButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        approveBorrow(userId, bookId)
      })
    })

    denyButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        denyBorrow(userId, bookId)
      })
    })
  }

  // Function to load return requests
  function loadReturnRequests() {
    if (!returnRequestsList) return

    returnRequestsList.innerHTML = '<div class="loading">Loading return requests...</div>'

    fetch("php/get_return_requests.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayReturnRequests(data.return_requests)
          if (returnRequestCount) {
            returnRequestCount.textContent = data.return_requests.length
          }
        } else {
          returnRequestsList.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        returnRequestsList.innerHTML =
          '<div class="alert alert-danger">❌ Error loading return requests. Please try again later.</div>'
      })
  }

  // Function to display return requests
  function displayReturnRequests(requests) {
    if (requests.length === 0) {
      returnRequestsList.innerHTML = '<div class="alert alert-info">ℹ️ No pending return requests.</div>'
      return
    }

    let html = ""

    requests.forEach((request) => {
      const daysLeft = Number.parseInt(request.days_left)
      let daysLeftClass = ""
      let statusIcon = ""

      if (daysLeft < 0) {
        daysLeftClass = "text-danger"
        statusIcon = "⚠️"
      } else if (daysLeft < 3) {
        daysLeftClass = "text-warning"
        statusIcon = "⏰"
      } else {
        statusIcon = "✅"
      }

      html += `<div class="book-item">
                <div class="book-info">
                    <h3>📖 ${request.book_title}</h3>
                    <p><strong>✍️ Author:</strong> ${request.book_author}</p>
                    <p><strong>👤 Returning by:</strong> ${request.user_name} (ID: ${request.user_id})</p>
                    <p><strong>📅 Borrow date:</strong> ${formatDate(request.borrow_date)}</p>
                    <p><strong>📅 Due date:</strong> ${formatDate(request.due_date)}</p>
                    <p class="${daysLeftClass}">
                        <strong>${statusIcon} Status:</strong> ${daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left to return`}
                    </p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-success approve-return" data-user-id="${request.user_id}" data-book-id="${request.book_id}">✅ Approve Return</button>
                </div>
            </div>`
    })

    returnRequestsList.innerHTML = html

    // Add event listeners to buttons
    const approveButtons = document.querySelectorAll(".approve-return")

    approveButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        const bookId = this.getAttribute("data-book-id")
        approveReturn(userId, bookId)
      })
    })
  }

  // Function to load all borrowed books
  function loadAllBorrowedBooks() {
    if (!borrowedBooksList) return

    borrowedBooksList.innerHTML = '<div class="loading">Loading borrowed books...</div>'

    fetch("php/get_all_borrowed_books.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          allBorrowedBooks = data.borrowed_books // Store all borrowed books for filtering
          displayAllBorrowedBooks(data.borrowed_books)

          // Update overdue count
          const overdueBooks = data.borrowed_books.filter((book) => book.days_left < 0)
          if (overdueCount) {
            overdueCount.textContent = overdueBooks.length
          }
        } else {
          borrowedBooksList.innerHTML = `<div class="alert alert-danger">❌ ${data.message || "Unknown error loading borrowed books"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowedBooksList.innerHTML = `<div class="alert alert-danger">❌ Error loading borrowed books: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display all borrowed books
  function displayAllBorrowedBooks(books) {
    if (!books || books.length === 0) {
      borrowedBooksList.innerHTML = '<div class="alert alert-info">ℹ️ No books are currently borrowed.</div>'
      return
    }

    // Clear existing timers
    Object.keys(returnTimers).forEach((key) => {
      clearInterval(returnTimers[key])
      delete returnTimers[key]
    })

    let html = "<table>"
    html += `<thead>
              <tr>
                <th>👤 Student</th>
                <th>📋 Student ID</th>
                <th>📖 Book Title</th>
                <th>✍️ Author</th>
                <th>📅 Year</th>
                <th>🎓 Course</th>
                <th>📅 Borrowed On</th>
                <th>📅 Due Date</th>
                <th>⏰ Time Left</th>
                <th>📊 Status</th>
              </tr>
            </thead>`
    html += "<tbody>"

    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      let timeLeftClass = ""
      let timeLeftText = ""
      let statusBadge = ""
      let warningHtml = ""
      let timerHtml = ""

      if (daysLeft < 0) {
        timeLeftClass = "text-danger"
        timeLeftText = `⚠️ Overdue by ${Math.abs(daysLeft)} days`
        statusBadge = '<span class="badge badge-danger">⚠️ Overdue</span>'
      } else if (daysLeft <= 3) {
        timeLeftClass = "text-warning"
        timeLeftText = `⏰ ${daysLeft} days left`
        statusBadge = '<span class="badge badge-warning">⏰ Due Soon</span>'
        timerHtml = `<div class="countdown-timer" id="admin-timer-${book.book_id}-${book.user_id}">
                        <span class="timer-value">Loading...</span>
                     </div>`
        warningHtml = `<div class="alert alert-warning mt-1 p-1 text-center">
                         <small><strong>⚠️ Warning!</strong> Due soon</small>
                       </div>`
      } else {
        timeLeftText = `✅ ${daysLeft} days left`
        statusBadge = '<span class="badge badge-success">✅ Active</span>'
      }

      html += `<tr>
                <td>${book.user_name}</td>
                <td>${book.user_id}</td>
                <td>${book.book_title}</td>
                <td>${book.book_author}</td>
                <td>${book.book_year}</td>
                <td>${book.book_course}</td>
                <td>${formatDate(book.borrow_date)}</td>
                <td>${formatDate(book.due_date)}</td>
                <td class="${timeLeftClass}">
                  ${timeLeftText}
                  ${timerHtml}
                  ${warningHtml}
                </td>
                <td>${statusBadge}</td>
              </tr>`
    })

    html += "</tbody></table>"
    borrowedBooksList.innerHTML = html

    // Initialize timers for books due within 3 days
    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      if (daysLeft <= 3 && daysLeft >= 0) {
        initializeAdminTimer(`${book.book_id}-${book.user_id}`, book.due_date)
      }
    })
  }

  // Function to initialize countdown timer for admin
  function initializeAdminTimer(id, dueDate) {
    const timerElement = document.getElementById(`admin-timer-${id}`)
    if (!timerElement) return

    const timerValueElement = timerElement.querySelector(".timer-value")
    const dueDateTime = new Date(dueDate).getTime()

    function updateTimer() {
      const now = new Date().getTime()
      const distance = dueDateTime - now

      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      // Display the result
      timerValueElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`

      // If the countdown is over
      if (distance < 0) {
        clearInterval(returnTimers[id])
        timerValueElement.textContent = "⚠️ OVERDUE!"
        timerElement.classList.add("text-danger")
      }
    }

    // Update timer immediately
    updateTimer()

    // Update timer every second
    returnTimers[id] = setInterval(updateTimer, 1000)
  }

  // Function to filter borrowed books
  function filterBorrowedBooks() {
    if (!borrowedBooksList) return

    const searchTerm = borrowedSearchInput ? borrowedSearchInput.value.toLowerCase() : ""
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

    // Display filtered books
    displayAllBorrowedBooks(filteredBooks)
  }

  // Function to load books
  function loadBooks() {
    if (!booksList) return

    booksList.innerHTML = '<div class="loading">Loading books...</div>'

    fetch("php/get_books.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allBooks = data.books // Store all books for filtering
          displayBooks(data.books)
          if (totalBooks) {
            totalBooks.textContent = data.books.length
          }
        } else {
          booksList.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        booksList.innerHTML = '<div class="alert alert-danger">❌ Error loading books. Please try again later.</div>'
      })
  }

  // Function to display books
  function displayBooks(books) {
    if (books.length === 0) {
      booksList.innerHTML = '<div class="alert alert-info">ℹ️ No books found.</div>'
      return
    }

    let html = "<table>"
    html +=
      "<thead><tr><th>📋 ID</th><th>📖 Title</th><th>✍️ Author</th><th>📅 Year</th><th>📚 Semester</th><th>🎓 Course</th><th>📊 Total Copies</th><th>✅ Available</th></tr></thead>"
    html += "<tbody>"

    books.forEach((book) => {
      const availableClass =
        Number.parseInt(book.available_copies) === 0 ? 'style="color: var(--danger-color); font-weight: bold;"' : ""

      html += `<tr>
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

    html += "</tbody></table>"
    booksList.innerHTML = html
  }

  // Function to load users
  function loadUsers() {
    if (!usersList) return

    usersList.innerHTML = '<div class="loading">Loading users...</div>'

    fetch("php/get_users.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          allUsers = data.users // Store all users for filtering
          displayUsers(data.users)
        } else {
          usersList.innerHTML = `<div class="alert alert-danger">❌ ${data.message || "Unknown error loading users"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        usersList.innerHTML = `<div class="alert alert-danger">❌ Error loading users: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display users
  function displayUsers(users) {
    if (users.length === 0) {
      usersList.innerHTML = '<div class="alert alert-info">ℹ️ No users found.</div>'
      return
    }

    let html = "<table>"
    html += "<thead><tr><th>📋 ID</th><th>👤 Name</th><th>📧 Email</th><th>🏷️ Role</th></tr></thead>"
    html += "<tbody>"

    users.forEach((user) => {
      const roleBadge =
        user.role === "admin"
          ? '<span class="badge badge-primary">👨‍💼 Admin</span>'
          : '<span class="badge badge-secondary">👤 User</span>'

      html += `<tr>
                <td>${user.user_id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${roleBadge}</td>
            </tr>`
    })

    html += "</tbody></table>"
    usersList.innerHTML = html
  }

  // Function to approve borrow request
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
          // Reload data
          loadBorrowRequests()
          loadAllBorrowedBooks()
          loadBooks()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred. Please try again later.")
      })
  }

  // Function to deny borrow request
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
          // Reload data
          loadBorrowRequests()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred. Please try again later.")
      })
  }

  // Function to approve return request
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
          // Reload data
          loadReturnRequests()
          loadAllBorrowedBooks()
          loadBooks()
          loadPenalties() // Also reload penalties as they might have changed
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred. Please try again later.")
      })
  }

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
})
