window.addEventListener('DOMContentLoaded', () => {
  fetchAdmins();
  fetchSuppliers();
  fetchPharmacies();

  // Edit formni faqat bir marta ulaymiz
  document.getElementById("editPharmacyForm").addEventListener("submit", updatePharmacy);

  // Edit tugmasi bosilganda modal ochish (delegatsiya bilan)
  document.getElementById("pharmacyList").addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      e.preventDefault();
      const data = decodeURIComponent(editBtn.dataset.pharmacy);
      const pharmacy = JSON.parse(data);
      openEditModal(pharmacy);
    }
  });
});

// Adminlar ro‘yxatini olish
function fetchAdmins() {
  const token = localStorage.getItem('token');
  fetch('http://localhost:7777/admins', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    const admins = data.admins || [];
    ['adminSelect', 'editAdminSelect'].forEach(id => {
      const select = document.getElementById(id);
      select.innerHTML = '<option value="">Admin tanlang</option>';
      admins.forEach(admin => {
        const option = document.createElement("option");
        option.value = admin.id;
        option.textContent = admin.name;
        select.appendChild(option);
      });
    });
  })
  .catch(err => console.error("Adminlar olishda xatolik:", err));
}

// Yetkazib beruvchilar ro‘yxatini olish
function fetchSuppliers() {
  const token = localStorage.getItem('token');
  fetch('http://localhost:7777/suppliers', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    const suppliers = data.suppliers || [];
    ['supplierSelect', 'editSupplierSelect'].forEach(id => {
      const select = document.getElementById(id);
      select.innerHTML = '<option value="">Supplier tanlang</option>';
      suppliers.forEach(supplier => {
        const option = document.createElement("option");
        option.value = supplier.id;
        option.textContent = supplier.name;
        select.appendChild(option);
      });
    });
  })
  .catch(err => console.error("Supplierlar olishda xatolik:", err));
}

// Dorixonalar ro‘yxatini olish
function fetchPharmacies() {
  const token = localStorage.getItem('token');
  fetch('http://localhost:7777/pharmacies', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } 
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("pharmacyList");
      list.innerHTML = '';
      const pharmacies = data.pharmacies || [];

      pharmacies.forEach((ph, index) => {
        const encodedData = encodeURIComponent(JSON.stringify(ph));
        list.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${ph.name}</td>
            <td>${ph.address}</td>
            <td>${ph.phone}</td>
            <td>
              <a href="pharmacy_drugs.html?pharmacyId=${ph.id}"><i class="fa fa-eye"></i></a>
              <a href="#" class="edit-btn" data-pharmacy="${encodedData}"><i class="fa fa-pen-to-square"></i></a>
              <a href="#" onclick='deletePharmacy(${ph.id})'><i class="fa fa-trash-can"></i></a>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => console.error('Dorixonalar olishda xatolik:', err));
}

// Dorixona qo‘shish
document.getElementById("createPharmacyForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("pharmacyName").value;
  const address = document.getElementById("pharmacyAddress").value;
  const phone = document.getElementById("pharmacyPhone").value;
  const locationUrl = document.getElementById("locationUrl").value;
  const destination = document.getElementById("destination").value;
  const adminId = Number(document.getElementById("adminSelect").value);
  const supplierId = Number(document.getElementById("supplierSelect").value);
  const token = localStorage.getItem('token');

  fetch('http://localhost:7777/pharmacy/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      address,
      phone,
      locationUrl,
      destination,
      adminId,
      supplierId
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Dorixona muvaffaqiyatli qo‘shildi!");
      $('#createPharmacyModal').modal('hide');
      fetchPharmacies();
    } else {
      alert("Xatolik: " + (data.error || "Ma'lumot noto‘g‘ri!"));
    }
  })
  .catch(err => console.error('Dorixona qo‘shishda xatolik:', err));
});

// Dorixonani yangilash
function updatePharmacy(e) {
  e.preventDefault();

  const id = document.getElementById('editPharmacyId').value;
  const name = document.getElementById('editPharmacyName').value;
  const address = document.getElementById('editPharmacyAddress').value;
  const phone = document.getElementById('editPharmacyPhone').value;
  const locationUrl = document.getElementById('editPharmacyLocationUrl').value;
  const destination = document.getElementById('editPharmacyDestination').value;
  const adminId = Number(document.getElementById('editAdminSelect').value);
  const supplierId = Number(document.getElementById('editSupplierSelect').value);

  const token = localStorage.getItem('token');

  fetch(`http://localhost:7777/pharmacy/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, address, phone, locationUrl, destination, adminId, supplierId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Dorixona muvaffaqiyatli yangilandi!");
      $('#editPharmacyModal').modal('hide');
      fetchPharmacies();
    } else {
      alert("Xatolik: " + (data.error || "Yangilashda xatolik yuz berdi!"));
    }
  })
  .catch(err => console.error("Dorixona yangilashda xatolik:", err));
}

// Dorixonani o‘chirish
function deletePharmacy(id) {
  if (confirm("Rostan ham o'chirmoqchimisiz?")) {
    fetch(`http://localhost:7777/pharmacies/${id}/delete`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => fetchPharmacies())
    .catch(err => console.error("Dorixona o‘chirishda xatolik:", err));
  }
}

// Tahrirlash modalini ochish
function openEditModal(pharmacy) {
  document.getElementById('editPharmacyId').value = pharmacy.id;
  document.getElementById('editPharmacyName').value = pharmacy.name;
  document.getElementById('editPharmacyAddress').value = pharmacy.address;
  document.getElementById('editPharmacyPhone').value = pharmacy.phone;
  document.getElementById('editPharmacyLocationUrl').value = pharmacy.locationUrl || '';
  document.getElementById('editPharmacyDestination').value = pharmacy.destination || '';
  document.getElementById('editAdminSelect').value = pharmacy.adminId;
  document.getElementById('editSupplierSelect').value = pharmacy.supplierId;

  $('#editPharmacyModal').modal('show');
}
