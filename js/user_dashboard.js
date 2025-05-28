document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")
  const borrowedBooks = document.getElementById("borrowedBooks")
  const booksList = document.getElementById("booksList")
  const requestsList = document.getElementById("requestsList")
  const borrowedCount = document.getElementById("borrowedCount")
  const borrowingCapacity = document.getElementById("borrowingCapacity")
  const pendingCount = document.getElementById("pendingCount")
  const overdueCount = document.getElementById("overdueCount")
  const capacityWarning = document.getElementById("capacityWarning")
  const renewalRequestForm = document.getElementById("renewalRequestForm")
  const renewalBookSelect = document.getElementById("renewalBookSelect")
  const renewalReason = document.getElementById("renewalReason")
  const clearRenewalForm = document.getElementById("clearRenewalForm")
  const renewalRequestsList = document.getElementById("renewalRequestsList")

  // Store all books for filtering
  let allBooks = []

  // Store timers
  const returnTimers = {}

  // Load data
  loadBorrowedBooks()
  loadBooks()
  loadRequests()
  loadBorrowingCapacity()
  // Load renewal requests
  loadRenewalRequests()

  // Renewal form functionality
  if (renewalRequestForm) {
    renewalRequestForm.addEventListener("submit", handleRenewalRequest)
  }

  if (clearRenewalForm) {
    clearRenewalForm.addEventListener("click", () => {
      renewalRequestForm.reset()
    })
  }

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

  // Function to load borrowing capacity
  function loadBorrowingCapacity() {
    fetch("php/get_user_penalties.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const capacity = data.capacity
          borrowingCapacity.textContent = `${capacity.current_capacity}/${capacity.max_capacity}`

          // Show warning if capacity is reduced
          if (capacity.penalty_count > 0) {
            borrowingCapacity.classList.add("overdue")
            capacityWarning.style.display = "block"
            capacityWarning.textContent = `Your borrowing capacity is reduced due to ${capacity.penalty_count} overdue book(s). Please return your overdue books or contact the librarian.`
          } else {
            borrowingCapacity.classList.remove("overdue")
            capacityWarning.style.display = "none"
          }
        } else {
          borrowingCapacity.textContent = "Error"
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowingCapacity.textContent = "Error"
      })
  }

  // Function to load borrowed books
  function loadBorrowedBooks() {
    borrowedBooks.innerHTML = '<div class="loading">Loading your books...</div>'

    fetch("php/get_borrowed_books.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          displayBorrowedBooks(data.borrowed_books)
          updateStats(data.borrowed_books)
          // Populate renewal book select dropdown
          populateRenewalBookSelect(data.borrowed_books)
        } else {
          borrowedBooks.innerHTML = `<div class="alert alert-danger">${data.message || "Unknown error loading borrowed books"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowedBooks.innerHTML = `<div class="alert alert-danger">Error loading borrowed books: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display borrowed books
  function displayBorrowedBooks(books) {
    if (!books || books.length === 0) {
      borrowedBooks.innerHTML = '<div class="alert alert-info">You haven\'t borrowed any books yet.</div>'
      return
    }

    // Clear existing timers
    Object.keys(returnTimers).forEach((key) => {
      clearInterval(returnTimers[key])
      delete returnTimers[key]
    })

    let html = ""

    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      let daysLeftClass = ""
      let warningMessage = ""
      let timerHtml = ""

      if (daysLeft < 0) {
        daysLeftClass = "text-danger"
        warningMessage = `<div class="alert alert-danger mt-2">
                            <strong>Warning!</strong> This book is overdue by ${Math.abs(daysLeft)} days. Your borrowing capacity is reduced.
                          </div>`
      } else if (daysLeft <= 3) {
        daysLeftClass = "text-warning"
        warningMessage = `<div class="alert alert-warning mt-2">
                            <strong>Warning!</strong> You have only ${daysLeft} days left to return this book.
                          </div>`
        timerHtml = `<div class="countdown-timer" id="timer-${book.book_id}">
                        <strong>Time remaining:</strong> <span class="timer-value">Loading...</span>
                     </div>`
      }

      let statusBadge = ""
      if (book.status === "approved") {
        statusBadge = '<span class="badge badge-success">Borrowed</span>'
      } else if (book.status === "pending") {
        statusBadge = '<span class="badge badge-warning">Pending Approval</span>'
      } else if (book.status === "return_pending") {
        statusBadge = '<span class="badge badge-primary">Return Pending</span>'
      }

      html += `<div class="book-item">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Borrowed on: ${formatDate(book.borrow_date)}</p>
                    <p>Due date: ${formatDate(book.due_date)}</p>
                    <p class="${daysLeftClass}">
                        ${daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left to return`}
                    </p>
                    ${timerHtml}
                    ${warningMessage}
                </div>
                <div class="book-actions">
                    ${statusBadge}
                    ${book.status === "approved" ? `<button class="btn btn-primary return-book" data-book-id="${book.book_id}">Return Book</button>` : ""}
                </div>
            </div>`
    })

    borrowedBooks.innerHTML = html

    // Add event listeners to return buttons
    const returnButtons = document.querySelectorAll(".return-book")
    returnButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.getAttribute("data-book-id")
        requestReturn(bookId)
      })
    })

    // Initialize timers for books due within 3 days
    books.forEach((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      if (daysLeft <= 3 && daysLeft >= 0 && book.status === "approved") {
        initializeTimer(book.book_id, book.due_date)
      }
    })
  }

  // Function to initialize countdown timer
  function initializeTimer(bookId, dueDate) {
    const timerElement = document.getElementById(`timer-${bookId}`)
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
        clearInterval(returnTimers[bookId])
        timerValueElement.textContent = "OVERDUE!"
        timerElement.classList.add("text-danger")
      }
    }

    // Update timer immediately
    updateTimer()

    // Update timer every second
    returnTimers[bookId] = setInterval(updateTimer, 1000)
  }

  // Function to load books
  function loadBooks() {
    booksList.innerHTML = '<div class="loading">Loading books...</div>'

    fetch("php/get_books.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allBooks = data.books // Store all books
          displayBooks(data.books)
          populateFilters(data.books)
        } else {
          booksList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        booksList.innerHTML = '<div class="alert alert-danger">Error loading books. Please try again later.</div>'
      })
  }

  // Function to display books
  function displayBooks(books) {
    if (books.length === 0) {
      booksList.innerHTML = '<div class="alert alert-info">No books found matching your criteria.</div>'
      return
    }

    let html = "<table>"
    html +=
      "<thead><tr><th>Title</th><th>Author</th><th>Year</th><th>Semester</th><th>Course</th><th>Availability</th><th>Action</th></tr></thead>"
    html += "<tbody>"

    books.forEach((book) => {
      const availableCopies = Number.parseInt(book.available_copies)
      const totalCopies = Number.parseInt(book.total_copies)

      let availabilityClass = "badge-success"
      let availabilityText = "Available"
      let borrowButton = `<button class="btn btn-primary borrow-book" data-book-id="${book.book_id}">Borrow</button>`

      if (availableCopies <= 1) {
        availabilityClass = "badge-warning"
        availabilityText = "Limited"
        borrowButton = '<button class="btn btn-secondary" disabled>Cannot Borrow</button>'
      } else if (availableCopies === 0) {
        availabilityClass = "badge-danger"
        availabilityText = "Not Available"
        borrowButton = '<button class="btn btn-secondary" disabled>Not Available</button>'
      }

      html += `<tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>Semester ${book.semester}</td>
                <td>${book.course}</td>
                <td><span class="badge ${availabilityClass}">${availabilityText} (${availableCopies}/${totalCopies})</span></td>
                <td>${borrowButton}</td>
            </tr>`
    })

    html += "</tbody></table>"
    booksList.innerHTML = html

    // Add event listeners to borrow buttons
    const borrowButtons = document.querySelectorAll(".borrow-book")
    borrowButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.getAttribute("data-book-id")
        requestBorrow(bookId)
      })
    })
  }

  // Function to load requests
  function loadRequests() {
    requestsList.innerHTML = '<div class="loading">Loading your requests...</div>'

    fetch("php/get_borrowed_books.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Filter pending requests
          const pendingRequests = data.borrowed_books.filter(
            (book) => book.status === "pending" || book.status === "return_pending",
          )

          displayRequests(pendingRequests)
        } else {
          requestsList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        requestsList.innerHTML = '<div class="alert alert-danger">Error loading requests. Please try again later.</div>'
      })
  }

  // Function to display requests
  function displayRequests(requests) {
    if (requests.length === 0) {
      requestsList.innerHTML = '<div class="alert alert-info">You don\'t have any pending requests.</div>'
      return
    }

    let html = ""

    requests.forEach((request) => {
      let statusText = ""
      let statusClass = ""

      if (request.status === "pending") {
        statusText = "Borrow Request Pending"
        statusClass = "badge-warning"
      } else if (request.status === "return_pending") {
        statusText = "Return Request Pending"
        statusClass = "badge-primary"
      }

      html += `<div class="book-item">
                <div class="book-info">
                    <h3>${request.title}</h3>
                    <p>Author: ${request.author}</p>
                    <p>Request date: ${formatDate(request.borrow_date)}</p>
                </div>
                <div class="book-actions">
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
            </div>`
    })

    requestsList.innerHTML = html
  }

  // Function to request to borrow a book
  function requestBorrow(bookId) {
    const formData = new FormData()
    formData.append("book_id", bookId)

    fetch("php/request_borrow.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message)
          // Reload data
          loadBorrowedBooks()
          loadBooks()
          loadRequests()
          loadBorrowingCapacity()
        } else {
          alert(data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again later.")
      })
  }

  // Function to request to return a book
  function requestReturn(bookId) {
    const formData = new FormData()
    formData.append("book_id", bookId)

    fetch("php/request_return.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message)
          // Reload data
          loadBorrowedBooks()
          loadRequests()
        } else {
          alert(data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again later.")
      })
  }

  // Function to update stats
  function updateStats(books) {
    const approved = books.filter((book) => book.status === "approved").length
    const pending = books.filter((book) => book.status === "pending" || book.status === "return_pending").length
    const overdue = books.filter((book) => book.status === "approved" && Number.parseInt(book.days_left) < 0).length

    // Load borrowing capacity to get the current max
    fetch("php/get_user_penalties.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const capacity = data.capacity
          borrowedCount.textContent = `${approved}/${capacity.current_capacity}`
        } else {
          borrowedCount.textContent = `${approved}/3`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        borrowedCount.textContent = `${approved}/3`
      })

    pendingCount.textContent = pending
    overdueCount.textContent = overdue
  }

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Populate filters (same as in books.js)
  function populateFilters(books) {
    const yearFilter = document.getElementById("yearFilter")
    const semesterFilter = document.getElementById("semesterFilter")
    const courseFilter = document.getElementById("courseFilter")
    const searchInput = document.getElementById("searchInput")
    const searchBtn = document.getElementById("searchBtn")
    const resetBtn = document.getElementById("resetBtn")

    // Get unique years - now using academic years (1st Year, 2nd Year, etc.)
    const years = [...new Set(books.map((book) => book.year))]

    // Define the order of academic years
    const yearOrder = {
      "1st Year": 1,
      "2nd Year": 2,
      "3rd Year": 3,
      "4th Year": 4,
      "Master's": 5,
    }

    // Sort years by the defined order
    years.sort((a, b) => yearOrder[a] - yearOrder[b])

    // Populate year filter
    yearFilter.innerHTML = '<option value="">All Years</option>'
    years.forEach((year) => {
      yearFilter.innerHTML += `<option value="${year}">${year}</option>`
    })

    // Event listeners
    yearFilter.addEventListener("change", handleYearChange)
    semesterFilter.addEventListener("change", handleSemesterChange)
    searchBtn.addEventListener("click", filterBooks)
    resetBtn.addEventListener("click", resetFilters)

    // Function to handle year change
    function handleYearChange() {
      const selectedYear = yearFilter.value

      // Reset semester and course filters
      semesterFilter.innerHTML = '<option value="">Select Semester</option>'
      courseFilter.innerHTML = '<option value="">Select Course</option>'

      if (selectedYear) {
        semesterFilter.disabled = false

        // Filter books by selected year
        const filteredBooks = allBooks.filter((book) => book.year === selectedYear)

        // Get unique semesters for the selected year
        const semesters = [...new Set(filteredBooks.map((book) => book.semester))]

        // Populate semester filter
        semesters.sort().forEach((semester) => {
          semesterFilter.innerHTML += `<option value="${semester}">Semester ${semester}</option>`
        })

        // Filter and display books
        filterBooks()
      } else {
        semesterFilter.disabled = true
        courseFilter.disabled = true

        // Reset filters and display all books
        filterBooks()
      }
    }

    // Function to handle semester change
    function handleSemesterChange() {
      const selectedYear = yearFilter.value
      const selectedSemester = semesterFilter.value

      // Reset course filter
      courseFilter.innerHTML = '<option value="">Select Course</option>'

      if (selectedYear && selectedSemester) {
        courseFilter.disabled = false

        // Filter books by selected year and semester
        const filteredBooks = allBooks.filter(
          (book) => book.year === selectedYear && book.semester === selectedSemester,
        )

        // Get unique courses for the selected year and semester
        const courses = [...new Set(filteredBooks.map((book) => book.course))]

        // Populate course filter
        courses.sort().forEach((course) => {
          courseFilter.innerHTML += `<option value="${course}">${course}</option>`
        })

        // Filter and display books
        filterBooks()
      } else {
        courseFilter.disabled = true

        // Filter and display books
        filterBooks()
      }
    }

    // Function to filter books
    function filterBooks() {
      const searchTerm = searchInput.value.toLowerCase()
      const selectedYear = yearFilter.value
      const selectedSemester = semesterFilter.value
      const selectedCourse = courseFilter.value

      // Apply filters
      let filteredBooks = allBooks

      if (searchTerm) {
        filteredBooks = filteredBooks.filter(
          (book) =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.course.toLowerCase().includes(searchTerm),
        )
      }

      if (selectedYear) {
        filteredBooks = filteredBooks.filter((book) => book.year === selectedYear)
      }

      if (selectedSemester) {
        filteredBooks = filteredBooks.filter((book) => book.semester === selectedSemester)
      }

      if (selectedCourse) {
        filteredBooks = filteredBooks.filter((book) => book.course === selectedCourse)
      }

      // Display filtered books
      displayBooks(filteredBooks)
    }

    // Function to reset filters
    function resetFilters() {
      searchInput.value = ""
      yearFilter.value = ""
      semesterFilter.value = ""
      courseFilter.value = ""

      semesterFilter.disabled = true
      courseFilter.disabled = true

      // Load all books
      displayBooks(allBooks)
    }
  }

  // Function to populate renewal book select dropdown
  function populateRenewalBookSelect(borrowedBooks) {
    if (!renewalBookSelect) {
      console.error("Renewal book select element not found")
      return
    }

    // Clear existing options
    renewalBookSelect.innerHTML = '<option value="">Choose a book...</option>'

    if (!borrowedBooks || borrowedBooks.length === 0) {
      renewalBookSelect.innerHTML = '<option value="">No borrowed books found</option>'
      renewalBookSelect.disabled = true
      return
    }

    // Filter books that can be renewed (approved status, not overdue)
    const renewableBooks = borrowedBooks.filter((book) => {
      const daysLeft = Number.parseInt(book.days_left)
      return book.status === "approved" && daysLeft >= 0
    })

    if (renewableBooks.length === 0) {
      renewalBookSelect.innerHTML = '<option value="">No books available for renewal</option>'
      renewalBookSelect.disabled = true
      return
    }

    // Enable the select and populate with renewable books
    renewalBookSelect.disabled = false

    renewableBooks.forEach((book) => {
      const option = document.createElement("option")
      option.value = book.book_id
      const daysLeft = Number.parseInt(book.days_left)
      const urgencyText = daysLeft <= 3 ? " (⚠️ Due soon)" : ""
      option.textContent = `${book.title} - Due: ${formatDate(book.due_date)}${urgencyText}`
      renewalBookSelect.appendChild(option)
    })

    console.log(`Populated renewal select with ${renewableBooks.length} books`)
  }

  // Add character counter functionality
  if (renewalReason) {
    const characterCount = document.getElementById("characterCount")

    renewalReason.addEventListener("input", function () {
      const length = this.value.length
      if (characterCount) {
        characterCount.textContent = length

        // Change color based on character count
        if (length > 450) {
          characterCount.style.color = "var(--danger)"
        } else if (length > 400) {
          characterCount.style.color = "var(--warning)"
        } else {
          characterCount.style.color = "var(--gray-500)"
        }
      }
    })
  }

  // Function to handle renewal request submission
  function handleRenewalRequest(e) {
    e.preventDefault()

    const formData = new FormData(renewalRequestForm)

    fetch("php/request_renewal.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message)
          renewalRequestForm.reset()
          loadRenewalRequests()
        } else {
          alert("❌ " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("❌ An error occurred while submitting renewal request")
      })
  }

  // Function to load renewal requests
  function loadRenewalRequests() {
    if (!renewalRequestsList) return

    renewalRequestsList.innerHTML =
      '<div class="loading"><div class="spinner"></div>Loading your renewal requests...</div>'

    fetch("php/get_renewal_requests.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayRenewalRequests(data.renewal_requests)
        } else {
          renewalRequestsList.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        renewalRequestsList.innerHTML = '<div class="alert alert-danger">❌ Error loading renewal requests</div>'
      })
  }

  // Function to display renewal requests
  function displayRenewalRequests(requests) {
    if (!requests || requests.length === 0) {
      renewalRequestsList.innerHTML = '<div class="alert alert-info">ℹ️ You have no renewal requests.</div>'
      return
    }

    let html = '<div class="item-list">'

    requests.forEach((request) => {
      let statusBadge = ""
      let statusIcon = ""

      switch (request.status) {
        case "pending":
          statusBadge = '<span class="badge badge-warning">⏳ Pending</span>'
          statusIcon = "⏳"
          break
        case "approved":
          statusBadge = '<span class="badge badge-success">✅ Approved</span>'
          statusIcon = "✅"
          break
        case "denied":
          statusBadge = '<span class="badge badge-danger">❌ Denied</span>'
          statusIcon = "❌"
          break
      }

      html += `
        <div class="item">
          <div class="item-info">
            <h3>${request.book_title}</h3>
            <p><strong>Author:</strong> ${request.book_author}</p>
            <p><strong>Request Date:</strong> ${formatDate(request.request_date)}</p>
            <p><strong>Reason:</strong> ${request.reason}</p>
            <p><strong>Current Due Date:</strong> ${formatDate(request.current_due_date)}</p>
            ${request.new_due_date ? `<p><strong>New Due Date:</strong> ${formatDate(request.new_due_date)}</p>` : ""}
            ${request.admin_response ? `<p><strong>Admin Response:</strong> ${request.admin_response}</p>` : ""}
          </div>
          <div class="item-actions">
            ${statusBadge}
          </div>
        </div>`
    })

    html += "</div>"
    renewalRequestsList.innerHTML = html
  }
})
