document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://localhost:3000";

  // Authentication helper object
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

  // Redirect to login page if not authenticated
  if (!Auth.checkAuth()) {
    return window.location.href = 'index.html';
  }

  // Get DOM elements
  const createListForm  = document.getElementById('createListForm');
  const listName        = document.getElementById('listName');
  const listCategory    = document.getElementById('listCategory');
  const listColor       = document.getElementById('listColor');
  const listDescription = document.getElementById('listDescription');
  const logoutButton    = document.getElementById('logoutButton');
  const listsContainer  = document.getElementById('listsContainer');
  const userEmailEl     = document.getElementById('userEmail');

  // Display user email in header
  userEmailEl.textContent = Auth.getUserEmail();

  // Logout handler
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      console.log("Logout button clicked");
      Auth.logout();
    });
  } else {
    console.warn("logoutButton not found!");
  }

  // Fetch all lists belonging to the user
  try {
    const res = await fetch(`${API_BASE}/lists`, {
      headers: Auth.getHeaders()
    });

    const text = await res.text(); // raw response text
    console.log("Raw response:", text);

    let data;
    try {
      data = JSON.parse(text); // try to parse JSON
    } catch (err) {
      console.error("JSON parse error:", err);
      return;
    }

    if (!Array.isArray(data)) {
      console.error("Returned data is not an array:", data);
      return;
    }

    renderLists(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }

  // Form submission to create a new list
  createListForm.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      name: listName.value.trim(),
      category: listCategory.value,
      color: listColor.value,
      description: listDescription.value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/lists/create`, {
        method: 'POST',
        headers: Auth.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newLists = await fetch(`${API_BASE}/lists`, {
          headers: Auth.getHeaders()
        }).then(r => r.json());

        if (!Array.isArray(newLists)) {
          console.error('Newly fetched data is not an array:', newLists);
          return;
        }

        renderLists(newLists);
        createListForm.reset();
      } else {
        const error = await res.json();
        console.error('Failed to create list:', error.message || res.status);
      }
    } catch (err) {
      console.error('Error while creating list:', err);
    }
  });

  // Render list cards into the container
  function renderLists(lists) {
    listsContainer.innerHTML = '';

    lists.forEach(list => {
      const id = list._id || list.id;
      const card = document.createElement('a');
      card.href = `listDetails.html?listId=${id}`;
      card.className = 'col-md-4 text-decoration-none';

      card.innerHTML = `
        <div class="card mb-3 border-${list.color}">
          <div class="card-body">
            <h5 class="card-title text-dark">${list.name}</h5>
            <p class="card-text text-muted">${list.description || ''}</p>
          </div>
        </div>
      `;

      listsContainer.appendChild(card);
    });
  }
});