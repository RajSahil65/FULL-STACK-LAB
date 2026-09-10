const API_URL = '/students';

const form = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formMessage = document.getElementById('formMessage');
const listMessage = document.getElementById('listMessage');
const tableBody = document.getElementById('studentTableBody');
const refreshBtn = document.getElementById('refreshBtn');

const fields = {
  id: document.getElementById('studentId'),
  name: document.getElementById('name'),
  rollNo: document.getElementById('rollNo'),
  course: document.getElementById('course'),
  marks: document.getElementById('marks'),
};

const errors = {
  name: document.getElementById('nameError'),
  rollNo: document.getElementById('rollNoError'),
  course: document.getElementById('courseError'),
  marks: document.getElementById('marksError'),
};

// ---------- Client-side validation ----------
function validateForm() {
  let isValid = true;
  Object.values(errors).forEach((el) => (el.textContent = ''));

  if (!fields.name.value.trim()) {
    errors.name.textContent = 'Name is required';
    isValid = false;
  }

  if (!fields.rollNo.value.trim()) {
    errors.rollNo.textContent = 'Roll No. is required';
    isValid = false;
  }

  if (!fields.course.value.trim()) {
    errors.course.textContent = 'Course is required';
    isValid = false;
  }

  const marksVal = fields.marks.value;
  if (marksVal === '') {
    errors.marks.textContent = 'Marks are required';
    isValid = false;
  } else {
    const marksNum = Number(marksVal);
    if (Number.isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      errors.marks.textContent = 'Marks must be between 0 and 100';
      isValid = false;
    }
  }

  return isValid;
}

function showFormMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
  setTimeout(() => {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }, 3500);
}

function resetForm() {
  form.reset();
  fields.id.value = '';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.classList.add('hidden');
  Object.values(errors).forEach((el) => (el.textContent = ''));
}

// ---------- API calls (fetch + async/await) ----------
async function fetchStudents() {
  try {
    const res = await fetch(API_URL);
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch students');
    }
    renderTable(result.data);
  } catch (err) {
    listMessage.textContent = err.message;
    listMessage.className = 'form-message error';
  }
}

async function createStudent(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

async function updateStudent(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// ---------- Rendering ----------
function renderTable(students) {
  tableBody.innerHTML = '';

  if (!students.length) {
    tableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No student records yet.</td></tr>';
    return;
  }

  students.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.rollNo)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${s.marks}</td>
      <td class="row-actions">
        <button class="secondary edit-btn" data-id="${s._id}">Edit</button>
        <button class="danger delete-btn" data-id="${s._id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  document.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', () => startEdit(btn.dataset.id, students))
  );
  document.querySelectorAll('.delete-btn').forEach((btn) =>
    btn.addEventListener('click', () => handleDelete(btn.dataset.id))
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function startEdit(id, students) {
  const student = students.find((s) => s._id === id);
  if (!student) return;

  fields.id.value = student._id;
  fields.name.value = student.name;
  fields.rollNo.value = student.rollNo;
  fields.course.value = student.course;
  fields.marks.value = student.marks;

  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDelete(id) {
  if (!confirm('Delete this student record?')) return;
  try {
    const { ok, data } = await deleteStudent(id);
    if (!ok || !data.success) throw new Error(data.message || 'Delete failed');
    await fetchStudents();
    showFormMessage('Student deleted successfully', 'success');
  } catch (err) {
    showFormMessage(err.message, 'error');
  }
}

// ---------- Form submit (create or update) ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    name: fields.name.value.trim(),
    rollNo: fields.rollNo.value.trim(),
    course: fields.course.value.trim(),
    marks: Number(fields.marks.value),
  };

  const id = fields.id.value;

  try {
    submitBtn.disabled = true;
    const { ok, data } = id ? await updateStudent(id, payload) : await createStudent(payload);

    if (!ok || !data.success) {
      throw new Error(data.message || 'Request failed');
    }

    showFormMessage(id ? 'Student updated successfully' : 'Student added successfully', 'success');
    resetForm();
    await fetchStudents();
  } catch (err) {
    showFormMessage(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

cancelEditBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', fetchStudents);

// Initial load
fetchStudents();
