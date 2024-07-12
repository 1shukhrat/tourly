document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.content-manager-tab');
  const contents = document.querySelectorAll('.content-manager-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  getToursRequest();
  getHotelsRequest();
  getFlightsRequest();
  getServicesRequest();
  getAvailableFlights();
  getCountriesRequest();
});

const getToursRequest = async () => {
  await fetch('/api/tours', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(tours => {
    document.getElementById('tours').innerHTML = '';
    tours.forEach(tour => {
      addTour(tour);
    })
  }));

};

const getHotelsRequest = async () => {
  const hotels = await fetch('/api/hotels', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(hotels => {
    document.getElementById('hotels').innerHTML = '';
    document.getElementById('hotel-tour-select').innerHTML = '';
    hotels.forEach(hotel => {
      addHotel(hotel);
      addHotelToSelect(hotel);
    });
    document.getElementById('hotel-tour-select').value = '';
  }));
};

const getFlightsRequest = async () => {
  await fetch('/api/flights', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(flights => {
    document.getElementById('flights').innerHTML = '';
    flights.forEach(flight => {
      addFlight(flight);
    });
  }));
};

const getAvailableFlights = async () => {
  await fetch('/api/flights?available=true', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(flights => {
    document.getElementsByClassName('flight-tour-select')[0].innerHTML = '';
    let select = document.getElementsByClassName('flight-tour-select')[0];
    flights.forEach(flight => {
      addFlightToSelect(flight, select);
    });
    select.value = '';

  }))
}

const getAvailableFlightsByCities = async (id) => {
  await fetch(`/api/flights?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(flights => {
    document.getElementsByClassName('flight-tour-select')[1].innerHTML = '';
    let select = document.getElementsByClassName('flight-tour-select')[1];
    flights.forEach(flight => {
      addFlightToSelect(flight, select);
    });
    select.value = '';


  }))
}

const getServicesRequest = async () => {
  await fetch('/api/services', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(services => {
    document.getElementById('serviceSelect').innerHTML = '';
    services.forEach(service => addService(service));
  }));

}

const getCountriesRequest = async () => {
  await fetch('/api/countries', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(countries => {
    document.getElementById('flight-departure-country').innerHTML = '';
    document.getElementById('flight-arrival-country').innerHTML = '';
    countries.forEach(country => {
      addCountryToSelect(document.getElementById('flight-departure-country'), country);
      addCountryToSelect(document.getElementById('flight-arrival-country'), country)
    });
    document.getElementById('flight-departure-country').value = '';
    document.getElementById('flight-arrival-country').value = '';
  }));
}

const getCitiesByCountry = async (country, select) => {
  await fetch(`/api/cities?country=${country}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json().then(cities => {
    select.innerHTML = '';
    cities.forEach(city => {
      addCityToSelect(select, city);
    });
  }));
}

