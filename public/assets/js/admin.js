const roles = {
  SALES_MANAGER: 'Менеджер по продажам',
  CONTENT_MANAGER: 'Контент-менеджер',
  USER: 'Клиент',
}


document.addEventListener('DOMContentLoaded', async () => {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.admin-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  getUsersRequest();
  getApplicationsRequest();
});

async function getUsersRequest() {

  await fetch('/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => {
    result.json().then(users => {
      const usersList = document.getElementById('users');
      usersList.innerHTML = ''
      users.forEach(user => {
  
        const listItem = document.createElement('li');
        listItem.className = 'admin-user-item';
        listItem.dataset.role = user.role;
  
        const userSummary = document.createElement('div');
        userSummary.className = 'admin-user-summary';
        userSummary.onclick = function () { toggleUserDetails(this); };
  
        const userName = document.createElement('span');
        userName.textContent = `${user.firstName} ${user.lastName} (${user.username})`;
  
        const chevronIcon = document.createElement('ion-icon');
        chevronIcon.setAttribute('name', 'chevron-down-outline');
  
        userSummary.appendChild(userName);
        userSummary.appendChild(chevronIcon);
  
        const userDetails = document.createElement('div');
        userDetails.className = 'admin-user-details';
  
        const emailPara = document.createElement('p');
        emailPara.textContent = `Почта: ${user.email}`;
  
        const rolePara = document.createElement('p');
        rolePara.textContent = `Роль: ${roles[user.role]}`;
  
        const phonePara = document.createElement('p');
        phonePara.textContent = `Телефон: ${user.phone}`;
  
        const br = document.createElement('br');
  
        
  
        const buttonActions = document.createElement('div');
        buttonActions.className = 'button-actions';
  
        const editButton = document.createElement('button');
        editButton.className = 'admin-btn admin-btn-primary';
        editButton.id = 'editUserBtn';
        editButton.textContent = 'Изменить';
        editButton.onclick =  async () =>  {
          editUser(user);
        }
        const deleteButton = document.createElement('button');
        deleteButton.className = 'admin-btn admin-btn-primary btn-red';
        deleteButton.id = 'deleteUserBtn';
        deleteButton.textContent = 'Удалить';
        deleteButton.onclick =  async () => {
          await fetch(`/api/users/${user._id.toString()}`, {method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
          }).then(res => {
            if (res.status === 200) {
                  listItem.remove();
                  window.location.reload()
              }
          })
        };
  
        buttonActions.appendChild(editButton)
        buttonActions.appendChild(deleteButton);
  
        userDetails.appendChild(emailPara);
        userDetails.appendChild(rolePara);
        userDetails.appendChild(phonePara);
        userDetails.appendChild(br);
        userDetails.appendChild(buttonActions);
  
        listItem.appendChild(userSummary);
        listItem.appendChild(userDetails);
  
        usersList.appendChild(listItem);
  
  
      })
    })
  });
} 

