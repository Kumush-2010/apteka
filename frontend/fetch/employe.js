
// Employe ro'yxatini olish
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("table tbody");
  const token = localStorage.getItem("token");

  fetch("http://localhost:7777/suppliers", {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      tableBody.innerHTML = "";
      data.suppliers.forEach((employe, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${employe.name}</td>
          <td>${employe.phone}</td>
          <td><span class="label gradient-1 btn-rounded">${employe.role}</span></td>
          <td>
            <span>
              <a href="#" class="edit-btn" data-id="${employe.id}" title="Edit">
                <i class="fa-solid fa-pen-to-square"></i>
              </a>
              <a href="#" class="delete-btn" data-id="${employe.id}" title="Delete">
                <i class="fa-solid fa-trash-can"></i>
              </a>
            </span>
          </td>`;
        tableBody.appendChild(tr);

        // Edit tugmasi
        tr.querySelector(".edit-btn").addEventListener("click", (e) => {
          e.preventDefault();
          openModal(employe);
        });

        // Delete tugmasi
        tr.querySelector(".delete-btn").addEventListener("click", (e) => {
          e.preventDefault();
          deleteEmploye(employe.id);
        });
      });
    })
    .catch((error) => {
      console.error("Xatolik:", error);
      Swal.fire("Xatolik!", "Xodimlar ro'yxatini olishda xatolik yuz berdi.", "error");
    });
});

// Create employe
document.getElementById("createEmployeForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("employeName").value;
  const phone = document.getElementById("employePhone").value;
  const password = document.getElementById("employePassword").value;
  const role = document.getElementById("employeRole").value;
  const token = localStorage.getItem("token");
console.log("TOKEN:", localStorage.getItem("token"));

  fetch("http://localhost:7777/supplier/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ name, phone, role, password }),
})
  .then(async (res) => {
    const text = await res.text();
    console.log("STATUS:", res.status, "BODY:", text);
    if (!res.ok) throw new Error(text || "Xodim yaratish muvaffaqiyatsiz bo'ldi");
    return res.json();
  })
  .then(() => {
    Swal.fire("Muvaffaqiyatli!", "Xodim muvaffaqiyatli yaratildi!", "success");
    $("#creteEmployeModal").modal("hide");
    setTimeout(() => location.reload(), 1000);
  })
  .catch((error) => {
    console.error("Xatolik:", error);
    Swal.fire("Xatolik!", error.message, "error");
  });
});

// Edit employe modalni ochish
function openModal(employe) {
  document.getElementById("editEmployeId").value = employe.id;
  document.getElementById("editEmployeName").value = employe.name;
  document.getElementById("editEmployePhone").value = employe.phone;
  document.getElementById("editEmployeRole").value = employe.role;

  document.getElementById("editEmployeModal").style.display = "block";
}

// Modalni yopish
function closeModal() {
  document.getElementById("editEmployeModal").style.display = "none";
}

// Modal tashqarisiga bosilganda yopish
window.onclick = function (event) {
  const modal = document.getElementById("editEmployeModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Employe tahrirlash
document.getElementById("editEmployeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("editEmployeId").value;
  const name = document.getElementById("editEmployeName").value;
  const phone = document.getElementById("editEmployePhone").value;
  const role = document.getElementById("editEmployeRole").value;
  const token = localStorage.getItem("token");

fetch(`http://localhost:7777/supplier/${id}/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, role }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Xodim yangilashda xatolik");
      return res.json();
    })
    .then(() => {
      Swal.fire("Muvaffaqiyatli!", "Xodim ma'lumotlari yangilandi!", "success");
      closeModal();
      setTimeout(() => location.reload(), 1000);
    })
    .catch((err) => {
      console.error("Xatolik:", err);
      Swal.fire("Xatolik!", "Xodim yangilashda xatolik yuz berdi.", "error");
    });
});

// Employeni o'chirish
function deleteEmploye(id) {
  Swal.fire({
    title: "Ishonchingiz komilmi?",
    text: "Bu xodim o‘chiriladi!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ha, o‘chir!",
    cancelButtonText: "Bekor qilish",
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:7777/supplier/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("O'chirishda xatolik");
          Swal.fire("O‘chirildi!", "Xodim muvaffaqiyatli o‘chirildi.", "success").then(() =>
            location.reload()
          );
        })
        .catch((error) => {
          console.error("Xatolik:", error);
          Swal.fire("Xatolik!", "Xodimni o‘chirishda xatolik yuz berdi.", "error");
        });
    }
  });
}

// Logout
function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "login.html";
}