function addTour(tour) {
  const toursList = document.getElementById('tours');

  const listItem = document.createElement('li');
  listItem.className = 'content-item';
  listItem.dataset.type = tour.type == 'Внутренний' ? 'domestic' : 'international';

  const tourSummary = document.createElement('div');
  tourSummary.className = 'content-summary';
  tourSummary.onclick = function () { toggleDetails(this); };

  const tourName = document.createElement('span');
  tourName.textContent = `${tour.name}`;

  const chevronIcon = document.createElement('ion-icon');
  chevronIcon.setAttribute('name', 'chevron-down-outline');

  const editButton = document.createElement('button');
  editButton.className = 'content-manager-btn content-manager-btn-primary';
  editButton.textContent = 'Изменить';
  editButton.onclick = function (e) {
    e.stopPropagation();
    editTour(tour);
  };

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.className = 'content-manager-btn btn-red'
  deleteButton.onclick = function (e) {
    e.stopPropagation();
    deleteTour(tour._id);
  };

  tourSummary.appendChild(tourName);
  tourSummary.appendChild(editButton);
  tourSummary.appendChild(deleteButton);
  tourSummary.appendChild(chevronIcon);

  const tourDetails = document.createElement('div');
  tourDetails.className = 'content-details';

  const tourText = document.createElement('div');
  tourText.className = 'content-info';

  const descriptionPara = document.createElement('p');
  descriptionPara.textContent = `Описание: ${tour.description}`;

  const pricePara = document.createElement('p');
  pricePara.textContent = `Цена: ${tour.price} руб.`;

  const dayDuration = document.createElement('p');
  dayDuration.textContent = `Количество дней : ${tour.dayDuration}`;

  const nightDuration = document.createElement('p');
  nightDuration.textContent = `Количество ночей : ${tour.nightDuration}`;

  const countOfPlaces = document.createElement('p');
  countOfPlaces.textContent = `Количество мест: ${tour.places}`

  const type = document.createElement('p');
  type.textContent = `Тип: ${tour.type}`;

  const isVisa = document.createElement('p');
  isVisa.textContent = `Требуется виза: ${tour.visa == true ? 'Да' : 'Нет'}`;

  const departure = document.createElement('p');
  departure.textContent = `Отправление: ${tour.departureFlight.departurePlace.name} - ${tour.departureFlight.arrivalPlace.name} | ${formatDateTime(tour.departureFlight.departureTime).replace('T', ', ')} UTC`

  const arrival = document.createElement('p');
  arrival.textContent = `Возвращение: ${tour.returnFlight.departurePlace.name} -  ${tour.returnFlight.arrivalPlace.name}  |  ${formatDateTime(tour.returnFlight.departureTime).replace('T', ',  ')} UTC`

  const hotelName = document.createElement('p');
  hotelName.textContent = `Отель: ${tour.hotel.name} (${tour.hotel.address})`;

  const imageContainer = document.createElement('div');
  imageContainer.className = 'content-image-container';

  const imageTitle = document.createElement('p');
  imageTitle.textContent = 'Фотография'
  const image = document.createElement('img');
  image.className = 'content-image';
  image.src = `image/${tour.image}`;
  image.alt = 'image';
  imageContainer.appendChild(imageTitle);
  imageContainer.appendChild(image);



  tourText.appendChild(descriptionPara);
  tourText.appendChild(pricePara);
  tourText.appendChild(hotelName);
  tourText.appendChild(dayDuration);
  tourText.appendChild(nightDuration);
  tourText.appendChild(countOfPlaces);
  tourText.appendChild(type);
  tourText.appendChild(isVisa);
  tourText.appendChild(departure);
  tourText.appendChild(arrival);
  tourText.appendChild(hotelName);
  
  tourDetails.appendChild(tourText);
  tourDetails.appendChild(imageContainer);


  listItem.appendChild(tourSummary);
  listItem.appendChild(tourDetails);

  toursList.appendChild(listItem);
}

function addHotel(hotel) {
  const hotelsList = document.getElementById('hotels');

  const listItem = document.createElement('li');
  listItem.className = 'content-item';

  const hotelSummary = document.createElement('div');
  hotelSummary.className = 'content-summary';
  hotelSummary.onclick = function () { toggleDetails(this); };

  const hotelName = document.createElement('span');
  hotelName.textContent = `${hotel.name} (${hotel.address})`;

  const chevronIcon = document.createElement('ion-icon');
  chevronIcon.setAttribute('name', 'chevron-down-outline');

  const editButton = document.createElement('button');
  editButton.className = 'content-manager-btn content-manager-btn-primary';
  editButton.textContent = 'Изменить';
  editButton.onclick = function (e) {
    e.stopPropagation();
    editHotel(hotel);
  };

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.className = 'content-manager-btn btn-red'
  deleteButton.onclick = function (e) {
    e.stopPropagation();
    deleteHotel(hotel._id);
  };

  hotelSummary.appendChild(hotelName);
  hotelSummary.appendChild(editButton);
  hotelSummary.appendChild(deleteButton);
  hotelSummary.appendChild(chevronIcon);

  const hotelDetails = document.createElement('div');
  hotelDetails.className = 'content-details';

  const textInfo = document.createElement('div');
  textInfo.className = 'content-info';

  const addressPara = document.createElement('p');
  addressPara.textContent = `Адрес: ${hotel.address}`;

  const typePara = document.createElement('p');
  typePara.textContent = `Тип: ${hotel.type}`;

  const ratingPara = document.createElement('p');
  ratingPara.textContent = `Рейтинг: ${hotel.rating}`;

  const nutritionPara = document.createElement('p');
  nutritionPara.textContent = `Питание: ${hotel.nutrition.join(', ')}`;

  const servicesPara = document.createElement('p');
  servicesPara.textContent = `Сервисы: ${hotel.services.map(service => service.name).join(', ')}`;

  const imageContainer = document.createElement('div');
  imageContainer.className = 'content-image-container';

  const image = document.createElement('img');
  const imageTitle = document.createElement('p');
  imageTitle.textContent = 'Фотография'
  image.className = 'content-image';
  image.src = `image/${hotel.image}`;
  image.alt = 'image';
  imageContainer.appendChild(imageTitle);
  imageContainer.appendChild(image);

  textInfo.appendChild(addressPara);
  textInfo.appendChild(typePara);
  textInfo.appendChild(ratingPara);
  textInfo.appendChild(nutritionPara);
  textInfo.appendChild(servicesPara);

  hotelDetails.appendChild(textInfo);
  hotelDetails.appendChild(imageContainer);

  listItem.appendChild(hotelSummary);
  listItem.appendChild(hotelDetails);

  hotelsList.appendChild(listItem);
}

