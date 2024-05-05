'use strict';

/**
 * navbar toggle
 */

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
function openModal() {
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

// Обработчик события для открытия модального окна
document.querySelector('.profile-btn').addEventListener('click', openProfileModal);

// Обработчик события для открытия модального окна регистрации при нажатии на кнопку "Зарегистрироваться"
document.getElementById('registerBtn').addEventListener('click', openRegisterModal);

// Обработчик события для закрытия модального окна при клике на оверлей
modalOverlay.addEventListener('click', function(event) {
    if (event.target == modalOverlay) {
      closeModal();
    }
    
});


// Обработчик события для закрытия модального окна при нажатии клавиши Escape
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
      closeModal();
      closeProfileModal();
      closeRegisterModal();
  }
});

document.getElementById('back-to-login').addEventListener('click', function(event) {
  closeRegisterModal();
  openModal();
})

// Обработчик события для предотвращения действия по умолчанию формы
loginForm.addEventListener('submit', function(event) {
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







