'use strict';

var me;
document.addEventListener('DOMContentLoaded', async () => {

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkin').setAttribute('min', today);
  document.getElementById('checkout').setAttribute('min', today);
  await fetch('/api/countries', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(res => res.json()).then(countries => {
    const dataList = document.getElementById('searchTours');
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.country_name;
      dataList.appendChild(option);
    })
  })

  const destinationInput = document.getElementById('destination');
  const dataList = document.getElementById('searchTours');

  destinationInput.addEventListener('input', () => {
    const filter = destinationInput.value.toLowerCase();
    const options = dataList.getElementsByTagName('option');
    let hasVisibleOptions = false;

    for (let option of options) {
      const value = option.value.toLowerCase();
      if (value.includes(filter)) {
        option.style.display = 'block';
        hasVisibleOptions = true;
      } else {
        option.style.display = 'none';
      }
    }

    // Показываем или скрываем datalist в зависимости от наличия видимых опций
    dataList.style.display = hasVisibleOptions ? 'block' : 'none';
  });

  getMe();

});


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



/**
 * header sticky & go to top
 */

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



// Получаем элементы модального окна и кнопку открытия
const modalOverlay = document.getElementById('modalOverlay');
const registerModalOverlay = document.getElementById('registerModalOverlay');
const modal = document.getElementById('modal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');


// Функция для открытия модального окна
function openLoginModal() {
  modalOverlay.style.display = 'block';
  modal.style.display = 'block';
}

// Функция для закрытия модального окна
function closeModal() {
  modalOverlay.style.display = 'none';
  modal.style.display = 'none';
}

// Открывает модальное окно регистрации
function openRegisterModal() {
  registerModalOverlay.style.display = 'block';
  registerModal.style.display = 'block';
}

// Закрывает модальное окно регистрации
function closeRegisterModal() {
  registerModalOverlay.style.display = 'none';
  registerModal.style.display = 'none'
}




// Обработчик события для открытия модального окна регистрации при нажатии на кнопку "Зарегистрироваться"
document.getElementById('registerModalButton').addEventListener('click', openRegisterModal);

// Обработчик события для закрытия модального окна при клике на оверлей
modalOverlay.addEventListener('click', function (event) {
  if (event.target == modalOverlay) {
    closeModal();
  }

});


// Обработчик события для закрытия модального окна при нажатии клавиши Escape
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeModal();
    closeProfileModal();
    closeRegisterModal();
    closeResultSearchModal();
  }
});

document.getElementById('back-to-login').addEventListener('click', function (event) {
  closeRegisterModal();
  openLoginModal();
})

// Обработчик события для предотвращения действия по умолчанию формы
loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  // Здесь можно добавить код для отправки данных формы на сервер
  // и дальнейшей обработки ответа
});


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