function addHotelToSelect(hotel) {
  const select = document.getElementById('hotel-tour-select');
  const option = document.createElement('option');
  option.value = hotel._id;
  option.textContent = `${hotel.name} - ${hotel.address}`;
  select.appendChild(option);
}

function addFlight(flight) {
  const flightsList = document.getElementById('flights');

  const listItem = document.createElement('li');
  listItem.className = 'content-item';

  const flightSummary = document.createElement('div');
  flightSummary.className = 'content-summary';
  flightSummary.onclick = function () { toggleDetails(this); };

  const flightName = document.createElement('span');
  flightName.textContent = `${flight.departurePlace.name} - ${flight.arrivalPlace.name} | ${formatDateTime(flight.departureTime).replace('T', ', ')} UTC`;


  const editButton = document.createElement('button');
  editButton.className = 'content-manager-btn content-manager-btn-primary'
  editButton.textContent = 'Изменить';
  editButton.onclick = function (e) {
    e.stopPropagation();
    editFlight(flight);
  };

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.className = 'content-manager-btn btn-red'
  deleteButton.onclick = function (e) {
    e.stopPropagation();
    deleteFlight(flight._id);
  };

  flightSummary.appendChild(flightName);
  flightSummary.appendChild(editButton);
  flightSummary.appendChild(deleteButton);

  listItem.appendChild(flightSummary);
  flightsList.appendChild(listItem);
}

function addFlightToSelect(flight, select) {
  const option1 = document.createElement('option');
  option1.value = flight._id;
  option1.textContent = `${flight.departurePlace.name} - ${flight.arrivalPlace.name} | ${formatDateTime(flight.departureTime).replace('T', ', ')} UTC`;
  select.appendChild(option1);
}

function addCountryToSelect(select, country) {
  const option = document.createElement('option');
  option.value = country._id;
  option.textContent = `${country.country_name}`;
  select.appendChild(option);
}

function addCityToSelect(select, city) {
  const option = document.createElement('option');
  option.value = city._id;
  option.textContent = `${city.name}`;
  select.appendChild(option);
}

function addService(service) {
  const select = document.getElementById('serviceSelect');
  const option = document.createElement('option');
  option.value = service._id;
  option.textContent = service.name;
  select.appendChild(option);
}

