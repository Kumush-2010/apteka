document.addEventListener("DOMContentLoaded", () => {
  loadPharmacies();
  loadMedicines();
  bindCreateForm();
  bindEditForm();
});

// 1. Load Pharmacies
function loadPharmacies() {
  const token = localStorage.getItem('token');
  fetch('http://localhost:7777/pharmacies', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    const pharmacies = data.pharmacies || [];
    ['pharmacySelect', 'editPharmacySelect'].forEach(id => {
      const select = document.getElementById(id);
      select.innerHTML = '<option value="">Dorixona tanlang</option>';
      pharmacies.forEach(pharmacy => {
        const option = document.createElement("option");
        option.value = pharmacy.id;
        option.textContent = pharmacy.name;
        select.appendChild(option);
      });
    });
  })
  .catch(err => {
    console.error("Adminlar olishda xatolik:", err)
    Swal.fire("Xatolik!", "Dorixonalar ro'yxatini olishda xatolik yuz berdi.", "error");
});
}


// 2. Load Medicines
function loadMedicines() {
  const tableBody = document.querySelector("table tbody");
  const params = new URLSearchParams(window.location.search);
  const pharmacyId = params.get("pharmacyId");

  if(!pharmacyId) {
    alert("Dorixona topilmadi")
    return
  }

  const token = localStorage.getItem("token");

  fetch(`http://localhost:7777/pharmacies/${pharmacyId}/drugs`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("Dorilar:", data);
      if (!Array.isArray(data.medicines)) throw new Error("Noto‘g‘ri format");

      tableBody.innerHTML = "";

      const medicines = data.medicines;

      if(!Array.isArray(medicines)){
        Swal.fire({
          icon: "error",
          title: "Xatolik!",
          text: "Dorilarni yuklashda xatolik yuz berdi.",
        });
        return;
      }
      medicines.forEach((med, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td><img src="${med.image}" width="50" /></td>
          <td>${med.uz_name}</td>
          <td>${med.one_plate_price}</td>
          <td>${med.warehouse}</td>
          <td>${med.made}</td>
          <td>
            <a href="#" 
            onclick="openViewModal(this)"
            data-id="${med.id}" 
              data-image="${med.image}"
              data-nameuz="${med.uz_name}" 
              data-nameru="${med.ru_name}" 
              data-nameen="${med.ru_name}"
              data-pricedisk="${med.one_plate_price}" 
              data-pricebox="${med.one_box}" 
              data-sizedisk="${med.one_plate_price}" 
              data-sizebox="${med.one_box_price}" 
              data-manufacturer="${med.made}"
              data-warehouse="${med.warehouse}"
              data-gram="${med.gram}"
              >
            <i class="fa fa-eye"></i></a>
            <a href="#" onclick="openEditModal(this)" 
              data-id="${med.id}" 
              data-nameuz="${med.uz_name}" 
              data-nameru="${med.ru_name}" 
              data-nameen="${med.ru_name}"
              data-pricedisk="${med.one_plate_price}" 
              data-pricebox="${med.one_box}" 
              data-sizedisk="${med.one_plate_price}" 
              data-sizebox="${med.one_box_price}" 
              data-manufacturer="${med.made}"
              data-gram="${med.gram}"
              data-image="${med.image}">
              <i class="fa-solid fa-pen-to-square"></i>
            </a>
            <a href="#" onclick="deleteMedicine(${med.id})">
              <i class="fa-solid fa-trash-can"></i>
            </a>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Dori yuklashda xatolik:", err);
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: "Dorilarni yuklashda xatolik yuz berdi.",
      })
    });
}

