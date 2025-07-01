const API_URL = 'http://localhost:3000/items';

const itemList = document.getElementById('itemList');
const itemForm = document.getElementById('itemForm');
const itemIdField = document.getElementById('itemId');
const nameField = document.getElementById('name');
const descriptionField = document.getElementById('description');
const cancelEditBtn = document.getElementById('cancelEdit');

// Utility: escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

// Fetch and display all items
async function fetchItems() {
  try {
    const res = await fetch(API_URL);
    const items = await res.json();
    itemList.innerHTML = '';
    items.forEach(renderItem);
  } catch (err) {
    alert('Error loading items.');
    console.error(err);
  }
}

// Render item in list
function renderItem(item) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-start';
  li.setAttribute('data-id', item.id);

  li.innerHTML = `
    <div>
      <h5 class="mb-1">${escapeHTML(item.name)}</h5>
      <p class="mb-1">${escapeHTML(item.description)}</p>
    </div>
    <div>
      <button class="btn btn-sm btn-warning me-2 edit-btn">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    </div>
  `;
  itemList.appendChild(li);
}

// Form submit: create or update
itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = itemIdField.value;
  const name = nameField.value.trim();
  const description = descriptionField.value.trim();

  if (!name || !description) return;

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (!res.ok) throw new Error('Save failed');

    itemForm.reset();
    itemIdField.value = '';
    cancelEditBtn.classList.add('d-none');
    fetchItems();
  } catch (err) {
    alert('Failed to save item.');
    console.error(err);
  }
});

// Cancel editing
cancelEditBtn.addEventListener('click', () => {
  itemForm.reset();
  itemIdField.value = '';
  cancelEditBtn.classList.add('d-none');
});

// Event delegation for Edit & Delete
itemList.addEventListener('click', (e) => {
  const btn = e.target;
  const li = btn.closest('li');
  const id = li.getAttribute('data-id');

  if (btn.classList.contains('delete-btn')) {
    deleteItem(id);
  }

  if (btn.classList.contains('edit-btn')) {
    const name = li.querySelector('h5').textContent;
    const description = li.querySelector('p').textContent;

    itemIdField.value = id;
    nameField.value = name;
    descriptionField.value = description;
    cancelEditBtn.classList.remove('d-none');
  }
});

// Delete item
async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    fetchItems();
  } catch (err) {
    alert('Failed to delete item.');
    console.error(err);
  }
}

// Load items on start
fetchItems();
