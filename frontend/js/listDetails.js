

document.addEventListener("DOMContentLoaded", () => {
  // Liste ID'sini URL parametresinden oku
  const params = new URLSearchParams(window.location.search);
  const listId = params.get('listId');
  if (!listId || listId === 'null' || listId === 'undefined') {
    alert('Geçersiz liste ID');
    window.location.href = 'lists.html';
    return;
  }

  const API_BASE = "http://localhost:3000";

  const Auth = {
    checkAuth: () => {
      const token = localStorage.getItem("token");
      return !!token;
    },
    getUserEmail: () => {
      return localStorage.getItem("userEmail") || "";
    },
    getHeaders: () => {
      const token = localStorage.getItem("token");
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      window.location.href = "index.html";
    },
  };

  if (!Auth.checkAuth()) {
    return;
  }

  // DOM elementleri
  const userEmailElement = document.getElementById("userEmail");
  const addItemForm = document.getElementById("addItemForm");
  const pendingItemsContainer = document.getElementById("pendingItemsContainer");
  const completedItemsContainer = document.getElementById("completedItemsContainer");
  const pendingItems = document.getElementById("pendingItems");
  const completedItems = document.getElementById("completedItems");
  const pendingCount = document.getElementById("pendingCount");
  const completedCount = document.getElementById("completedCount");
  const emptyState = document.getElementById("emptyState");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const errorAlert = document.getElementById("errorAlert");
  const logoutButton = document.getElementById("logoutButton");
  const itemNameInput = document.getElementById("itemName");
  const quantityInput = document.getElementById("quantity");
  const addButton = document.getElementById("addButton");
  const unitInput = document.getElementById("unit");

  userEmailElement.textContent = Auth.getUserEmail();

  logoutButton.addEventListener("click", () => {
    Auth.logout();
  });

  addItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addItem();
  });

  async function fetchItems() {
    const res = await fetch(`${API_BASE}/items?listId=${listId}`, {
      headers: Auth.getHeaders()
    });
    const items = await res.json();
    renderItems(items);
  }

  function renderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      showEmptyState(true);
      return;
    }

    showEmptyState(false);

    const pendingItemsList = items.filter((item) => !item.bought);
    const completedItemsList = items.filter((item) => item.bought);

    pendingCount.textContent = pendingItemsList.length;
    completedCount.textContent = completedItemsList.length;

    pendingItems.innerHTML = "";
    completedItems.innerHTML = "";

    pendingItemsList.forEach((item) => {
      const itemElement = createItemElement(item);
      pendingItems.appendChild(itemElement);
    });

    completedItemsList.forEach((item) => {
      const itemElement = createItemElement(item);
      completedItems.appendChild(itemElement);
    });

    pendingItemsContainer.style.display = pendingItemsList.length > 0 ? "block" : "none";
    completedItemsContainer.style.display = completedItemsList.length > 0 ? "block" : "none";
  }

  function createItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.className = "list-group-item d-flex justify-content-between align-items-center";

    const contentClass = item.bought ? "text-muted text-strikethrough" : "";
    const badgeClass = item.bought ? "bg-success-subtle text-success" : "bg-light text-dark";

    itemElement.innerHTML = `
      <div>
        <span class="${contentClass}">${item.itemName}</span>
        <span class="badge item-quantity ${badgeClass} ms-2">${item.quantity} ${item.unit}</span>
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
    `;

    const toggleButton = itemElement.querySelector('[data-action="toggle"]');
    const deleteButton = itemElement.querySelector('[data-action="delete"]');

    toggleButton.addEventListener("click", () => {
      toggleItemStatus(item._id, item.bought);
    });

    deleteButton.addEventListener("click", () => {
      deleteItem(item._id);
    });

    return itemElement;
  }

  async function addItem() {
    const itemName = itemNameInput.value.trim();
    const quantity = Number.parseFloat(quantityInput.value) || 1;
    const unit = unitInput.value;

    if (!itemName) return;

    addButton.disabled = true;
    hideError();

    try {
      const res = await fetch(`${API_BASE}/items/create`, {
        method: 'POST',
        headers: Auth.getHeaders(),
        body: JSON.stringify({
          itemName,
          quantity,
          unit,
          bought: false,
          userEmail: Auth.getUserEmail(),
          listId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return showError(err.message || 'Öğe eklenemedi.');
      }

      itemNameInput.value = '';
      quantityInput.value = '1';
      fetchItems();
    } catch (e) {
      showError('Sunucu hatası oluştu.');
    } finally {
      addButton.disabled = false;
    }
  }

  async function toggleItemStatus(id, currentStatus) {
    hideError();

    try {
      const response = await fetch(`${API_BASE}/items/update/${id}`, {
        method: "PATCH",
        headers: Auth.getHeaders(),
        body: JSON.stringify({
          bought: !currentStatus,
        })
      });

      if (response.ok) {
        fetchItems();
      } else {
        const errorData = await response.json();
        showError(errorData.message || "Durum güncellenirken hata oluştu.");
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.");
    }
  }

  async function deleteItem(id) {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    hideError();

    try {
      const response = await fetch(`${API_BASE}/items/delete/${id}`, {
        method: "DELETE",
        headers: Auth.getHeaders(),
      });

      if (response.ok) {
        fetchItems();
      } else {
        const errorData = await response.json();
        showError(errorData.message || "Öğe silinirken hata oluştu.");
      }
    } catch (error) {
      showError("Sunucuya bağlanırken hata oluştu.");
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.classList.remove("d-none");
      pendingItemsContainer.style.display = "none";
      completedItemsContainer.style.display = "none";
      emptyState.classList.add("d-none");
    } else {
      loadingSpinner.classList.add("d-none");
    }
  }

  function showEmptyState(isEmpty) {
    if (isEmpty) {
      emptyState.classList.remove("d-none");
      pendingItemsContainer.style.display = "none";
      completedItemsContainer.style.display = "none";
    } else {
      emptyState.classList.add("d-none");
    }
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove("d-none");
    setTimeout(() => {
      errorAlert.classList.add("d-none");
    }, 5000);
  }

  function hideError() {
    errorAlert.classList.add("d-none");
  }

  async function loadListInfo() {
    const res = await fetch(`${API_BASE}/lists/${listId}`, {
      headers: Auth.getHeaders()
    });
    if (!res.ok) return;
    const list = await res.json();
    document.getElementById('listTitle').textContent = list.name;
    document.getElementById('listDesc').textContent = list.description || '';
  }

  loadListInfo();
  fetchItems();
});