// 3. Create Medicine
function bindCreateForm() {
  const form = document.getElementById("createMedicineForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token topilmadi. Iltimos, tizimga qayta kiring.");
      return;
    }

    const imageInput = document.getElementById("imageFile");
    if (!imageInput || !imageInput.files.length) {
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: "Iltimos, dori rasmni tanlang.",
      });
      return;
    }

    const pharmacyId = parseInt(document.getElementById("pharmacySelect").value);
    if (isNaN(pharmacyId)) {
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: "Iltimos, dorixonani to'g'ri tanlang.",
      });
      return;
    }

    // Data object to be sent in the request
    const formData = new FormData();
    formData.append("uz_name", document.getElementById("nameUz").value.trim());
    formData.append("ru_name", document.getElementById("nameRu").value.trim());
    formData.append("en_name", document.getElementById("nameEn").value.trim());
    formData.append("warehouse", document.getElementById("quantity").value);
    formData.append("one_plate_price", document.getElementById("priceDisk").value);
    formData.append("one_box_price", document.getElementById("priceBox").value);
    formData.append("one_plate", document.getElementById("sizeDisk").value);
    formData.append("one_box", document.getElementById("sizeBox").value);
    formData.append("made", document.getElementById("manufacturer").value.trim());
    formData.append("gram", document.getElementById("gram").value.trim());
    formData.append("pharmacyId", pharmacyId); 
    formData.append("image", imageInput.files[0]);

    // Check the data in the form before sending it
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    fetch("http://localhost:7777/medicine/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || "Serverdan nomalum xatolik.");
        });
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Muvaffaqiyatli!',
          text: 'Dori muvaffaqiyatli qo‘shildi!',
        }).then(() => {
          $('#createMedicineModa').modal('hide');
          fetchPharmacies();
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Xatolik!',
          text: data.error || 'Dori qo‘shishda xatolik yuz berdi!',
        });
      }
      form.reset();
      location.reload();
    })
    .catch(err => {
      console.error("Xatolik:", err);
      alert("Xatolik: " + err.message);
    });
  });
}



// 4. Edit Modal
function openEditModal(el) {
  document.getElementById("medId").value = el.dataset.id;
  document.getElementById("nameUz").value = el.dataset.nameuz;
  document.getElementById("nameRu").value = el.dataset.nameru;
  document.getElementById("nameEn").value = el.dataset.nameen;
  document.getElementById("warehouse").value = el.dataset.warehouse;
  document.getElementById("priceDisk").value = el.dataset.pricedisk;
  document.getElementById("priceBox").value = el.dataset.pricebox;
  document.getElementById("sizeDisk").value = el.dataset.sizedisk;
  document.getElementById("sizeBox").value = el.dataset.sizebox;
  document.getElementById("manufacturer").value = el.dataset.manufacturer;
  document.getElementById("editPharmacySelect").value = el.dataset.pharmacyid;
  document.getElementById("gram").value = el.dataset.gram || "";

  const imagePreview = document.getElementById("imagePreview");
  if (el.dataset.image) {
    imagePreview.src = el.dataset.image;
    imagePreview.style.display = "block";
  } else {
    imagePreview.src = ""
    imagePreview.style.display = "none";
  }

  document.getElementById("editMedicineModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editMedicineModal").style.display = "none";
}

window.onclick = function (e) {
  const modal = document.getElementById("editMedicineModal");
  if (e.target === modal) closeEditModal();
};