function openResultSearchModal() {
  document.getElementById('resultSerchToursOverlay').style.display = 'block';
  document.getElementById('resultSerchTours').style.display = 'block';
}
function closeResultSearchModal() {
  document.getElementById('resultSerchToursOverlay').style.display = 'none';
  document.getElementById('resultSerchTours').style.display = 'none';
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


document.querySelector('.tour-search-form').querySelector('button').addEventListener('click', async (e) => {
  e.preventDefault();
  const form = document.querySelector('.tour-search-form');
  const country = form.querySelector('#destination').value;
  const tourists = form.querySelector('#people').value;
  const departureDate = form.querySelector('#checkin').value;
  const returnDate = form.querySelector('#checkout').value;
  await fetch(`api/tours?country=${country}&tourists=${tourists}&departure=${departureDate}&return=${returnDate === '' ? '' : returnDate}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(res => res.json()).then(tours => {
    const resultSerchTourModal = document
      .querySelector('#resultSerchTours')
      .querySelector('.package-list');
    resultSerchTourModal.innerHTML = '';
    tours.forEach(tour => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
      <div class="package-card">
        <figure class="card-banner">
          <img src="/image/${tour.image}" alt="${tour.name}" loading="lazy">
        </figure>

        <div class="card-content" onclick = "redirectPage(${tour._id})>

          <h3 class="h3 card-title">${tour.name}</h3>

          <p class="card-text">${tour.description}</p>

          <ul class="card-meta-list">

            <li class="card-meta-item">
              <div class="meta-box">
                <ion-icon name="time"></ion-icon>
                <p class="text">${tour.dayDuration}Д/${tour.nightDuration}Н</p>
              </div>
            </li>

            <li class="card-meta-item">
              <div class="meta-box">
                <ion-icon name="people"></ion-icon>

                <p id="places" class="text">Осталось мест: ${tour.places}</p>
              </div>
            </li>

            <li class="card-meta-item">
              <div class="meta-box">
                <ion-icon name="location"></ion-icon>

                <p class="text">${tour.departureFlight.arrivalPlace.name}</p>
              </div>
            </li>

          </ul>

        </div>

        <div class="card-price">

          <p class="price">
            ${tour.price} ₽
            <span>/ на человека</span>
          </p>

          <button id= "goTour" onclick="redirectPage('${tour._id}')" class="btn btn-secondary">Бронь</button>

        </div>

      </div>
      `
      resultSerchTourModal.appendChild(listItem);
    })
    openResultSearchModal();
  });
});


function applyFilters() {
  const priceRange = document.getElementById('priceRange').value;
  
  
  const tours = Array.from(document.querySelectorAll('.package-card'));
  tours.forEach(tour => {
    const tourPrice = parseInt(tour.querySelector('.price').textContent);


    let isVisible = true;

    if (priceRange && tourPrice > priceRange) {
      isVisible = false;
    }


    tour.style.display = isVisible ? 'block' : 'none';
  });
}

function updatePriceRange() {
  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;
  document.getElementById('minPriceValue').textContent = minPrice;
  document.getElementById('maxPriceValue').textContent = maxPrice;

  filterToursByPrice(minPrice, maxPrice);
}

function updatePlacesRange() {
  const minPlaces = document.getElementById('minPlaces').value;
  const maxPlaces = document.getElementById('maxPlaces').value;
  document.getElementById('minPlacesValue').textContent = minPlaces;
  document.getElementById('maxPlacesValue').textContent = maxPlaces;

  filterToursByPlaces(minPlaces, maxPlaces);
}

// Функция для фильтрации туров по цене
function filterToursByPrice(minPrice, maxPrice) {
  const tours = document.querySelector('#resultSerchTours').querySelectorAll('.package-card');
  tours.forEach(tour => {
    const price = parseInt(tour.querySelector('.price').textContent.replace('₽', '').trim());
    if (price >= minPrice && price <= maxPrice) {
      tour.style.display = 'grid';
    } else {
      tour.style.display = 'none';
    }
  });

}

function filterToursByPlaces(minPlaces, maxPlaces)  {
  const tours = document.querySelector('#resultSerchTours').querySelectorAll('.package-card');
  tours.forEach(tour => {
    const places = parseInt(tour.querySelector('#places').textContent.split(' ')[2].trim());
    if (places >= minPlaces && places <= maxPlaces) {
      tour.style.display = 'grid';
    } else {
      tour.style.display = 'none';
    }
  });
}


document.getElementById('minPrice').addEventListener('input', updatePriceRange);
document.getElementById('maxPrice').addEventListener('input', updatePriceRange);


function redirectPage(id) {
  window.location.href = `/tour?id=${id}`;
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

document.getElementById('exitButton').addEventListener('click', e => {
  e.preventDefault();
  logout();
});
function logout() {
  localStorage.removeItem('userJwt');
  window.location.reload();
}

async function pay(id) {
  await fetch(`/api/requests/${id}/pay`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userJwt')}`
    }
  }).then(res => res.json().then(data => {
    if (!res.ok) {
      alert(data.message);
    } else {
      closeProfileModal();
      getMe();
    }
  }))
}