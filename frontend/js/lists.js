document.addEventListener('DOMContentLoaded', async () => {
  // Giriş kontrolü
  if (!Auth.checkAuth()) {
    return window.location.href = 'index.html';
  }

  // Form elementleri
  const createListForm  = document.getElementById('createListForm');
  const listName        = document.getElementById('listName');
  const listCategory    = document.getElementById('listCategory');
  const listColor       = document.getElementById('listColor');
  const listDescription = document.getElementById('listDescription');
  const logoutButton    = document.getElementById('logoutButton');
  const listsContainer  = document.getElementById('listsContainer');

  // Kullanıcı e-postasını yaz
  document.getElementById('userEmail').textContent = Auth.getUserEmail();

  // Liste çek ve göster
  try {
  const res = await fetch(`${API_BASE}/lists`, {
    headers: Auth.getHeaders()
  });

  const text = await res.text(); // json yerine text al
  console.log("Gelen ham yanıt:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("JSON parse hatası:", err);
    return;
  }

  if (!Array.isArray(data)) {
    console.error("Dönen veri array değil:", data);
    return;
  }

  renderLists(data);
} catch (err) {
  console.error("Fetch hatası:", err);
}

  // Liste oluştur
  createListForm.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      name:        listName.value.trim(),
      category:    listCategory.value,
      color:       listColor.value,
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
          console.error('Yeni çekilen veriler array değil:', newLists);
          return;
        }

        renderLists(newLists);
        createListForm.reset();
      } else {
        const error = await res.json();
        console.error('Liste oluşturulamadı:', error.message || res.status);
      }
    } catch (err) {
      console.error('Oluşturma sırasında hata:', err);
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      console.log("Çıkış butonuna tıklandı");
      Auth.logout(); // localStorage temizle
      window.location.href = "index.html"; // anasayfaya dön
    });
  } else {
    console.warn("logoutButton bulunamadı!");
  }
});

// Listeyi ekranda göster
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