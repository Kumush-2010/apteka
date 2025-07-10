
// DOM tayyor bo‘lganda adminlar ro‘yxatini olish
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("table tbody");
  const token = localStorage.getItem("token");

  fetch("http://localhost:7777/admins", {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Adminlar:", data);
      tableBody.innerHTML = "";
      data.admins.forEach((admin, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${admin.name}</td>
          <td>${admin.phone}</td>
          <td><span class="label gradient-1 btn-rounded">${admin.role}</span></td>
          <td>
            <span>
              <a href="#" title="Edit"
                onclick="openModal(this)" 
                data-id="${admin.id}" 
                data-name="${admin.name}"
                data-phone="${admin.phone}"
                data-role="${admin.role}">
                <i class="fa-solid fa-pen-to-square"></i>
              </a>
              <a href="#" title="Delete" onclick="deleteAdmin(${admin.id})">
                <i class="fa-solid fa-trash-can"></i>
              </a>
            </span>
          </td>`;
        tableBody.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Xatolik:", error);
      Swal.fire("Xatolik!", "Adminlar ro'yxatini olishda xatolik yuz berdi.", "error");
    });
});

// Create Admin
document.getElementById("createAdminForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("adminName").value;
  const phone = document.getElementById("adminPhone").value;
  const password = document.getElementById("adminPassword").value;
  const role = document.getElementById("adminRole").value;
  const token = localStorage.getItem("token");

  fetch("http://localhost:7777/admin/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, role, password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Admin yaratish muvaffaqiyatsiz bo'ldi");
      return res.json();
    })
    .then((data) => {
      Swal.fire("Muvaffaqiyatli!", "Admin muvaffaqiyatli yaratildi!", "success");
      $("#creteAdminModal").modal("hide");
      setTimeout(() => location.reload(), 1000);
    })
    .catch((error) => {
      console.error("Xatolik:", error);
      Swal.fire("Xatolik!", "Admin yaratishda xatolik yuz berdi.", "error");
    });
});

// Modalni ochish (Edit uchun)
function openModal(el) {
  document.getElementById("editAdminId").value = el.dataset.id;
  document.getElementById("editAdminName").value = el.dataset.name;
  document.getElementById("editAdminPhone").value = el.dataset.phone;
  document.getElementById("editAdminRole").value = el.dataset.role;
  document.getElementById("editAdminModal").style.display = "block";
}

// Modalni yopish
function closeModal() {
  document.getElementById("editAdminModal").style.display = "none";
}

// Modal tashqarisiga bosilganda yopish
window.onclick = function (event) {
  const modal = document.getElementById("editAdminModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Adminni tahrirlash
document.getElementById("editAdminForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("editAdminId").value;
  const name = document.getElementById("editAdminName").value;
  const phone = document.getElementById("editAdminPhone").value;
  const role = document.getElementById("editAdminRole").value;
  const token = localStorage.getItem("token");

fetch(`http://localhost:7777/admin/${id}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, role }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Admin yangilash muvaffaqiyatsiz bo'ldi");
      return res.json();
    })
    .then((data) => {
      updatePassword(id);
    })
    .catch((err) => {
      console.error("Xatolik:", err);
      Swal.fire("Xatolik!", "Admin yangilashda xatolik yuz berdi.", "error");
    });
});

// Parolni yangilash
function updatePassword(id) {
  const password = document.getElementById("editAdminPassword").value.trim();
  const token = localStorage.getItem("token");

  if (password === "") {
    Swal.fire("Muvaffaqiyatli!", "Admin ma'lumotlari muvaffaqiyatli yangilandi!", "success");
    closeModal();
    setTimeout(() => location.reload(), 1000);
    return;
  }

  fetch(`http://localhost:7777/admin/${id}/update-pass`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Parol yangilashda xatolik yuz berdi");
      return res.json();
    })
    .then((data) => {
      Swal.fire("Muvaffaqiyatli!", "Admin ma'lumotlari va paroli yangilandi!", "success");
      closeModal();
      setTimeout(() => location.reload(), 1000);
    })
    .catch((err) => {
      console.error("Parol yangilash xatoligi:", err);
      Swal.fire("Xatolik!", "Parol yangilashda xatolik yuz berdi.", "error");
    });
}

// Adminni o‘chirish
function deleteAdmin(id) {
  Swal.fire({
    title: "Ishonchingiz komilmi?",
    text: "Bu admin o‘chiriladi!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ha, o‘chir!",
    cancelButtonText: "Bekor qilish",
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:7777/admin/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            Swal.fire("O‘chirildi!", "Admin muvaffaqiyatli o‘chirildi.", "success")
              .then(() => location.reload());
          } else {
            Swal.fire("Xatolik!", "Adminni o‘chirishda muammo yuz berdi.", "error");
          }
        })
        .catch((error) => {
          console.error("Xatolik:", error);
          Swal.fire("Xatolik!", "Tarmoqda xatolik yuz berdi.", "error");
        });
    }
  });
}

// Logout
function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "login.html";
}