// 5. Update Medicine
function bindEditForm() {
  const form = document.getElementById("editMedicineForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("medId").value;
    const token = localStorage.getItem("token");
    const gramValue = document.getElementById("gram").value.trim();
    const updated = {
      uz_name: document.getElementById("nameUz").value,
      ru_name: document.getElementById("nameRu").value,
      en_name: document.getElementById("nameEn").value,
      one_plate: document.getElementById("sizeDisk").value,
      one_box: document.getElementById("sizeBox").value,
      one_plate_price: +document.getElementById("priceDisk").value,
      one_box_price: +document.getElementById("priceBox").value,
      made: document.getElementById("manufacturer").value,
      warehouse: document.getElementById("warehouse").value,
      pharmacyId: +document.getElementById("editPharmacySelect").value,
      gram: gramValue === "" ? null : +gramValue,
    };

    fetch(`http://localhost:7777/medicine/${id}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || "Yangilashda xatolik.");
        });
      }
      return res.json();
    })
    .then((data) => {
      closeEditModal();
      if (data.success) {
        Swal.fire({
          icon: "success",  
          title: "Yangilandi!",
          text: "Dori muvaffaqiyatli yangilandi!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Xatolik!",
          text: "Dori yangilashda xatolik yuz berdi!",
        });
      }
    })
    .catch(err => {
      console.error("Xatolik:", err);
      alert("Yangilashda muammo yuz berdi.");
    });
  });
}


// 6. Delete Medicine
function deleteMedicine(id) {
  Swal.fire({
    title: "Ishonchingiz komilmi?",
    text: "Ushbu dori o‘chirib yuboriladi!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ha, o‘chir!",
  }).then(result => {
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:7777/medicine/${id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("O‘chirishda xatolik.");
          return res.json();
        })
        .then(() => {
          Swal.fire("O‘chirildi!", "Dori muvaffaqiyatli o‘chirildi.", "success").then(() =>
            location.reload()
          );
        })
        .catch(err => {
          console.error("Xatolik:", err);
          Swal.fire("Xatolik", "O‘chirishda muammo yuz berdi.", "error");
        });
    }
  });
}

// 7. View Modal
function openViewModal(el) {
  console.log("DATASET:", el.dataset);

  document.getElementById("viewImage").src = el.dataset.image || "no-image.png";
  document.getElementById("viewNameUz").textContent = el.dataset.nameuz || "-";
  document.getElementById("viewNameRu").textContent = el.dataset.nameru || "-";
  document.getElementById("viewNameEn").textContent = el.dataset.nameen || "-";
  document.getElementById("viewPriceDisk").textContent = el.dataset.pricedisk || "-";
  document.getElementById("viewPriceBox").textContent = el.dataset.pricebox || "-";
  document.getElementById("viewSizeDisk").textContent = el.dataset.sizedisk || "-";
  document.getElementById("viewSizeBox").textContent = el.dataset.sizebox || "-";
  document.getElementById("viewManufacturer").textContent = el.dataset.manufacturer || "-";
  document.getElementById("viewWarehouse").textContent = el.dataset.warehouse || "-";
  document.getElementById("viewGram").textContent = el.dataset.gram || "-";

  
  document.getElementById("viewMedicineModal").style.display = "block";
}

function closeViewModal() {
  document.getElementById("viewMedicineModal").style.display = "none";
}

window.onclick = function (e) {
  const modalView = document.getElementById("viewMedicineModal");
  if (e.target === modalView) closeViewModal();

  const modalEdit = document.getElementById("editMedicineModal");
  if (e.target === modalEdit) closeEditModal();
}

// 
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pharmacyId = urlParams.get("pharmacyId");

  if (!pharmacyId) {
    Swal.fire({
      icon: "error",  
      title: "Xatolik!",
      text: "Dorixona ID topilmadi. Iltimos, dorixonani tanlang.",
    })
    return;
  }

  const token = localStorage.getItem("token");

  // 1. Dorixona ma'lumotlarini olish
  fetch(`http://localhost:7777/pharmacy/${pharmacyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Dorixona ma'lumotlarini olishda xatolik.");
      }
      return res.json();
    })
    .then(data => {
      const pharmacy = data.pharmacy;

      // Dorixona ma'lumotlarini chiqarish
      document.getElementById("pharmacyName").textContent = pharmacy.name;
      document.getElementById("pharmacyAddress").textContent = pharmacy.address;
      document.getElementById("pharmacyPhone").textContent = pharmacy.phone;

      const locationLink = document.getElementById("pharmacyLocationUrl");
      if (locationLink) {
        locationLink.href = pharmacy.locationUrl || "#";
        locationLink.textContent = pharmacy.locationUrl ? "Manzilga o'tish" : "Manzil yo'q";
      }

      const destinationEl = document.getElementById("destination");
      if (destinationEl) {
        destinationEl.textContent = pharmacy.destination || "—";
      }

// Adminni olish
fetch(`http://localhost:7777/admin/${pharmacy.adminId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(res => {
  const admin = res.admin;
  const select = document.getElementById("adminSelect");
  select.innerHTML = "";
  const option = document.createElement("option");
  option.value = admin.id;
  option.textContent = admin.name;
  option.selected = true;
  select.appendChild(option);
});

// Supplierni olish
fetch(`http://localhost:7777/supplier/${pharmacy.supplierId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(res => {
  const supplier = res.supplier;
  const select = document.getElementById("supplierSelect");
  select.innerHTML = "";
  const option = document.createElement("option");
  option.value = supplier.id;
  option.textContent = supplier.name;
  option.selected = true;
  select.appendChild(option);
});


    })
    .catch(err => {
      console.error("Dorixona ma'lumotlarini olishda xatolik:", err);
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: "Dorixona ma'lumotlarini olishda xatolik yuz berdi.",
      });
    });
});


