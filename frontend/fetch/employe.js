// employes
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector("table tbody");
    const token = localStorage.getItem('token');

    fetch('http://localhost:7777/suppliers', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        } 
    })
    .then(res => res.json())
    .then(data => {
        tableBody.innerHTML = '';
     // tableBody ichiga rows qo‘shilganda, Edit tugmasini ulang:
data.suppliers.forEach((employe, index) => {
  const tr = document.createElement('tr');
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
    </td>
  `;
  tableBody.appendChild(tr);

  // Edit tugmasi bosilganda openModal chaqiriladi
  tr.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.preventDefault();
    openModal(employe);
  });

  // Delete tugmasi uchun kerak bo‘lsa: 
  tr.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteEmploye(employe.id);
  });
});

})
    .catch(error => {
        console.error('Xatolik:', error);
        alert('Xodimlar ro\'yxatini olishda xatolik yuz berdi.');
    });
})     

function getCookie(name) {
    const value = document.cookie.match( new RegExp('(^| )' + name + '=([^;]+)'));
    return value ? value[2] : null;
}


// Create employe
document.getElementById("createEmployeForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("employeName").value
    const phone = document.getElementById("employePhone").value;
    const password = document.getElementById("employePassword").value;
    const role = document.getElementById("employeRole").value;
    const token = getCookie("token");

    fetch('http://localhost:7777/supplier/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, role, password})
    })
    .then(res => {
        if (!res.ok) throw new Error('Xatolik: Xodim yaratish muvaffaqiyatsiz bo\'ldi');
        return res.json();
    })
    .then(data => {
        alert('Xodim muvaffaqiyatli yaratildi!');
        $('#creteEmployeModal').modal('hide');
        location.reload();
    })
    .catch(error => {
        console.error('Xatolik:', error);
        alert('Xodim yaratishda xatolik yuz berdi. Iltimos, ma\'lumotlarni tekshiring.');
    });
})

function getCookie(name) {
    const value = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return value ? value[2] : null;
}

// Edit employe modal ochish
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

// Modal tashqarisiga bosganda yopish
window.onclick = function (event) {
  const modal = document.getElementById("editEmployeModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Edit formni submit qilish
document.getElementById("editEmployeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("editEmployeId").value;
  const name = document.getElementById("editEmployeName").value;
  const phone = document.getElementById("editEmployePhone").value;
  const role = document.getElementById("editEmployeRole").value;

  fetch(`http://localhost:7777/supplier/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, phone, role })
  })
    .then(res => res.json())
    .then(data => {
      alert('Xodim muvaffaqiyatli yangilandi!');
      closeModal();
      location.reload();
    })
    .catch(err => {
      console.error('Xatolik:', err);
    });
});


// Delete employe
function deleteEmploye(id) {
    Swal.fire({
        title: 'Ishonchingiz komilmi?',
        text: "Bu xodim o‘chiriladi!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ha, o‘chir!',
        cancelButtonText: 'Bekor qilish'
    }).then((result) => {
        if (result.isConfirmed) {
            const token = getCookie("token");

            fetch(`http://localhost:7777/supplier/${id}/delete`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                if (res.ok) {
                    Swal.fire(
                        'O‘chirildi!',
                        'Xodim muvaffaqiyatli o‘chirildi.',
                        'success'
                    ).then(() => {
                        location.reload(); // Ro‘yxatni yangilash
                    });
                } else {
                    Swal.fire(
                        'Xatolik!',
                        'Xodimni o‘chirishda muammo yuz berdi.',
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Xatolik:', error);
                Swal.fire(
                    'Xatolik!',
                    'Tarmoqda xatolik yuz berdi.',
                    'error'
                );
            });
        }
    });
}

// logout
function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "login.html";
}