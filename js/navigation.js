document.addEventListener("DOMContentLoaded", () => {
  // Navigation functionality
  const navLinks = document.querySelectorAll(".nav-link")
  const tabContents = document.querySelectorAll(".tab-content")

  // Navigation link handling
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      const targetTab = link.getAttribute("data-tab")

      // Remove active class from all nav links
      navLinks.forEach((navLink) => navLink.classList.remove("active"))

      // Add active class to clicked link
      link.classList.add("active")

      // Hide all tab contents
      tabContents.forEach((content) => content.classList.remove("active"))

      // Show target tab content
      const targetContent = document.getElementById(targetTab)
      if (targetContent) {
        targetContent.classList.add("active")
      }

      // Update URL hash for better UX
      window.location.hash = targetTab
    })
  })

  // Handle initial page load with hash
  const initialHash = window.location.hash.substring(1)
  if (initialHash) {
    const targetLink = document.querySelector(`[data-tab="${initialHash}"]`)
    if (targetLink) {
      targetLink.click()
    }
  }
})
