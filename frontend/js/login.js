document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const errorAlert = document.getElementById("errorAlert");

  // If user is already authenticated, redirect to lists page
  if (Auth.isAuthenticated()) {
    window.location.href = "lists.html";
    return;
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validate form fields
    if (!email || !password) {
      showError("Email and password are required.");
      return;
    }

    // Disable button and show loading spinner
    loginButton.disabled = true;
    loginButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';

    try {
      const result = await Auth.login(email, password);

      if (result.success) {
        // Redirect to lists page after successful login
        window.location.href = "lists.html";
      } else {
        // Show error message if login failed
        showError(result.message);
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
      }
    } catch (error) {
      showError("Failed to connect to server. Please try again.");
      loginButton.disabled = false;
      loginButton.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
    }
  });

  // Display error message in alert box
  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove("d-none");

    // Hide error message after 5 seconds
    setTimeout(() => {
      errorAlert.classList.add("d-none");
    }, 5000);
  }
});