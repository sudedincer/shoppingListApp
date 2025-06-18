const API_BASE = "http://localhost:3000"; // Base URL for the backend API

const Auth = {
  // Checks if the user is authenticated (token exists)
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  // Retrieves the stored token from localStorage
  getToken() {
    return localStorage.getItem("token");
  },

  // Retrieves the stored user email from localStorage
  getUserEmail() {
    return localStorage.getItem("userEmail");
  },

  // Constructs headers for authenticated API requests
  getHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // attaches token as Bearer token
    };
  },

  // Handles user login by sending email and password to the backend
  async login(email, password) {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    // Token extraction from various possible response formats
    const token = data.access_token || data.token || data.data?.access_token;

    if (response.ok && token) {
      // Store token and email in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      return { success: true };
    } else {
      return {
        success: false,
        message: data.message || "Login failed.",
      };
    }
  },

  // Handles user registration by sending email and password to the backend
  async register(email, password) {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 201) {
      return { success: true };
    } else {
      return {
        success: false,
        message: data.message || "Registration failed.",
      };
    }
  },

  // Logs out the user by clearing token and user data and redirecting to index.html
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    console.log("Logged out, redirecting...");
    window.location.href = "index.html";
  },

  // Redirects to login page if user is not authenticated
  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },
};

// On every page load, if it's a protected page and user is not authenticated,
// redirect to the login page
document.addEventListener("DOMContentLoaded", () => {
  const publicPages = ["index.html", "index", "register.html", "register"];
  const currentPage = window.location.pathname.split("/").pop();

  if (!publicPages.includes(currentPage) && !Auth.isAuthenticated()) {
    window.location.href = "index.html";
  }
});