async function editTour(tour) {
  openModal();
  const form = document.getElementById('editForm');
  form.innerHTML = `
  <div class="form-group">
      <label for="editTourName">Название</label>
      <input type="text" id="editTourName" class="content-manager-input" value="${tour.name}" required>
  </div>
  <div class="form-group">
      <label for="editTourDescription">Описание</label>
      <textarea id="editTourDescription" required cols="45">${tour.description}</textarea>
  </div>
  <div class="form-group">
      <label for="editCountOfDays">Количество дней</label>
      <input type="number" id="editCountOfDays" class="content-manager-input"  min="0" value="${tour.dayDuration}" required>
  </div>
  <div class="form-group">
      <label for="editCountOfNights">Количество ночей</label>
      <input type="number" id="editCountOfNights" class="content-manager-input"  min="0" value="${tour.nightDuration}"required>
  </div>
  <div class="form-group">
      <label for="editCountOfPlaces">Количество мест</label>
      <input type="number" id="editCountOfPlaces" class="content-manager-input"  min="0" value="${tour.places}"required>
  </div>
  <div class="form-group">
      <label for="editTourPrice">Цена, ₽</label>
      <input type="number" id="editTourPrice" class="content-manager-input" min="0" value="${tour.price}" required>
  </div>
  <div class="form-group">
      <label for="editTourPhoto">Фотография</label>
      <input type="file" id="editTourPhoto" accept="image/*" class="content-manager-input" required>
  </div>
  <div class="form-group content-manager-radio-group">
      <p>Тип</p>
      <input type="radio" name="editTourType" value="Внутренний" class="content-manager-input" required ${tour.type === 'Внутренний' ? 'checked' : ''}>  <p>Внутренний</p>
      <input type="radio" name="editTourType" value="Международный" class="content-manager-input" required ${tour.type === 'Международный' ? 'checked' : ''}>  <p>Международный</p>
  </div>
  <div class="form-group">
      <label for="edit-hotel-tour-select">Отель</label>
      <select id="edit-hotel-tour-select" class="form-group">
          
      </select>
  </div>
  <div class="form-group">
      <label for="edit-flight-departure-tour">Отправление</label>
      <select id="edit-flight-departure-tour" class="form-group flight-tour-select">
            
      </select>
  </div>
  <div class="form-group">
      <label for="edit-flight-arrival-tour">Прибытие</label>
      <select id="edit-flight-arrival-tour" class="form-group flight-tour-select">
          
      </select>
  </div>
  <div class="form-group content-manager-radio-group">
      <P>Виза</P>
      <input type="radio" name="editIsVisa" value="true" class="content-manager-input" required ${tour.visa === true ? 'checked' : ''}>  <p>Да</p>
      <input type="radio" name="editIsVisa" value="false" class="content-manager-input" required ${tour.visa === false ? 'checked' : ''}>   <p>Нет</p>
  </div>
  <button type="button" class="content-manager-btn content-manager-btn-primary"
      onclick="saveTourChanges('${tour._id}')">Сохранить</button>
  `;
  await fetch('/api/hotels', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(res => {
    res.json().then(hotels => {
      hotels.forEach(hotel => {
        const select = document.getElementById('edit-hotel-tour-select');
        const option = document.createElement('option');
        option.value = hotel._id
        option.textContent = `${hotel.name} (${hotel.address})`
        option.selected = tour.hotel._id == hotel._id ? true : false
        select.appendChild(option);
        select.addEventListener('change', {

        })
      })
    })
  })
  await fetch('/api/flights?available=true', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(res => {
    res.json().then(flights => {
      const select = document.getElementById('edit-flight-departure-tour');
      flights.forEach(flight => {  
        const option = document.createElement('option');
        option.value = flight._id
        option.textContent = `${flight.departurePlace.name} - ${flight.arrivalPlace.name} | ${formatDateTime(flight.departureTime).replace('T', ', ')} UTC`
        option.selected = tour.departureFlight._id == flight._id ? true : false
        select.appendChild(option);
      })
      select.addEventListener('change', async function() {
        await f1();
      })
    })
  })
  const f1 = async function() { await fetch(`/api/flights?id=${document.getElementById('edit-flight-departure-tour').value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(res => {
    res.json().then(flights => {
      const select = document.getElementById('edit-flight-arrival-tour');
      select.innerHTML = '';
      flights.forEach(flight => {
        const option = document.createElement('option');
        option.value = flight._id
        option.textContent = `${flight.departurePlace.name} - ${flight.arrivalPlace.name} | ${formatDateTime(flight.departureTime).replace('T', ', ')} UTC`
        option.selected = tour.returnFlight._id == flight._id ? true : false
        select.appendChild(option);
      })
    })
  })}
  await f1();
}

async function editHotel(hotel) {
  openModal();
  const form = document.getElementById('editForm');
  const services = await fetch('/api/services', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(result => result.json());

  form.innerHTML = `
  <div>
    <div class="form-group">
        <label for="editHotelName">Название</label>
        <input type="text" id="editHotelName" class="content-manager-input" value="${hotel.name}" required>
    </div>
    <div class="form-group">
        <label for="editHotelAddress">Адрес</label>
        <input type="text" id="editHotelAddress" class="content-manager-input" value="${hotel.address}" required>
    </div>
    <div class="form-group">
        <label for="editHotelRating">Рейтинг</label>
        <input type="number" id="editHotelRating" class="content-manager-input" value="${hotel.rating}" min="0" max="5" required>
    </div>
    <div class="form-group">
        <label for="editHotelPhoto">Фотография</label>
        <input type="file" id="editHotelPhoto" accept="image/*" class="content-manager-input">
    </div>
  </div>
  <div class="form-group">
    <label for="editHotelTypeSelect">Тип</label>
    <select id="editHotelTypeSelect" class="form-group">
        <option value="Отель" ${hotel.type === 'Отель' ? 'selected' : ''}>Отель</option>
        <option value="Апартаменты" ${hotel.type === 'Апартаменты' ? 'selected' : ''}>Апартаменты</option>
        <option value="Гостевой дом" ${hotel.type === 'Гостевой дом' ? 'selected' : ''}>Гостевой дом</option>
        <option value="Хостел" ${hotel.type === 'Хостел' ? 'selected' : ''}>Хостел</option>
        <option value="Вилла" ${hotel.type === 'Вилла' ? 'selected' : ''}>Вилла</option>
    </select>
  </div>
  <div class="form-group">
    <label for="editNutritionSelect">Питание</label>
    <select id="editNutritionSelect" class="form-group" multiple>
        <option value="Завтрак" ${hotel.nutrition.includes('Завтрак') ? 'selected' : ''}>Завтрак</option>
        <option value="Обед" ${hotel.nutrition.includes('Обед') ? 'selected' : ''}>Обед</option>
        <option value="Ужин" ${hotel.nutrition.includes('Ужин') ? 'selected' : ''}>Ужин</option>
    </select>
  </div>
  <div class="form-group">
    <label for="editServiceSelect">Услуги</label>
    <select id="editServiceSelect" class="form-group" multiple>
      ${services.map(service => `
        <option value="${service._id}" ${hotel.services.some(hotelService => hotelService._id === service._id) ? 'selected' : ''}>
          ${service.name}
        </option>`).join('')}
    </select>
  </div>
  <button type="button" class="content-manager-btn content-manager-btn-primary" onclick="saveHotelChanges('${hotel._id}')">Сохранить изменения</button>
  `;
}

async function editFlight(flight) {
  openModal();
  const form = document.getElementById('editForm');
  form.innerHTML = `
  <div class="form-group">
      <label for="edit-flight-departure-country">Отправление - Страна</label>
      <select id="edit-flight-departure-country" class="form-group flight-tour-select">
          
      </select>
  </div>
  <div class="form-group">
      <label for="edit-flight-departure-city">Отправление - Город</label>
      <select id="edit-flight-departure-city" class="form-group flight-tour-select">
          
      </select>
  </div>
  <div class="form-group">
      <label for="edit-flight-arrival-country">Прибытие - Страна</label>
      <select id="edit-flight-arrival-country" class="form-group flight-tour-select">
          
      </select>
    </div>
    <div class="form-group">
      <label for="edit-flight-arrival-city">Прибытие - Город</label>
      <select id="edit-flight-arrival-city" class="form-group flight-tour-select">
          
      </select>
    </div>
    <div class="form-group">
      <label for="editDepartureTime">Дата и время отправления</label>
      <input type="datetime-local" id="editDepartureTime" class="content-manager-input" value="${formatDateTime(flight.departureTime)}" required>
    </div>
    <button type="button" class="content-manager-btn content-manager-btn-primary" onclick="saveFlightChanges('${flight._id}')">Сохранить изменения</button>
  `;
  await fetch('/api/countries', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    }
  }).then(response => {
    response.json().then(countries => {
      const select1 = document.getElementById('edit-flight-departure-country');
      const select2 = document.getElementById('edit-flight-arrival-country');
      select1.innerHTML = '';
      select2.innerHTML = '';
      countries.forEach(country =>  {
        const option1 = document.createElement('option');
        option1.value = country._id
        option1.textContent = country.country_name;
        option1.selected = country.country_code == flight.departurePlace.country ? true : false;
        select1.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = country._id
        option2.textContent = country.country_name;
        option2.selected = country.country_code == flight.arrivalPlace.country? true : false;
        select2.appendChild(option2);
      })
      select1.addEventListener('change', async function() {
        await f(this, document.querySelector('#edit-flight-departure-city'));
      })
      select2.addEventListener('change', async function()  {
        await f(this, document.querySelector('#edit-flight-arrival-city'));
      })
    })
  })
  const f = async (countrySelect, citySelect) => {
    await fetch(`/api/cities?country=${countrySelect.value}`, {
      method:  'GET',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    }).then(response => response.json().then(cities => {
      citySelect.innerHTML = '';
      cities.forEach(city =>   {
        const option = document.createElement('option');
        option.value = city._id
        option.textContent = city.name;
        if (citySelect == document.querySelector('#edit-flight-departure-city'))  {
          option.selected = city._id == flight.departurePlace._id;
        } else {
          option.selected = city._id == flight.arrivalPlace._id;
        }
        citySelect.append(option)
      })
    }))
  }
  await f(document.querySelector('#edit-flight-departure-country'),
    document.querySelector('#edit-flight-departure-city'));
  await f(document.querySelector('#edit-flight-arrival-country'),
    document.querySelector('#edit-flight-arrival-city'));
}

async function saveTourChanges(tourId) {
  const form = document.getElementById('editForm');
  const image = document.getElementById('editTourPhoto').files[0];
  let base64Content = null;
  let filename = null;

  if (image) {
    const result = await encodeFileToBase64(image);
    base64Content = result.base64Content;
    filename = result.filename;
  }
  const tourData = {
    name: form.querySelector('#editTourName').value,
    description: form.querySelector('#editTourDescription').value,
    price: form.querySelector('#editTourPrice').value,
    hotel: form.querySelector('#edit-hotel-tour-select').value,
    departureFlight: form.querySelector('#edit-flight-departure-tour').value,
    returnFlight: form.querySelector('#edit-flight-arrival-tour').value,
    places: form.querySelector('#editCountOfPlaces').value,
    type: form.querySelector('input[name="editTourType"]:checked').value,
    visa: form.querySelector('input[name="editIsVisa"]:checked').value,
    dayDuration: form.querySelector('#editCountOfDays').value,
    nightDuration: form.querySelector('#editCountOfNights').value,
    image: base64Content && filename ? {
      fileContent: base64Content,
      fileName: filename
    } : null
  };
  await fetch(`/api/tours/${tourId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify(tourData)
  }).then(response  =>  {
    if (response.ok)  {
      getToursRequest();
      closeModal();
    }
  })
  
}

async function saveHotelChanges(hotelId) {
  const form = document.getElementById('editForm');
  const image = document.getElementById('editHotelPhoto').files[0];
  let base64Content = null;
  let filename = null;

  if (image) {
    const result = await encodeFileToBase64(image);
    base64Content = result.base64Content;
    filename = result.filename;
  }
  await fetch(`/api/hotels/${hotelId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      name: form.querySelector('#editHotelName').value,
      address: form.querySelector('#editHotelAddress').value,
      type: form.querySelector('#editHotelTypeSelect').value,
      rating: form.querySelector('#editHotelRating').value,
      nutrition: Array.from(form.querySelector('#editNutritionSelect').selectedOptions).map(o => o.value),
      services: Array.from(form.querySelector('#editServiceSelect').selectedOptions).map(o => o.value),
      image: base64Content && filename ? {
        fileContent: base64Content,
        fileName: filename
      } : null
    })
  }).then(response => {
    if (response.ok) {
      console.log('Hotel updated');
      getHotelsRequest();
      closeModal();
    }
  })
}

async function saveFlightChanges(flightId) {
  const form = document.getElementById('editForm');
  await fetch(`/api/flights/${flightId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      departurePlace: form.querySelector('#edit-flight-departure-city').value,
      arrivalPlace: form.querySelector('#edit-flight-arrival-city').value,
      departureTime: form.querySelector('#editDepartureTime').value
    })
  }).then(response => {
    if (response.ok) {
      console.log('Flight updated');
      getFlightsRequest();
      getAvailableFlights();
      closeModal();
    } else {
      console.log('Error while updating flight');
    }
  });
  console.log('Save changes for flight', flightId);
}

async function createTour() {
  const form = document.querySelector('#tourForm');
  let base64Content = null;
  let filename = null;
  const image = document.querySelector('#tourPhoto').files[0];
  if (image) {
    const result = await encodeFileToBase64(image);
    base64Content = result.base64Content;
    filename = result.filename;
  }
  const tourData = {
    name: form.querySelector('#tourName').value,
    description: form.querySelector('#tourDescription').value,
    price: form.querySelector('#tourPrice').value,
    hotel: form.querySelector('#hotel-tour-select').value,
    departureFlight: form.querySelector('#flight-departure-tour').value,
    returnFlight: form.querySelector('#flight-arrival-tour').value,
    places: form.querySelector('#countOfPlaces').value,
    type: form.querySelector('input[name="tourType"]:checked').value,
    visa: form.querySelector('input[name="isVisa"]:checked').value,
    dayDuration: form.querySelector('#countOfDays').value,
    nightDuration: form.querySelector('#countOfNights').value,
    image: base64Content && filename ? {
      fileContent: base64Content,
      fileName: filename
    } : null
  };
  await fetch('/api/tours', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify(tourData)
  }).then(response => {
    if (response.ok) {
      console.log('Tour created');
      form.querySelector('#tourName').value = '';
      form.querySelector('#tourDescription').value = '';
      form.querySelector('#tourPrice').value = '';
      form.querySelector('#tourPhoto').value = '';
      document.querySelectorAll('input[name="tourType"]')
        .forEach(radio => radio.checked = false);
      document.querySelectorAll('input[name="isVisa"]')
        .forEach(radio => radio.checked = false);
      form.querySelector('#countOfDays').value = '';
      form.querySelector('#countOfNights').value = '';
      form.querySelector('#hotel-tour-select').value = '';
      form.querySelector('#flight-departure-tour').value = '';
      form.querySelector('#flight-arrival-tour').value = '';
      getToursRequest();
    }
  })

}