async function getApplicationsRequest()  {
  await fetch('/api/users/applications', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(res => {
    res.json().then(apps => {
      apps.forEach(app => {
        const list = document.getElementById('requests');
  
        const listItem = document.createElement('li');
        listItem.className = 'admin-user-item';
        listItem.dataset.role = 'user';
  
        const userSummary = document.createElement('div');
        userSummary.className = 'admin-user-summary';
        userSummary.onclick = function () { toggleUserDetails(this); };
  
        const userName = document.createElement('span');
        userName.textContent = `${app.data.firstName} ${app.data.lastName} (${app.data.username})`;
  
        const chevronIcon = document.createElement('ion-icon');
        chevronIcon.name = 'chevron-down-outline';
  
        userSummary.appendChild(userName);
        userSummary.appendChild(chevronIcon);
  
        const userDetails = document.createElement('div');
        userDetails.className = 'admin-user-details';
  
        const emailPara = document.createElement('p');
        emailPara.textContent = `Почта: ${app.data.email}`;
  
        const rolePara = document.createElement('p');
        rolePara.textContent = `Роль: ${roles[app.data.role]}`;
  
        const phonePara = document.createElement('p');
        phonePara.textContent = `Телефон: ${app.data.phone}`;
  
        const br = document.createElement('br');
  
        const buttonActions = document.createElement('div');
        buttonActions.className = 'button-actions';
  
        const acceptButton = document.createElement('button');
        acceptButton.className = 'admin-btn admin-btn-primary';
        acceptButton.textContent = 'Принять';
        acceptButton.onclick = async () => {
          await fetch(`/api/users/employees/${app._id.toString()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
          }).then(res => {
            if (res.status === 201) {
              listItem.remove();
            }
          })
        };
  
        const rejectButton = document.createElement('button');
        rejectButton.className = 'admin-btn admin-btn-primary btn-red';
        rejectButton.textContent = 'Отклонить';
        rejectButton.onclick = async () => {
          await fetch(`/api/users/applications/${app._id.toString()}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
          }).then(res => {
            if (res.status === 200) {
              listItem.remove();
            }
          });
        };
  
        buttonActions.appendChild(acceptButton);
        buttonActions.appendChild(rejectButton);
  
        userDetails.appendChild(emailPara);
        userDetails.appendChild(rolePara);
        userDetails.appendChild(phonePara);
        userDetails.appendChild(br);
        userDetails.appendChild(buttonActions);
  
        listItem.appendChild(userSummary);
        listItem.appendChild(userDetails);
  
        list.appendChild(listItem);
  
      })
    })
  });
}




function toggleUserDetails(element) {
  const userItem = element.closest('.admin-user-item');
  userItem.classList.toggle('active');
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function filterUsers(role) {
  const userItems = document.querySelectorAll('.admin-user-item');

  userItems.forEach(item => {
    if (role === 'all' || item.getAttribute('data-role') === role) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function searchUsers() {
  const input = document.getElementById('admin-search-input');
  const filter = input.value.toLowerCase();
  const userItems = document.querySelectorAll('.admin-user-item');

  userItems.forEach(item => {
    const elems = item.querySelectorAll('.admin-user-details p, .admin-user-summary span');
    for (let elem  of elems) {
      if (elem.innerText.toLowerCase().includes(filter))  {
        item.style.display = 'block';
        break;
      } else {
        item.style.display = 'none';
      }
    }
  });
}

function logout() {
  localStorage.removeItem('jwt');
  window.location.href = '/';
}


function editUser(user) {
  const form = document.querySelector('#editForm');
  form.innerHTML = `
  <div class="form-group">
      <label for="editUsername">Логин</label>
      <input type="text" id="editUsername" class="admin-input" value="${user.username}" required>
  </div>
  <div class="form-group">
      <label for="editFirstName">Имя</label>
      <input type="text" id="editFirstName" class="admin-input" value="${user.firstName}" required>
  </div>
  <div class="form-group">
      <label for="editLastName">Фамилия</label>
      <input type="text" id="editLastName" class="admin-input"  value="${user.lastName}"required>
  </div>
  <div class="form-group">
      <label for="editEmail">Почта</label>
      <input type="text" id="editEmail" class="admin-input"  value="${user.email}"required>
  </div>
  <div class="form-group">
      <label for="editPhone">Телефон</label>
      <input type="tel" id="editPhone" class="admin-input"  value="${user.phone}"required>
  </div>
  <button type="button" class="admin-btn admin-btn-primary"
      onclick="saveUserChanges('${user._id}')">Сохранить</button>
  `
  document.getElementById('editModal').style.display ='block';
}


async function saveUserChanges(userId)  {
  const form = document.querySelector('#editForm');

  await fetch(`/api/users/${userId}`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      username : form.querySelector('#editUsername').value,
      lastName: form.querySelector('#editLastName').value,
      firstName : form.querySelector('#editFirstName').value,
      email : form.querySelector('#editEmail').value,
      phone : form.querySelector('#editPhone').value
    })
  }).then(res  => res.json().then(data => {
    if (!res.ok) {
      alert(data.message);
    }
    else {
      closeModal();
      getUsersRequest();
    }
  }))
}