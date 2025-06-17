const API_BASE = "http://localhost:3000";

// Auth yardımcı fonksiyonları
const Auth = {
  // Token kontrolü
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  // Token alma
  getToken() {
    return localStorage.getItem("token");
  },

  // Kullanıcı email alma
  getUserEmail() {
    return localStorage.getItem("userEmail"); // burada 'userEmail' doğru key
  },

  // Authorization Header oluşturma
  getHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  },

  // Giriş yapma
  async login(email, password) {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    const token = data.access_token || data.token || data.data?.access_token;

    if (response.ok && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      return { success: true };
    } else {
      return {
        success: false,
        message: data.message || "Giriş başarısız oldu.",
      };
    }
  },

  // Kayıt olma
  async register(email, password) {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 201) {
      return { success: true };
    } else {
      return {
        success: false,
        message: data.message || "Kayıt başarısız oldu.",
      };
    }
  },

  // Çıkış yapma
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    console.log("Çıkış yapıldı, yönlendiriliyor...");
    window.location.href = "index.html";
  },

  // Sayfa auth kontrolü
  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },
};

// Oturum kontrolünü sadece korunan sayfalarda yap
document.addEventListener("DOMContentLoaded", () => {
  const publicPages = ["index.html", "index", "register.html", "register"];
  const currentPage = window.location.pathname.split("/").pop();

  if (!publicPages.includes(currentPage) && !Auth.isAuthenticated()) {
    window.location.href = "index.html";
  }
});