async function createFlight() {
  const form = document.querySelector('#flightForm');
  await fetch(`/api/flights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      departurePlace: form.querySelector('#flight-departure-city').value,
      arrivalPlace: form.querySelector('#flight-arrival-city').value,
      departureTime: form.querySelector('#departureTime').value
    })
  }).then(response => {
    if (response.ok) {
      console.log('Flight created');
      form.querySelector('#flight-departure-country').value = '';
      form.querySelector('#flight-arrival-country').value = '';
      form.querySelector('#flight-departure-city').value = '';
      form.querySelector('#flight-arrival-city').value = '';
      form.querySelector('#departureTime').value = '';
      getFlightsRequest();
      getAvailableFlights();
    } else {
      console.log('Error while creating flight');
    }
  });
}

async function createHotel() {
  const form = document.querySelector('#hotelForm');
  console.log(form.querySelector('#hotelPhoto').files[0])
  let base64Content = null;
  let filename = null;
  const image = document.querySelector('#hotelPhoto').files[0];
  if (image) {
    const result = await encodeFileToBase64(image);
    base64Content = result.base64Content;
    filename = result.filename;
  }
  console.log(base64Content);
  console.log(filename);
  await fetch(`/api/hotels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      name: form.querySelector('#hotelName').value,
      address: form.querySelector('#hotelAddress').value,
      type: form.querySelector('#hotelTypeSelect').value,
      rating: form.querySelector('#hotelRating').value,
      nutrition: Array.from(form.querySelector('#nutritionSelect').selectedOptions).map(o => o.value),
      services: Array.from(form.querySelector('#serviceSelect').selectedOptions).map(o => o.value),
      image: base64Content && filename ? {
        fileContent: base64Content,
        fileName: filename
      } : null
    })
  }).then(response => {
    if (response.ok) {
      console.log('Hotel created');
      form.querySelector('#hotelName').value = '';
      form.querySelector('#hotelAddress').value = '';
      form.querySelector('#hotelTypeSelect').value = '';
      form.querySelector('#hotelRating').value = '';
      form.querySelector('#nutritionSelect').value = '';
      form.querySelector('#serviceSelect').value = '';
      form.querySelector('#hotelPhoto').value = '';
      getHotelsRequest();
    }
  })
}

