const tourId = new URLSearchParams(window.location.search).get('id');
var me;
var touristCount = 0;

const passengerFormsContainer = document.getElementById('passenger-forms');


document.addEventListener('DOMContentLoaded', async => {
  getTourData();
  getMe();

})
// Функция для получения данных о туре
async function getTourData() {
  try {
    const response = await fetch(`/api/tours/${tourId}`);
    if (!response.ok) {
      throw new Error('Tour not found');
    }
    const tour = await response.json();
    displayTourData(tour);
  } catch (error) {
    console.error(error);
  }
}

async function getMe() {
  if (localStorage.getItem('userJwt') !== null) {
    await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
      }
    }).then(res => res.json().then(user => {
      if (res.ok) {
        me = user;
        const cabinet = document.querySelector('#profileModal');
        cabinet.querySelector('#lastName').value = user.lastName;
        cabinet.querySelector('#firstName').value = user.firstName;
        cabinet.querySelector('#email').value = user.email;
        cabinet.querySelector('#phone').value = user.phone;
        document.querySelector('#wallet-tab').querySelector('h3').textContent = `Баланс: ${user.wallet.balance} ₽`;
      }
    }));

    await fetch('/api/requests/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
      }
    }).then(res => res.json().then(requests => {
      const ordersTab = document.querySelector('#orders-tab');
      ordersTab.innerHTML = ''; // Очищаем содержимое вкладки перед добавлением заявок

      requests.forEach(request => {
        console.log(request);
        const requestCard = document.createElement('div');
        requestCard.classList.add('request-card');

        const requestSummary = document.createElement('div');
        requestSummary.classList.add('request-summary');

        const requestId = document.createElement('p');
        requestId.textContent = `ID заявки: ${request._id}`;
        requestSummary.appendChild(requestId);

        const requestTour = document.createElement('p');
        requestTour.textContent = `Тур: ${request.tour.name}`;
        requestSummary.appendChild(requestTour);

        if (request.status === 'Оплата') {
          const payButton = document.createElement('button');
          payButton.textContent = 'Оплатить';
          payButton.classList.add('toggle-details-btn');
          payButton.id = 'pay_request';
          payButton.setAttribute('data-request-id', request._id);
          payButton.onclick = () => pay(request._id);
          requestSummary.appendChild(payButton);
        }

        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Подробнее';
        detailsButton.classList.add('toggle-details-btn');
        requestSummary.appendChild(detailsButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.classList.add('delete-request-btn');
        deleteButton.setAttribute('data-request-id', request._id);
        requestSummary.appendChild(deleteButton);

        requestCard.appendChild(requestSummary);

        const requestDetails = document.createElement('div');
        requestDetails.classList.add('request-details');
        requestDetails.style.display = 'none';

        const requestDate = document.createElement('p');
        requestDate.textContent = `Дата: ${new Date(request.date).toLocaleDateString()}`;
        requestDetails.appendChild(requestDate);

        const requestStatus = document.createElement('p');
        requestStatus.textContent = `Статус: ${request.status}`;
        requestDetails.appendChild(requestStatus);

        const requestPrice = document.createElement('p');
        requestPrice.textContent = `Цена: ${request.price} ₽`;
        requestDetails.appendChild(requestPrice);

        const touristsTitle = document.createElement('p');
        touristsTitle.textContent = 'Туристы:';
        requestDetails.appendChild(touristsTitle);

        const touristsList = document.createElement('ul');
        touristsList.style.border = '1px solid #ddd';

        request.tourists.forEach(tourist => {
          const touristItem = document.createElement('li');
          touristItem.textContent = `${tourist.lastName} ${tourist.firstName} ${tourist.midlleName}`;

          const touristDetails = document.createElement('ul');
          touristDetails.style.border = '1px solid #ddd';

          const dob = document.createElement('li');
          dob.textContent = `Дата рождения: ${new Date(tourist.dateOfBirth).toLocaleDateString()}`;
          touristDetails.appendChild(dob);

          const gender = document.createElement('li');
          gender.textContent = `Пол: ${tourist.gender}`;
          touristDetails.appendChild(gender);

          const passport = document.createElement('li');
          passport.textContent = `Паспорт: ${tourist.passport.series}, выдан ${new Date(tourist.passport.dateOfIssue).toLocaleDateString()} ${tourist.passport.issuedBy}`;
          touristDetails.appendChild(passport);

          if (tourist.internationalPassport) {
            const intPassport = document.createElement('li');
            intPassport.style.border = '1px solid #ddd';
            intPassport.textContent = `Заграничный паспорт: ${tourist.internationalPassport.series}, выдан ${new Date(tourist.internationalPassport.dateOfIssue).toLocaleDateString()} ${tourist.internationalPassport.issuedBy}, истекает ${new Date(tourist.internationalPassport.dateOfExpiry).toLocaleDateString()}`;
            touristDetails.appendChild(intPassport);
          }

          touristItem.appendChild(touristDetails);
          touristsList.appendChild(touristItem);
        });

        requestDetails.appendChild(touristsList);

        const tourTitle = document.createElement('p');
        tourTitle.textContent = 'Тур:';
        requestDetails.appendChild(tourTitle);

        const tourDetails = document.createElement('ul');
        tourDetails.style.border = '1px solid #ddd';

        const tourDescription = document.createElement('li');
        tourDescription.textContent = `Описание: ${request.tour.description}`;
        tourDetails.appendChild(tourDescription);

        const tourDuration = document.createElement('li');
        tourDuration.textContent = `Продолжительность: ${request.tour.dayDuration} дней / ${request.tour.nightDuration} ночей`;
        tourDetails.appendChild(tourDuration);

        const tourPrice = document.createElement('li');
        tourPrice.textContent = `Цена: ${request.tour.price} ₽`;
        tourDetails.appendChild(tourPrice);

        const hotel = document.createElement('li');
        hotel.textContent = `Отель: ${request.tour.hotel.name}, ${request.tour.hotel.address}, ${request.tour.hotel.rating} звёзд`;
        tourDetails.appendChild(hotel);

        const nutrition = document.createElement('li');
        nutrition.textContent = `Тип питания: ${request.tour.hotel.nutrition.join(', ')}`;
        tourDetails.appendChild(nutrition);

        const tourType = document.createElement('li');
        tourType.textContent = `Тип тура: ${request.tour.type}`;
        tourDetails.appendChild(tourType);

        const visa = document.createElement('li');
        visa.textContent = `Виза: ${request.tour.visa ? 'Требуется' : 'Не требуется'}`;
        tourDetails.appendChild(visa);

        const places = document.createElement('li');
        places.textContent = `Места: ${request.tour.places}`;
        tourDetails.appendChild(places);

        requestDetails.appendChild(tourDetails);

        const flightsTitle = document.createElement('p');
        flightsTitle.textContent = 'Рейсы:';
        requestDetails.appendChild(flightsTitle);

        const flightsList = document.createElement('ul');
        flightsList.style.border = '1px solid #ddd';

        const departureFlight = document.createElement('li');
        departureFlight.textContent = `Рейс туда: из ${request.tour.departureFlight.departurePlace.name} в ${request.tour.departureFlight.arrivalPlace.name} ${new Date(request.tour.departureFlight.departureTime).toLocaleString()}`;
        flightsList.appendChild(departureFlight);

        const returnFlight = document.createElement('li');
        returnFlight.textContent = `Рейс обратно: из ${request.tour.returnFlight.departurePlace.name} в ${request.tour.returnFlight.arrivalPlace.name} ${new Date(request.tour.returnFlight.departureTime).toLocaleString()}`;
        flightsList.appendChild(returnFlight);

        requestDetails.appendChild(flightsList);

        if (request.status == 'Готово') {
          fetch(`/api/requests/${request._id}/package`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
            }
          }).then(res => res.json().then(packageItem => {
            const docs = document.createElement('div');
            docs.style.border = '1px solid #ddd';
            docs.style.display = 'flex';
            const info = document.createElement('p');
            info.textContent = `Ваш туристический пакет`;
            packageItem.documents.forEach(doc => {
              docs.innerHTML += `
                  <a href="/image/${doc}" download style="margin: 1.5rem">
                  <ion-icon name="document-outline"></ion-icon>
                  Файл
                  </a>
                  `
            })
            requestDetails.appendChild(info)
            requestDetails.appendChild(docs);
          }))

        }


        requestCard.appendChild(requestDetails);
        document.getElementById('orders-tab').appendChild(requestCard);
      });


      // Добавление событий для кнопок "Подробнее" и "Удалить"
      document.querySelectorAll('.toggle-details-btn').forEach(button => {
        button.addEventListener('click', function () {
          const details = this.parentElement.nextElementSibling;
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
      });

      document.querySelectorAll('.delete-request-btn').forEach(button => {
        button.addEventListener('click', async function () {
          const requestId = this.getAttribute('data-request-id');
          await fetch(`/api/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
            }
          }).then(res => {
            if (res.ok) {
              this.closest('.request-card').remove();
              alert('Заявка успешно удалена');
            } else {
              alert('Ошибка при удалении заявки');
            }
          });
        });
      });
    }));
    document.querySelector('.profile-btn').addEventListener('click', openProfileModal);
  } else {
    document.querySelector('.profile-btn').addEventListener('click', openLoginModal);
  }
}

// Функция для отображения данных о туре
function displayTourData(tour) {
  document.getElementById('tour-name').textContent = tour.name;
  document.getElementById('tour-image').src = `image/${tour.image}`
  document.getElementById('tour-description').textContent = tour.description;
  document.getElementById('tour-price').textContent = `Цена: ${tour.price} руб.`;
  document.getElementById('tour-type').textContent = `Тип : ${tour.type}`
  document.getElementById('tour-visa').textContent = tour.visa == true ? 'Требуется виза' : "";


  document.getElementById('hotel-name').textContent = `Отель: ${tour.hotel.name}`;
  document.getElementById('hotel-address').textContent = `Адрес: ${tour.hotel.address}`;
  document.getElementById('hotel-image').src = `image/${tour.hotel.image}`;

  const hotelServices = document.getElementById('hotel-services');
  hotelServices.innerHTML = '';
  tour.hotel.services.forEach(service => {
    const serviceElement = document.createElement('li');
    serviceElement.textContent = service.name;
    hotelServices.appendChild(serviceElement);
  });

  document.getElementById('departure-flight-time').textContent = `Время вылета: ${formatDateTime(tour.departureFlight.departureTime).replace('T', ',  ')} UTC`;
  document.getElementById('departure-place').textContent = `Место вылета: ${tour.departureFlight.departurePlace.name}`;
  document.getElementById('arrival-place').textContent = `Место прибытия: ${tour.departureFlight.arrivalPlace.name}`;

  document.getElementById('return-flight-time').textContent = `Время вылета: ${formatDateTime(tour.returnFlight.departureTime).replace('T', ',  ')} UTC`;
  document.getElementById('return-departure-place').textContent = `Место вылета: ${tour.returnFlight.departurePlace.name}`;
  document.getElementById('return-arrival-place').textContent = `Место прибытия: ${tour.returnFlight.arrivalPlace.name}`;

}

// Вызов функции для получения данных о туре при загрузке страницы


const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

const navToggleEvent = function (elem) {
  for (let i = 0; i < elem.length; i++) {
    elem[i].addEventListener("click", function () {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }
}

navToggleEvent(navElemArr);
navToggleEvent(navLinks);

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

  if (window.scrollY >= 200) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }

});


function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const formattedDate = date.toISOString().slice(0, 16);
  return formattedDate;
}


const modalOverlay = document.getElementById('modalOverlay');
const registerModalOverlay = document.getElementById('registerModalOverlay');
const modal = document.getElementById('modal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');


function openLoginModal() {
  modalOverlay.style.display = 'block';
  modal.style.display = 'block';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  modal.style.display = 'none';
}

function openRegisterModal() {
  registerModalOverlay.style.display = 'block';
  registerModal.style.display = 'block';
}

function closeRegisterModal() {
  registerModalOverlay.style.display = 'none';
  registerModal.style.display = 'none'
}

document.getElementById('registerModalButton').addEventListener('click', openRegisterModal);

modalOverlay.addEventListener('click', function (event) {
  if (event.target == modalOverlay) {
    closeModal();
  }

});


document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeModal();
    closeProfileModal();
    closeRegisterModal();
    closeBookingModal();
  }
});

document.getElementById('back-to-login').addEventListener('click', function (event) {
  closeRegisterModal();
  openLoginModal();
})



const modalProfleOverlay = document.getElementById('profileModalOverlay');
const profileModal = document.getElementById('profileModal');
const modalTabs = document.querySelectorAll('.modal-tab');
const tabContents = document.querySelectorAll('.modal-tab-content');


function openProfileModal() {
  modalProfleOverlay.style.display = 'block';
  profileModal.style.display = 'block';
}

function closeProfileModal() {
  modalProfleOverlay.style.display = 'none';
  profileModal.style.display = 'none';
}

modalTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    modalTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    tabContents.forEach(content => {
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  });
});


async function register(event) {
  event.preventDefault(); // предотвращение отправки формы по умолчанию

  const username = document.querySelector('#registerForm').querySelector('#username').value;
  const password = document.querySelector('#registerForm').querySelector('#password').value;
  const email = document.querySelector('#registerForm').querySelector('#email').value;
  const phone = document.querySelector('#registerForm').querySelector('#phone').value;
  const firstName = document.querySelector('#registerForm').querySelector('#firstName').value;
  const lastName = document.querySelector('#registerForm').querySelector('#lastName').value;
  const role = document.getElementById('role-select').value;

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      email,
      phone,
      firstName,
      lastName,
      role
    })
  });

  const data = await res.json();
  if (res.ok) {
    if (!data.user) {
      alert(data.message);
    } else {
      localStorage.setItem('jwt', data.token);
    }
    closeRegisterModal();
    closeModal();
  }
}

document.getElementById('submitFormData').addEventListener('click', async (e) => {
  e.preventDefault();
  const cabinet = document.querySelector('#profileModal');

  await fetch(`/api/users/${me._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
    },
    body: JSON.stringify({
      lastName: cabinet.querySelector('#lastName').value,
      firstName: cabinet.querySelector('#firstName').value,
      email: cabinet.querySelector('#email').value,
      phone: cabinet.querySelector('#phone').value
    })
  }).then(res => res.json().then(data => {
    if (!res.ok) {
      alert(data.message);
    }
  }))
})


// Привязка функций к формам
document.getElementById('registerForm').addEventListener('submit', register);
document.getElementById('loginForm').addEventListener('submit', login);

if (localStorage.getItem('userJwt'))  {
  document.getElementById('book-tour-btn').addEventListener('click', openBookingModal);
  document.getElementsByClassName('profile-btn')[0].addEventListener('click', openProfileModal);
} else {
  document.getElementById('book-tour-btn').addEventListener('click', openLoginModal);
  document.getElementsByClassName('profile-btn')[0].addEventListener('click', openLoginModal);
}

document.getElementById('add-passenger-btn').addEventListener('click', addPassengerForm);


function openBookingModal() {
  document.getElementById('bookingModal').style.display = 'block';
  addPassengerForm();
}

function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
  passengerFormsContainer.innerHTML = '';
  touristCount = 0;
}



function addPassengerForm() {
  touristCount++;
  const form = document.createElement('div');
  form.classList.add('passenger-form');
  form.innerHTML = `
  <h3>Пассажир ${touristCount}</h3>
  <div class="form-group">
    <label for="passenger-name-${touristCount}">Имя:</label>
    <input type="text" id="passenger-name-${touristCount}" name="passenger-name-${touristCount}" required>
    
    <label for="passenger-surname-${touristCount}">Фамилия:</label>
    <input type="text" id="passenger-surname-${touristCount}" name="passenger-surname-${touristCount}" required>

    <label for="passenger-patronymic-${touristCount}">Отчество:</label>
    <input type="text" id="passenger-patronymic-${touristCount}" name="passenger-patronymic-${touristCount}" required>

    <label for="passenger-birthdate-${touristCount}">Дата рождения:</label>
    <input type="date" id="passenger-birthdate-${touristCount}" name="passenger-birthdate-${touristCount}" required>

    <label for="passenger-gender-${touristCount}">Пол:</label>
    <select id="passenger-gender-${touristCount}" name="passenger-gender-${touristCount}" required>
      <option value="МУЖ">Мужской</option>
      <option value="ЖЕН">Женский</option>
    </select>
  </div>
  <h4>Паспортные данные</h4>
  <div class="form-group">
    <label for="passport-series-${touristCount}">Серия:</label>
    <input type="text" id="passport-series-${touristCount}" name="passport-series-${touristCount}" required>
    
    <label for="passport-issue-date-${touristCount}">Дата выдачи:</label>
    <input type="date" id="passport-issue-date-${touristCount}" name="passport-issue-date-${touristCount}" required>

    <label for="passport-issue-place-${touristCount}">Место выдачи:</label>
    <input type="text" id="passport-issue-place-${touristCount}" name="passport-issue-place-${touristCount}" required>
  </div>
  `;

  const tourType = document.getElementById('tour-type').textContent.split(" : ")[1]// Замените на актуальное значение
  if (tourType == 'Международный') {
    form.innerHTML += `
    <h4>Данные заграничного паспорта</h4>
    <div class="form-group">
      <label for="int-passport-name-${touristCount}">Имя:</label>
      <input type="text" id="int-passport-name-${touristCount}" name="int-passport-name-${touristCount}" required>

      <label for="int-passport-surname-${touristCount}">Фамилия:</label>
      <input type="text" id="int-passport-surname-${touristCount}" name="int-passport-surname-${touristCount}" required>

      <label for="int-passport-issue-date-${touristCount}">Дата выдачи:</label>
      <input type="date" id="int-passport-issue-date-${touristCount}" name="int-passport-issue-date-${touristCount}" required>

      <label for="int-passport-issue-place-${touristCount}">Место выдачи:</label>
      <input type="text" id="int-passport-issue-place-${touristCount}" name="int-passport-issue-place-${touristCount}" required>

      <label for="int-passport-expiry-date-${touristCount}">Дата истечения:</label>
      <input type="date" id="int-passport-expiry-date-${touristCount}" name="int-passport-expiry-date-${touristCount}" required>

      <label for="int-passport-number-${touristCount}">Номер:</label>
      <input type="text" id="int-passport-number-${touristCount}" name="int-passport-number-${touristCount}" required>
    </div>
    `;
  }

  passengerFormsContainer.appendChild(form);
}

function submitForms() {
  const tourists = [];
  for (let i = 1; i <= touristCount; i++) {
    const tourist = {
      name: document.getElementById(`passenger-name-${i}`).value,
      surname: document.getElementById(`passenger-surname-${i}`).value,
      patronymic: document.getElementById(`passenger-patronymic-${i}`).value,
      birthdate: document.getElementById(`passenger-birthdate-${i}`).value,
      gender: document.getElementById(`passenger-gender-${i}`).value,
      passport: {
        series: document.getElementById(`passport-series-${i}`).value,
        issueDate: document.getElementById(`passport-issue-date-${i}`).value,
        issuePlace: document.getElementById(`passport-issue-place-${i}`).value,
      },
    };

    const tourType = document.getElementById('tour-type').textContent.split(" : ")[1]// Замените на актуальное значение
    if (tourType === 'Международный') {
      tourist.internationalPassport = {
        name: document.getElementById(`int-passport-name-${i}`).value,
        surname: document.getElementById(`int-passport-surname-${i}`).value,
        issueDate: document.getElementById(`int-passport-issue-date-${i}`).value,
        issuePlace: document.getElementById(`int-passport-issue-place-${i}`).value,
        expiryDate: document.getElementById(`int-passport-expiry-date-${i}`).value,
        number: document.getElementById(`int-passport-number-${i}`).value,
      };
    }

    tourists.push(tourist);
  }
  submitRequest(tourists)
}

async function submitRequest(tourists) {
  await fetch(`/api/tours/${tourId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
    },
    body: JSON.stringify({
      tourists: tourists
    })
  }).then(res => res.json().then(data  =>  {
    if (res.ok) {
      alert('Заявка успешно отправлена')
      closeModal();
    } else if (res.status = 400) {
      alert(data.message)
    }
  }))
    
}


document.getElementById('logoutButton').addEventListener('click', e => {
  e.preventDefault();
  logout();
})

function logout() {
  localStorage.removeItem('userJwt');
  window.location.reload();
}

async function register(event) {
  event.preventDefault(); // предотвращение отправки формы по умолчанию

  const username = document.querySelector('#registerForm').querySelector('#username').value;
  const password = document.querySelector('#registerForm').querySelector('#password').value;
  const email = document.querySelector('#registerForm').querySelector('#email').value;
  const phone = document.querySelector('#registerForm').querySelector('#phone').value;
  const firstName = document.querySelector('#registerForm').querySelector('#firstName').value;
  const lastName = document.querySelector('#registerForm').querySelector('#lastName').value;
  const role = document.getElementById('role-select').value;

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      email,
      phone,
      firstName,
      lastName,
      role
    })
  });

  const data = await res.json();
  if (res.ok) {
    if (!data.user) {
      alert(data.message);
    } else {
      if (data.user.role == 'USER') {
        localStorage.setItem('userJwt', data.token);
        window.location.reload();
      }
      localStorage.setItem('jwt', data.token);

    }
    closeRegisterModal();
    closeModal();

  }
  if (res.status === 400) {
    alert(data.message);
  }
}

async function login(event) {
  event.preventDefault(); // предотвращение отправки формы по умолчанию

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  const data = await res.json();
  if (res.ok) {
    if (data.user.role == 'USER') {
      localStorage.setItem('userJwt', data.token);
      window.location.reload();
    }
    else {
      localStorage.setItem('jwt', data.token);
    }
    if (data.user.role === 'ADMIN') {
      window.location.href = '/admin';
    } else if (data.user.role === 'CONTENT_MANAGER') {
      window.location.href = '/content-manager';
    } else if (data.user.role === 'SALES_MANAGER') {
      window.location.href = '/sales-manager';
    }
    closeModal();

  }
}

// Привязка функций к формам
document.getElementById('registerForm').addEventListener('submit', register);
document.getElementById('loginForm').addEventListener('submit', login);