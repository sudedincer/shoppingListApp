document.addEventListener("DOMContentLoaded", () => {
  // Auth kontrolü
  const Auth = {
    checkAuth: () => {
      const token = localStorage.getItem("token")
      return !!token
    },
    getUserEmail: () => {
      return localStorage.getItem("email") || ""
    },
    getHeaders: () => {
      const token = localStorage.getItem("token")
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    },
    logout: () => {
      localStorage.removeItem("token")
      localStorage.removeItem("email")
      window.location.href = "index.html"
    },
  }

  const API_BASE = "http://localhost:3000";

  if (!Auth.checkAuth()) {
    return
  }

  // DOM elementleri
  const userEmailElement = document.getElementById("userEmail")
  const addItemForm = document.getElementById("addItemForm")
  const pendingItemsContainer = document.getElementById("pendingItemsContainer")
  const completedItemsContainer = document.getElementById("completedItemsContainer")
  const pendingItems = document.getElementById("pendingItems")
  const completedItems = document.getElementById("completedItems")
  const pendingCount = document.getElementById("pendingCount")
  const completedCount = document.getElementById("completedCount")
  const emptyState = document.getElementById("emptyState")
  const loadingSpinner = document.getElementById("loadingSpinner")
  const errorAlert = document.getElementById("errorAlert")
  const logoutButton = document.getElementById("logoutButton")
  const itemNameInput = document.getElementById("itemName")
  const quantityInput = document.getElementById("quantity")
  const addButton = document.getElementById("addButton")

  // Kullanıcı email'ini göster
  userEmailElement.textContent = Auth.getUserEmail()

  // Çıkış butonuna event listener ekle
  logoutButton.addEventListener("click", () => {
    Auth.logout()
  })

  // Öğe ekleme formuna event listener ekle
  addItemForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    await addItem()
  })

  // Sayfa yüklendiğinde öğeleri getir
  fetchItems()

  // Öğeleri getir
  async function fetchItems() {
    showLoading(true)
    hideError()

    try {
      const response = await fetch(`${API_BASE}/items`, {
        headers: Auth.getHeaders(),
      })

      if (response.ok) {
        const items = await response.json()
        renderItems(items)
      } else if (response.status === 401 || response.status === 403) {
        Auth.logout()
      } else {
        const errorData = await response.json()
        showError(errorData.message || "Öğeleri getirirken hata oluştu.")
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.")
    } finally {
      showLoading(false)
    }
  }

  // Öğeleri render et
  function renderItems(items) {
    if (items.length === 0) {
      showEmptyState(true)
      return
    }

    showEmptyState(false)

    const pendingItemsList = items.filter((item) => !item.bought)
    const completedItemsList = items.filter((item) => item.bought)

    // Sayaçları güncelle
    pendingCount.textContent = pendingItemsList.length
    completedCount.textContent = completedItemsList.length

    // Listeleri temizle
    pendingItems.innerHTML = ""
    completedItems.innerHTML = ""

    // Alınacak öğeleri listele
    pendingItemsList.forEach((item) => {
      const itemElement = createItemElement(item)
      pendingItems.appendChild(itemElement)
    })

    // Tamamlanmış öğeleri listele
    completedItemsList.forEach((item) => {
      const itemElement = createItemElement(item)
      completedItems.appendChild(itemElement)
    })

    // Container'ları göster/gizle
    pendingItemsContainer.style.display = pendingItemsList.length > 0 ? "block" : "none"
    completedItemsContainer.style.display = completedItemsList.length > 0 ? "block" : "none"
  }

  // Öğe HTML elementini oluştur
  function createItemElement(item) {
    const itemElement = document.createElement("div")
    itemElement.className = "list-group-item d-flex justify-content-between align-items-center"

    const contentClass = item.bought ? "text-muted text-strikethrough" : ""
    const badgeClass = item.bought ? "bg-success-subtle text-success" : "bg-light text-dark"

    itemElement.innerHTML = `
      <div>
        <span class="${contentClass}">${item.itemName}</span>
        <span class="badge item-quantity ${badgeClass} ms-2">${item.quantity} adet</span>
        ${item.bought ? '<span class="badge bg-success ms-2">Alındı</span>' : ""}
      </div>
      <div class="item-buttons">
        <button class="btn btn-sm ${item.bought ? "btn-outline-secondary" : "btn-outline-success"} me-1" 
                data-action="toggle" data-id="${item._id}" data-status="${item.bought}">
          <i class="bi ${item.bought ? "bi-arrow-counterclockwise" : "bi-check"}"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item._id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `

    // Butonlara event listener'lar ekle
    const toggleButton = itemElement.querySelector('[data-action="toggle"]')
    const deleteButton = itemElement.querySelector('[data-action="delete"]')

    toggleButton.addEventListener("click", () => {
      toggleItemStatus(item._id, item.bought)
    })

    deleteButton.addEventListener("click", () => {
      deleteItem(item._id)
    })

    return itemElement
  }

  // Yeni öğe ekle
  async function addItem() {
    const itemName = itemNameInput.value.trim()
    const quantity = Number.parseInt(quantityInput.value) || 1

    if (!itemName) return

    addButton.disabled = true
    addButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ekleniyor...'
    hideError()

    try {
      const response = await fetch(`${API_BASE}/items/create`, {
        method: "POST",
        headers: Auth.getHeaders(),
        body: JSON.stringify({
          itemName,
          quantity,
          bought: false,
        }),
      })

      if (response.ok) {
        itemNameInput.value = ""
        quantityInput.value = "1"
        fetchItems()
      } else {
        const errorData = await response.json()
        showError(errorData.message || "Öğe eklenirken hata oluştu.")
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.")
    } finally {
      addButton.disabled = false
      addButton.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Ekle'
    }
  }

  // Öğe durumunu güncelle (alındı/alınacak)
  async function toggleItemStatus(id, currentStatus) {
    hideError()

    try {
      const response = await fetch(`${API_BASE}/items/update/${id}`, {
        method: "PATCH",
        headers: Auth.getHeaders(),
        body: JSON.stringify({
          bought: !currentStatus,
        }),
      })

      if (response.ok) {
        fetchItems()
      } else {
        const errorData = await response.json()
        showError(errorData.message || "Durum güncellenirken hata oluştu.")
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.")
    }
  }

  // Öğeyi sil
  async function deleteItem(id) {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return
    }

    hideError()

    try {
      const response = await fetch(`${API_BASE}/items/delete/${id}`, {
        method: "DELETE",
        headers: Auth.getHeaders(),
      })

      if (response.ok) {
        fetchItems()
      } else {
        const errorData = await response.json()
        showError(errorData.message || "Öğe silinirken hata oluştu.")
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.")
    }
  }

  // Yükleme göstergesi
  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.classList.remove("d-none")
      pendingItemsContainer.style.display = "none"
      completedItemsContainer.style.display = "none"
      emptyState.classList.add("d-none")
    } else {
      loadingSpinner.classList.add("d-none")
    }
  }

  // Boş durum göster/gizle
  function showEmptyState(isEmpty) {
    if (isEmpty) {
      emptyState.classList.remove("d-none")
      pendingItemsContainer.style.display = "none"
      completedItemsContainer.style.display = "none"
    } else {
      emptyState.classList.add("d-none")
    }
  }

  // Hata mesajı göster
  function showError(message) {
    errorAlert.textContent = message
    errorAlert.classList.remove("d-none")

    // 5 saniye sonra error mesajını gizle
    setTimeout(() => {
      errorAlert.classList.add("d-none")
    }, 5000)
  }

  // Hata mesajını gizle
  function hideError() {
    errorAlert.classList.add("d-none")
  }
})