async function deleteTour(tourId) {
  await fetch(`/api/tours/${tourId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    }
  }).then(response => {
    if (response.ok) {
      console.log('Tour deleted');
      getToursRequest();
    }
  })
}

async function deleteHotel(hotelId) {
  await fetch(`/api/hotels/${hotelId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    }
  }).then(response => {
    if (response.ok) {
      console.log('Hotel deleted');
      getHotelsRequest();
    }
  })
}

async function deleteFlight(flightId) {
  await fetch(`/api/flights/${flightId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    }
  }).then(response => {
    if (response.ok) {
      console.log('Flight deleted');
      getFlightsRequest();
      getAvailableFlights();

    } else {
      console.log('Error while deleting flight');
    }
  })
  console.log('Delete flight', flightId);
}

function logout() {
  localStorage.removeItem('jwt');
  window.location.href = '/';
}

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const formattedDate = date.toISOString().slice(0, 16);
  return formattedDate;
}

function toggleDetails(element) {
  const item = element.closest('.content-item');
  item.classList.toggle('active');
}

function filterContent(type) {
  const contentItems = document.querySelector('#tours').querySelectorAll('.content-item');

  contentItems.forEach(item => {
    if (type === 'all' || item.getAttribute('data-type') === type) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function searchContent() {
  const input = document.querySelector('.content-manager-tab-content.active .content-manager-search-input');
  const filter = input.value.toLowerCase();
  const contentItems = document.querySelectorAll('.content-manager-tab-content.active .content-item');

  contentItems.forEach(item => {
    const elems = item.querySelectorAll('.content-details p, .content-summary span');
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

function toggleCreateForm() {
  const createType = document.getElementById('createType').value;
  const tourForm = document.getElementById('tourForm');
  const hotelForm = document.getElementById('hotelForm');
  const flightForm = document.getElementById('flightForm');

  switch (createType) {
    case "tour": {
      tourForm.style.display = 'block';
      hotelForm.style.display = 'none';
      flightForm.style.display = 'none';
      break;
    };
    case "hotel": {
      tourForm.style.display = 'none';
      hotelForm.style.display = 'block';
      flightForm.style.display = 'none';
      break;
    };
    case "flight": {
      tourForm.style.display = 'none';
      hotelForm.style.display = 'none';
      flightForm.style.display = 'block';
      break;
    }
  }
}

function openModal() {
  document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function encodeFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = reader.result.split(',')[1];
      const filename = file.name;
      resolve({ base64Content, filename });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

(document.querySelectorAll('.flight-tour-select')[0]).addEventListener('change', function () {
  getAvailableFlightsByCities(this.value);
})

document.getElementById('flight-departure-country').addEventListener('change', function () {
  const country = this.options[this.selectedIndex].value;
  getCitiesByCountry(country, document.getElementById('flight-departure-city'));
})

document.getElementById('flight-arrival-country').addEventListener('change', function () {
  const country = this.options[this.selectedIndex].value;
  getCitiesByCountry(country, document.getElementById('flight-arrival-city'));
})

