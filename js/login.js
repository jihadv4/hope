document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const loginMessage = document.getElementById("loginMessage")
  const loginButton = document.getElementById("loginButton")
  const buttonText = document.getElementById("buttonText")
  const userIdInput = document.getElementById("user_id")
  const passwordInput = document.getElementById("password")

  // Clear any existing session data on page load
  if (typeof Storage !== "undefined") {
    sessionStorage.clear()
    localStorage.removeItem("tempData")
  }

  // Prevent back button access to login page when already logged in
  window.history.pushState(null, null, window.location.href)
  window.onpopstate = () => {
    window.history.go(1)
  }

  // Enhanced form validation
  function validateForm() {
    const userId = userIdInput.value.trim()
    const password = passwordInput.value

    if (!userId) {
      showMessage("Please enter your User ID", "error")
      userIdInput.focus()
      return false
    }

    if (userId.length < 2) {
      showMessage("User ID must be at least 2 characters long", "error")
      userIdInput.focus()
      return false
    }

    if (!password) {
      showMessage("Please enter your password", "error")
      passwordInput.focus()
      return false
    }

    if (password.length < 3) {
      showMessage("Password must be at least 3 characters long", "error")
      passwordInput.focus()
      return false
    }

    return true
  }

  // Enhanced message display
  function showMessage(message, type = "info") {
    const messageClass = type === "error" ? "error-message" : type === "success" ? "success-message" : "info-message"

    const icon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️"

    loginMessage.innerHTML = `<div class="${messageClass}">${icon} ${message}</div>`

    // Auto-hide non-error messages after 5 seconds
    if (type !== "error") {
      setTimeout(() => {
        loginMessage.innerHTML = ""
      }, 5000)
    }
  }

  // Loading state management
  function setLoadingState(isLoading) {
    if (isLoading) {
      loginButton.disabled = true
      buttonText.innerHTML = '<span class="loading-spinner"></span>Authenticating...'
      loginButton.style.opacity = "0.8"
    } else {
      loginButton.disabled = false
      buttonText.innerHTML = "🚀 Access Library System"
      loginButton.style.opacity = "1"
    }
  }

  // Real-time input validation
  userIdInput.addEventListener("input", function () {
    this.value = this.value.trim()
    if (this.value && loginMessage.querySelector(".error-message")) {
      loginMessage.innerHTML = ""
    }
  })

  passwordInput.addEventListener("input", function () {
    if (this.value && loginMessage.querySelector(".error-message")) {
      loginMessage.innerHTML = ""
    }
  })

  // Enhanced form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Clear previous messages
    loginMessage.innerHTML = ""

    // Validate form
    if (!validateForm()) {
      return
    }

    // Set loading state
    setLoadingState(true)
    showMessage("Verifying credentials...", "info")

    // Prepare form data
    const formData = new FormData(loginForm)

    // Enhanced fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    fetch("php/login.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => {
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
      })
      .then((data) => {
        setLoadingState(false)

        if (data.success) {
          showMessage("Authentication successful! Redirecting...", "success")

          // Store user session info
          if (typeof Storage !== "undefined") {
            sessionStorage.setItem("authenticated", "true")
            sessionStorage.setItem("loginTime", new Date().getTime())
          }

          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = data.redirect
          }, 1500)
        } else {
          showMessage(data.message || "Authentication failed. Please check your credentials.", "error")

          // Clear password field on error
          passwordInput.value = ""
          passwordInput.focus()

          // Add shake animation to form
          loginForm.style.animation = "shake 0.5s ease-in-out"
          setTimeout(() => {
            loginForm.style.animation = ""
          }, 500)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        setLoadingState(false)

        if (error.name === "AbortError") {
          showMessage("Request timeout. Please check your connection and try again.", "error")
        } else {
          console.error("Login error:", error)
          showMessage("Connection error. Please try again later.", "error")
        }

        // Clear password field on error
        passwordInput.value = ""
        userIdInput.focus()
      })
  })

  // Add shake animation CSS
  const style = document.createElement("style")
  style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .info-message {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid var(--info);
            color: #60a5fa;
            padding: var(--space-3);
            border-radius: var(--radius);
            margin-bottom: var(--space-4);
            font-size: var(--text-sm);
            text-align: center;
        }
    `
  document.head.appendChild(style)

  // Focus on user ID input when page loads
  userIdInput.focus()

  // Handle Enter key navigation
  userIdInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      passwordInput.focus()
    }
  })

  // Auto-submit on Enter in password field
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      loginForm.dispatchEvent(new Event("submit"))
    }
  })

  // Security: Clear form data on page unload
  window.addEventListener("beforeunload", () => {
    userIdInput.value = ""
    passwordInput.value = ""
  })

  // Prevent form auto-fill in some browsers
  setTimeout(() => {
    userIdInput.value = ""
    passwordInput.value = ""
  }, 100)
})
