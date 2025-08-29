// Show Add Department Modal
document.addEventListener('DOMContentLoaded', function() {
  const addDepartmentBtn = document.getElementById('addDepartmentBtn');
  if (addDepartmentBtn) {
    addDepartmentBtn.addEventListener('click', function() {
      new bootstrap.Modal(document.getElementById('addDepartmentModal')).show();
    });
  }
  const addDepartmentSaveBtn = document.getElementById('addDepartmentSaveBtn');
  if (addDepartmentSaveBtn) {
    addDepartmentSaveBtn.addEventListener('click', async function() {
      const form = document.getElementById('addDepartmentForm');
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const formData = new FormData(form);
      try {
        const response = await fetch(`${BASE_URL}/insertDepartment.php`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.status.code === "200") {
          console.log('addDepartment: success', data.data);
          form.reset();
          bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal')).hide();
          // Refresh departments table and dropdowns so new department is immediately usable
          waitForFunction('loadDepartmentsTable', function() {
            console.log('addDepartment: calling loadDepartmentsTable');
            loadDepartmentsTable();
          });
          waitForFunction('loadDepartments', function() {
            console.log('addDepartment: refreshing dropdowns');
            loadDepartments('addDepartmentSelect');
            loadDepartments('editDepartmentSelect');
          });
          // Fallback: append row immediately so UI reflects change right away
          try {
            const tableBody = document.getElementById('departmentTableBody');
            const newRow = document.createElement('tr');
            newRow.dataset.id = data.data.id;
            newRow.innerHTML = `
              <td>${data.data.name}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editDepartment(${data.data.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${data.data.id})">Delete</button>
              </td>
            `;
            tableBody.appendChild(newRow);
          } catch (e) {
            /* ignore DOM fallback errors */
          }
        } else {
          alert('Failed to add department.');
        }
      } catch (err) {
        alert('Error adding department.');
      }
    });
  }
});
// Edit Department (placeholder)
// Edit Department: open modal and populate fields
function editDepartment(id) {
  // Always fetch the latest department data before editing
  fetch(`${BASE_URL}/getDepartmentByID.php?id=${id}&t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      if (data.status.code === "200" && data.data && data.data[0]) {
        document.getElementById('editDepartmentId').value = data.data[0].id;
        document.getElementById('editDepartmentName').value = data.data[0].name;
        new bootstrap.Modal(document.getElementById('editDepartmentModal')).show();
      } else {
        alert('Failed to load department details.');
      }
    })
    .catch(() => alert('Error loading department details.'));
}

// Save edited department
document.addEventListener('DOMContentLoaded', function() {
  const editDepartmentSaveBtn = document.getElementById('editDepartmentSaveBtn');
  if (editDepartmentSaveBtn) {
    editDepartmentSaveBtn.addEventListener('click', async function() {
      const form = document.getElementById('editDepartmentForm');
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const formData = new FormData(form);
      try {
        const response = await fetch(`${BASE_URL}/updateDepartment.php`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.status.code === "200") {
          console.log('editDepartment: success', data.data);
          form.reset();
          bootstrap.Modal.getInstance(document.getElementById('editDepartmentModal')).hide();
          // Refresh departments table and dropdowns after edit
          waitForFunction('loadDepartmentsTable', function() {
            console.log('editDepartment: calling loadDepartmentsTable');
            loadDepartmentsTable();
          });
          waitForFunction('loadDepartments', function() {
            loadDepartments('addDepartmentSelect');
            loadDepartments('editDepartmentSelect');
          });
          // Fallback: update existing row in DOM if present
          try {
            const tableBody = document.getElementById('departmentTableBody');
            const row = tableBody.querySelector(`tr[data-id="${data.data.id}"]`);
            if (row) {
              row.children[0].textContent = data.data.name;
            }
          } catch (e) {
            /* ignore DOM fallback errors */
          }
        } else {
          alert('Failed to update department.');
        }
      } catch (err) {
        alert('Error updating department.');
      }
    });
  }
});

// Delete Department (placeholder)
function deleteDepartment(id) {
  if (confirm('Are you sure you want to delete this department?')) {
    fetch(`${BASE_URL}/deleteDepartmentByID.php?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.status.code === "200") {
          console.log('deleteDepartment: success', id);
          // Refresh departments table and dropdowns after delete
          waitForFunction('loadDepartmentsTable', function() {
            console.log('deleteDepartment: calling loadDepartmentsTable');
            loadDepartmentsTable();
          });
          waitForFunction('loadDepartments', function() {
            loadDepartments('addDepartmentSelect');
            loadDepartments('editDepartmentSelect');
          });
          // Fallback: remove row from DOM if present
          try {
            const tableBody = document.getElementById('departmentTableBody');
            const row = tableBody.querySelector(`tr[data-id="${id}"]`);
            if (row) row.remove();
          } catch (e) {
            /* ignore DOM fallback errors */
          }
        } else {
          alert('Failed to delete department.');
        }
      })
      .catch(() => alert('Error deleting department.'));
  }
}
// Base API path
const BASE_URL = "http://localhost/poojaAB/companydirectory/libs/php/";

