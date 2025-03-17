document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("dark-mode-toggle");
    const body = document.body;

    // Load saved dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        toggleButton.textContent = "☀️ Light Mode";
    }

    toggleButton.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDarkMode = body.classList.contains("dark-mode");

        // Update button text
        toggleButton.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";

        // Save preference
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    });
});