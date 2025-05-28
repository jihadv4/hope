// Theme Switcher Functionality
class ThemeSwitcher {
  constructor() {
    this.currentTheme = this.getStoredTheme() || "light"
    this.init()
  }

  init() {
    this.applyTheme(this.currentTheme)
    this.createThemeToggle()
    this.bindEvents()
  }

  getStoredTheme() {
    return localStorage.getItem("theme")
  }

  setStoredTheme(theme) {
    localStorage.setItem("theme", theme)
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    this.currentTheme = theme
    this.setStoredTheme(theme)
    this.updateToggleButton()
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light"
    this.applyTheme(newTheme)

    // Add a subtle animation effect
    document.body.style.transition = "all 0.3s ease"
    setTimeout(() => {
      document.body.style.transition = ""
    }, 300)
  }

  createThemeToggle() {
    // Find all user-info containers to add theme toggle
    const userInfoContainers = document.querySelectorAll(".user-info")

    userInfoContainers.forEach((container) => {
      // Check if theme toggle already exists
      if (container.querySelector(".theme-toggle")) return

      const themeToggle = document.createElement("button")
      themeToggle.className = "theme-toggle"
      themeToggle.setAttribute("aria-label", "Toggle theme")
      themeToggle.setAttribute("title", "Switch between light and dark theme")

      themeToggle.innerHTML = `
        <span class="theme-toggle-icon">🌙</span>
        <span class="theme-toggle-text">Theme</span>
      `

      // Insert before logout button
      const logoutBtn = container.querySelector('a[href*="logout"]')
      if (logoutBtn) {
        container.insertBefore(themeToggle, logoutBtn)
      } else {
        container.appendChild(themeToggle)
      }
    })
  }

  updateToggleButton() {
    const toggleButtons = document.querySelectorAll(".theme-toggle")

    toggleButtons.forEach((button) => {
      const icon = button.querySelector(".theme-toggle-icon")
      const text = button.querySelector(".theme-toggle-text")

      if (this.currentTheme === "dark") {
        icon.textContent = "☀️"
        text.textContent = "Light"
        button.setAttribute("title", "Switch to light theme")
      } else {
        icon.textContent = "🌙"
        text.textContent = "Dark"
        button.setAttribute("title", "Switch to dark theme")
      }
    })
  }

  bindEvents() {
    // Use event delegation for theme toggle buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".theme-toggle")) {
        e.preventDefault()
        this.toggleTheme()
      }
    })

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? "dark" : "light")
        }
      })
    }

    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault()
        this.toggleTheme()
      }
    })
  }

  // Method to detect system preference
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }
    return "light"
  }

  // Method to reset to system preference
  resetToSystemTheme() {
    localStorage.removeItem("theme")
    this.applyTheme(this.getSystemTheme())
  }
}

// Initialize theme switcher when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.themeSwitcher = new ThemeSwitcher()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeSwitcher
}