// Helper: wait for a global function to be defined before calling it (avoid race)
function waitForFunction(name, cb, interval = 50, timeout = 1500) {
  const start = Date.now();
  (function check() {
    if (typeof window[name] === 'function') return cb();
    if (Date.now() - start > timeout) return; // give up
    setTimeout(check, interval);
  })();
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Always reload department table when Departments tab is shown (Bootstrap tab event)
  const departmentsTabBtn = document.getElementById('departmentsBtn');
  if (departmentsTabBtn) {
    departmentsTabBtn.addEventListener('shown.bs.tab', function() {
      if (typeof loadDepartmentsTable === 'function') loadDepartmentsTable();
    });
  }
  // Load locations into Locations tab
  document.getElementById('locationsBtn').addEventListener('click', loadLocationsTable);

  async function loadLocationsTable() {
    try {
  const response = await fetch(`${BASE_URL}/getAll.php?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.status.code !== "200") {
        throw new Error("Server returned error: " + data.status.description);
      }
      renderLocationsTable(data.data);
    } catch (error) {
      console.error("Error fetching locations for table:", error);
    }
  }

  function renderLocationsTable(personnel) {
    const tableBody = document.getElementById("locationTableBody");
    tableBody.innerHTML = "";
    // Get unique locations
    const locations = Array.from(new Set(personnel.map(p => p.location))).filter(Boolean);
    locations.forEach((loc) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${loc}</td>`;
      tableBody.appendChild(row);
    });
  }
  // Location management: load, render, add, edit, delete
  async function loadLocationsTable() {
    try {
      console.log('loadLocationsTable: fetching locations');
      const response = await fetch(`${BASE_URL}/getAllLocations.php?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('loadLocationsTable: response', data);
      if (data.status.code !== "200") throw new Error('Server error: ' + data.status.description);
      renderLocationsList(data.data);
    } catch (err) {
      console.error('Error loading locations table:', err);
    }
  }

  function renderLocationsList(locations) {
    const tableBody = document.getElementById('locationTableBody');
    tableBody.innerHTML = '';
    locations.forEach(loc => {
      const row = document.createElement('tr');
      row.dataset.id = loc.id;
      row.innerHTML = `
        <td>${loc.name}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editLocation(${loc.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLocation(${loc.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Show Add Location Modal
  const addLocationBtn = document.getElementById('addLocationBtn');
  if (addLocationBtn) {
    addLocationBtn.addEventListener('click', function() {
      new bootstrap.Modal(document.getElementById('addLocationModal')).show();
    });
  }

  const addLocationSaveBtn = document.getElementById('addLocationSaveBtn');
  if (addLocationSaveBtn) {
    addLocationSaveBtn.addEventListener('click', async function() {
      const form = document.getElementById('addLocationForm');
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      const formData = new FormData(form);
      try {
        const res = await fetch(`${BASE_URL}/insertLocation.php`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status.code === '200') {
          console.log('addLocation: success', data.data);
          form.reset();
          bootstrap.Modal.getInstance(document.getElementById('addLocationModal')).hide();
          waitForFunction('loadLocationsTable', () => loadLocationsTable());
          waitForFunction('loadDepartments', () => loadDepartments('addDepartmentSelect'));
          // Fallback: append row
          try {
            const tableBody = document.getElementById('locationTableBody');
            const newRow = document.createElement('tr');
            newRow.dataset.id = data.data.id;
            newRow.innerHTML = `
              <td>${data.data.name}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editLocation(${data.data.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteLocation(${data.data.id})">Delete</button>
              </td>
            `;
            tableBody.appendChild(newRow);
          } catch (e) {}
        } else alert('Failed to add location.');
      } catch (e) { alert('Error adding location.'); }
    });
  }

  // Edit Location: fetch and show
  window.editLocation = function(id) {
    fetch(`${BASE_URL}/getLocationByID.php?id=${id}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.status.code === '200' && data.data && data.data[0]) {
          document.getElementById('editLocationId').value = data.data[0].id;
          document.getElementById('editLocationName').value = data.data[0].name;
          new bootstrap.Modal(document.getElementById('editLocationModal')).show();
        } else alert('Failed to load location details.');
      })
      .catch(() => alert('Error loading location.'));
  };

  // Save edited location
  const editLocationSaveBtn = document.getElementById('editLocationSaveBtn');
  if (editLocationSaveBtn) {
    editLocationSaveBtn.addEventListener('click', async function() {
      const form = document.getElementById('editLocationForm');
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      const formData = new FormData(form);
      try {
        const res = await fetch(`${BASE_URL}/updateLocation.php`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status.code === '200') {
          console.log('editLocation: success', data.data);
          form.reset();
          bootstrap.Modal.getInstance(document.getElementById('editLocationModal')).hide();
          waitForFunction('loadLocationsTable', () => loadLocationsTable());
          waitForFunction('loadDepartments', () => loadDepartments('addDepartmentSelect'));
          // Fallback: update DOM row
          try {
            const tableBody = document.getElementById('locationTableBody');
            const row = tableBody.querySelector(`tr[data-id="${data.data.id}"]`);
            if (row) row.children[0].textContent = data.data.name;
          } catch (e) {}
        } else alert('Failed to update location.');
      } catch (e) { alert('Error updating location.'); }
    });
  }

  // Delete location
  window.deleteLocation = function(id) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    fetch(`${BASE_URL}/deleteLocationByID.php?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.status.code === '200') {
          console.log('deleteLocation: success', id);
          waitForFunction('loadLocationsTable', () => loadLocationsTable());
          waitForFunction('loadDepartments', () => loadDepartments('addDepartmentSelect'));
          try { const tableBody = document.getElementById('locationTableBody'); const row = tableBody.querySelector(`tr[data-id="${id}"]`); if (row) row.remove(); } catch(e){}
        } else alert('Failed to delete location.');
      })
      .catch(() => alert('Error deleting location.'));
  };
  // Load departments into Departments tab
  document.getElementById('departmentsBtn').addEventListener('click', function() {
    if (typeof loadDepartmentsTable === 'function') loadDepartmentsTable();
    // Optionally, you can also focus the tab or do other UI logic here
  });

  window.loadDepartmentsTable = async function() {
    try {
      console.log('loadDepartmentsTable: fetching departments');
      const response = await fetch(`${BASE_URL}/getAllDepartments.php?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('loadDepartmentsTable: response', data);
      if (data.status.code !== "200") {
        throw new Error("Server returned error: " + data.status.description);
      }
      renderDepartmentsTable(data.data);
    } catch (error) {
      console.error("Error fetching departments for table:", error);
    }
  }

  window.renderDepartmentsTable = function(departments) {
  console.log('renderDepartmentsTable: rendering', departments && departments.length);
    const tableBody = document.getElementById("departmentTableBody");
    tableBody.innerHTML = "";
    departments.forEach((dept) => {
      const row = document.createElement("tr");
  row.dataset.id = dept.id;
      row.innerHTML = `
        <td>${dept.name}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editDepartment(${dept.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
  // Populate filter dropdowns
  function populateFilterDropdowns() {
  // Departments
  fetch(`${BASE_URL}/getAllDepartments.php?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).then(data => {
      const deptSelect = document.getElementById('filterDepartmentSelect');
      deptSelect.innerHTML = '<option value="">All Departments</option>';
      data.data.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        deptSelect.appendChild(option);
      });
    });
  // Locations
  fetch(`${BASE_URL}/getAll.php?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).then(data => {
      const locSelect = document.getElementById('filterLocationSelect');
      locSelect.innerHTML = '<option value="">All Locations</option>';
      // Get unique location names from personnel data
      const locations = [...new Set(data.data.map(d => d.location))].filter(Boolean);
      locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        locSelect.appendChild(option);
      });
    });
  }

  document.getElementById('filterBtn').addEventListener('click', function() {
    populateFilterDropdowns();
    new bootstrap.Modal(document.getElementById('filterModal')).show();
  });

  // Apply filter
  document.getElementById('applyFilterBtn').addEventListener('click', function () {
    const dept = document.getElementById('filterDepartmentSelect').value;
    const loc = document.getElementById('filterLocationSelect').value;
    const rows = document.querySelectorAll('#personnelTableBody tr');
    rows.forEach(row => {
      const deptCell = row.children[3]?.textContent || '';
      const locCell = row.children[4]?.textContent || '';
      let show = true;
      if (dept && deptCell !== dept) show = false;
      if (loc && locCell !== loc) show = false;
      row.style.display = show ? '' : 'none';
    });
  });
  // Refresh button functionality
  document.getElementById('refreshBtn').addEventListener('click', () => {
  // Clear the search box
  document.getElementById('searchInp').value = '';
  loadPersonnel();
  loadDepartments('addDepartmentSelect');
  loadDepartments('editDepartmentSelect');
  // Also reload Departments and Locations tab tables
  if (typeof loadDepartmentsTable === 'function') loadDepartmentsTable();
  if (typeof loadLocationsTable === 'function') loadLocationsTable();
  });
  // Enhanced search functionality with debounce
  let searchTimeout;
  document.getElementById('searchInp').addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.toLowerCase();
    searchTimeout = setTimeout(() => {
      const rows = document.querySelectorAll('#personnelTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }, 300);
  });
  loadPersonnel();
  loadDepartments('addDepartmentSelect');
  loadDepartments('editDepartmentSelect');

  document.getElementById('addSaveBtn').addEventListener('click', addPerson);
  document.getElementById('editSaveBtn').addEventListener('click', updatePerson);
});

// Fetch and display all personnel records
async function loadPersonnel() {
  try {
    const response = await fetch(`${BASE_URL}/getAll.php`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Personnel Data:", data);

    if (data.status.code !== "200") {
      throw new Error("Server returned error: " + data.status.description);
    }

    renderPersonnelTable(data.data);
  } catch (error) {
    console.error("Error fetching personnel:", error);
  }
}

// Render personnel into table
function renderPersonnelTable(personnel) {
  const tableBody = document.getElementById("personnelTableBody");
  tableBody.innerHTML = "";

  personnel.forEach((person) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${person.firstName} ${person.lastName}</td>
      <td>${person.jobTitle}</td>
      <td>${person.email}</td>
      <td>${person.department}</td>
      <td>${person.location}</td>
      <td>
        <button class="btn btn-sm btn-info me-1" onclick="viewProfile(${person.id})">View</button>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${person.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePerson(${person.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Show profile modal for an employee
function viewProfile(id) {
  fetch(`${BASE_URL}/getPersonnelByID.php?id=${id}`)
    .then(r => r.json())
    .then(result => {
      const person = result.data && result.data.personnel && result.data.personnel[0];
      if (!person) throw new Error('No person found');
      document.getElementById('profileName').textContent = person.firstName + ' ' + person.lastName;
      document.getElementById('profileJobTitle').textContent = person.jobTitle || '';
      document.getElementById('profileDepartment').textContent = 'Department: ' + (person.department || '');
      document.getElementById('profileLocation').textContent = 'Location: ' + (person.location || '');
      document.getElementById('profileEmail').textContent = 'Email: ' + (person.email || '');
      new bootstrap.Modal(document.getElementById('profileModal')).show();
    })
    .catch(err => {
      alert('Failed to load profile.');
    });
}


// Load all departments
async function loadDepartments(selectId) {
  try {
  const response = await fetch(`${BASE_URL}/getAllDepartments.php?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Departments Data:", data);

    if (data.status.code !== "200") {
      throw new Error("Server returned error: " + data.status.description);
    }

    renderDepartmentsDropdown(data.data, selectId);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

// Render departments into dropdown
function renderDepartmentsDropdown(departments, selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";

  departments.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept.id;
    option.textContent = dept.name;
    select.appendChild(option);
  });
}

// Add a new person
function addPerson() {
  const form = document.getElementById('addPersonnelForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);
  fetch(`${BASE_URL}/insertPersonnel.php`, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(() => {
      form.reset();
      loadPersonnel();
      bootstrap.Modal.getInstance(document.getElementById('addPersonnelModal')).hide();
    })
    .catch(err => {
      console.error('Error adding person:', err);
      alert('Failed to add person.');
    });
}

// Open edit modal
function openEditModal(id) {
  fetch(`${BASE_URL}/getPersonnelByID.php?id=${id}`)
    .then(r => r.json())
    .then(result => {
      const person = result.data && result.data.personnel && result.data.personnel[0];
      if (!person) throw new Error('No person found');
      document.getElementById('editId').value = person.id;
      document.getElementById('editFirstName').value = person.firstName;
      document.getElementById('editLastName').value = person.lastName;
      document.getElementById('editEmail').value = person.email;
      document.getElementById('editJobTitle').value = person.jobTitle;
      document.getElementById('editDepartmentSelect').value = person.departmentID;
      new bootstrap.Modal(document.getElementById('editModal')).show();
    })
    .catch(err => {
      console.error('Error loading person:', err);
      alert('Failed to load person details.');
    });
}

// Update person
function updatePerson() {
  const form = document.getElementById('editForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);
  fetch(`${BASE_URL}/updatePersonnel.php`, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(() => {
      form.reset();
      loadPersonnel();
      bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    })
    .catch(err => {
      console.error('Error updating person:', err);
      alert('Failed to update person.');
    });
}

// Delete person
function deletePerson(id) {
  if (!confirm('Are you sure you want to delete this person?')) return;

  fetch(`${BASE_URL}/deletePersonnel.php?id=${id}`, { method: 'GET' })
    .then(r => r.json())
    .then(() => loadPersonnel())
    .catch(err => {
      console.error('Error deleting person:', err);
      alert('Failed to delete person.');
    });
}
