document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const resetBtn = document.getElementById("resetBtn")
  const yearFilter = document.getElementById("yearFilter")
  const semesterFilter = document.getElementById("semesterFilter")
  const courseFilter = document.getElementById("courseFilter")
  const booksList = document.getElementById("booksList")

  // Store all books for filtering
  let allBooks = []

  // Load books
  loadBooks()

  // Event listeners
  searchBtn.addEventListener("click", filterBooks)
  resetBtn.addEventListener("click", resetFilters)
  yearFilter.addEventListener("change", handleYearChange)
  semesterFilter.addEventListener("change", handleSemesterChange)

  // Function to load books from server
  function loadBooks() {
    booksList.innerHTML = '<div class="loading">Loading books...</div>'

    fetch("php/get_books.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          allBooks = data.books // Store all books
          displayBooks(data.books)
          populateFilters(data.books)
        } else {
          booksList.innerHTML = `<div class="alert alert-danger">${data.message || "Unknown error loading books"}</div>`
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        booksList.innerHTML = `<div class="alert alert-danger">Error loading books: ${error.message}. Please check server logs.</div>`
      })
  }

  // Function to display books
  function displayBooks(books) {
    if (!books || books.length === 0) {
      booksList.innerHTML = '<div class="alert alert-info">No books found matching your criteria.</div>'
      return
    }

    let html = "<table>"
    html +=
      "<thead><tr><th>Title</th><th>Author</th><th>Year</th><th>Semester</th><th>Course</th><th>Availability</th></tr></thead>"
    html += "<tbody>"

    books.forEach((book) => {
      const availableCopies = Number.parseInt(book.available_copies)
      const totalCopies = Number.parseInt(book.total_copies)

      let availabilityClass = "badge-success"
      let availabilityText = "Available"

      if (availableCopies <= 1) {
        availabilityClass = "badge-warning"
        availabilityText = "Limited"
      } else if (availableCopies === 0) {
        availabilityClass = "badge-danger"
        availabilityText = "Not Available"
      }

      html += `<tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>Semester ${book.semester}</td>
                <td>${book.course}</td>
                <td><span class="badge ${availabilityClass}">${availabilityText} (${availableCopies}/${totalCopies})</span></td>
            </tr>`
    })

    html += "</tbody></table>"
    booksList.innerHTML = html
  }

  // Function to populate filters
  function populateFilters(books) {
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
  }

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
      const filteredBooks = allBooks.filter((book) => book.year === selectedYear && book.semester === selectedSemester)

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
})
