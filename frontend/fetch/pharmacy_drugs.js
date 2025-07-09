document.addEventListener("DOMContentLoaded", () => {
  loadPharmacies();
  loadMedicines();
  bindCreateForm();
  bindEditForm();
});

// 1. Load Pharmacies
function loadPharmacies(pharmacyId) {
  console.log("Kelayotgan pharmacyId:", pharmacyId);

  const token = localStorage.getItem("token");

  fetch("http://localhost:7777/pharmacies", {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("Dorixonalar:", data);

      const pharmacy = data.pharmacies.find(p => p.id === parseInt(pharmacyId));

      if (!pharmacy) {
        console.error("Dorixona topilmadi");
        return;
      }

      const listDiv = document.getElementById("pharmacyList");
      if (!listDiv) {
        console.error("pharmacyList elementi topilmadi");
        return;
      }

      listDiv.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
          <h3>${pharmacy.name}</h3>
          <p><strong>Manzil:</strong> ${pharmacy.address}</p>
          <p><strong>Mo'ljal:</strong> ${pharmacy.destination}</p>
          <p><strong>Telefon:</strong> ${pharmacy.phone}</p>
          <p><strong>Joylashuv:</strong> <a href="${pharmacy.locationUrl}" target="_blank">Ko'rish</a></p>
          <p><strong>Admin ID:</strong> ${pharmacy.adminId ?? "Noma'lum"}</p>
          <p><strong>Taminotchi ID:</strong> ${pharmacy.supplierId ?? "Noma'lum"}</p>
        </div>
      `;
    })
    .catch(err => {
      console.error("Dorixonalarni olishda xatolik:", err);
      alert("Dorixonalarni yuklashda xatolik yuz berdi.");
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
        alert("Dorilarni yuklashda xatolik");
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
      alert("Dorilarni yuklashda xatolik yuz berdi.");
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
      alert("Iltimos, rasm faylini tanlang.");
      return;
    }

    const pharmacyId = parseInt(document.getElementById("pharmacySelect").value);
    if (isNaN(pharmacyId)) {
      alert("Iltimos, dorixonani to'g'ri tanlang.");
      return;
    }

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
    formData.append("pharmacyId", pharmacyId); 

    formData.append("image", imageInput.files[0]);

    for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]);
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
      .then(() => {
        alert("Dori muvaffaqiyatli qo‘shildi!");
        $("#createMedicineModal").modal("hide");
        form.reset(); // formani tozalash
        location.reload(); // sahifani yangilash
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
  document.getElementById("quantity").value = el.dataset.quantity;
  document.getElementById("priceDisk").value = el.dataset.pricedisk;
  document.getElementById("priceBox").value = el.dataset.pricebox;
  document.getElementById("sizeDisk").value = el.dataset.sizedisk;
  document.getElementById("sizeBox").value = el.dataset.sizebox;
  document.getElementById("manufacturer").value = el.dataset.manufacturer;
  
  const imagePreview = document.getElementById("imagePreview");
  if (el.dataset.image) {
    imagePreview.src = el.dataset.image;
    imagePreview.style.display = "block";
  } else {
    imagePreview.src = ""
    imagePreview.style.display = "none";
  }

  document.getElementById("editModal").style.display = "block";
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

    const updated = {
      name: {
        uz: document.getElementById("nameUz").value,
        ru: document.getElementById("nameRu").value,
        en: document.getElementById("nameEn").value,
      },
      quantity: +document.getElementById("quantity").value,
      price: {
        disk: +document.getElementById("priceDisk").value,
        box: +document.getElementById("priceBox").value,
      },
      size: {
        disk: document.getElementById("sizeDisk").value,
        box: document.getElementById("sizeBox").value,
      },
      manufacturer: document.getElementById("manufacturer").value,
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
        if (!res.ok) throw new Error("Yangilashda xatolik.");
        return res.json();
      })
      .then(() => {
        alert("Dori muvaffaqiyatli yangilandi!");
        closeEditModal();
        location.reload();
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