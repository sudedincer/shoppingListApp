document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const loginButton = document.getElementById("loginButton")
  const errorAlert = document.getElementById("errorAlert")

  // Eğer kullanıcı zaten giriş yapmışsa, app.html'e yönlendir
  if (Auth.isAuthenticated()) {
    window.location.href = "app.html"
    return
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value

    // Form validasyonu
    if (!email || !password) {
      showError("Email ve şifre gereklidir.")
      return
    }

    // Login butonu loading göster
    loginButton.disabled = true
    loginButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Giriş yapılıyor...'

    try {
      const result = await Auth.login(email, password)

      if (result.success) {
        window.location.href = "app.html"
      } else {
        showError(result.message)
        loginButton.disabled = false
        loginButton.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Giriş Yap'
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu. Lütfen tekrar deneyin.")
      loginButton.disabled = false
      loginButton.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Giriş Yap'
    }
  })

  // Hata mesajı göster
  function showError(message) {
    errorAlert.textContent = message
    errorAlert.classList.remove("d-none")

    // 5 saniye sonra error mesajını gizle
    setTimeout(() => {
            errorAlert.classList.add("d-none")
    }, 5000)
  }
})
