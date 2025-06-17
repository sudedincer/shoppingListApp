document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const registerButton = document.getElementById("registerButton")
  const errorAlert = document.getElementById("errorAlert")

  // Eğer kullanıcı zaten giriş yapmışsa,yönlendir
  if (Auth.isAuthenticated()) {
    window.location.href = "lists.html"
    return
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Form validasyonu
    if (!email || !password) {
      showError("Email ve şifre gereklidir.")
      return
    }

    if (password !== confirmPassword) {
      showError("Şifreler eşleşmiyor.")
      return
    }

    if (password.length < 6) {
      showError("Şifre en az 6 karakter olmalıdır.")
      return
    }

    // Register butonu loading göster
    registerButton.disabled = true
    registerButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Kayıt yapılıyor...'

    try {
      const response = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.")
        window.location.href = "index.html"
      } else {
        showError(result.message || "Kayıt başarısız.")
        registerButton.disabled = false
        registerButton.innerHTML = '<i class="bi bi-person-plus me-2"></i>Kayıt Ol'
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu. Lütfen tekrar deneyin.")
      registerButton.disabled = false
      registerButton.innerHTML = '<i class="bi bi-person-plus me-2"></i>Kayıt Ol'
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
