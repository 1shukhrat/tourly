const statuses = {
  SUBMITTED: 'Подано',
  PAYMENT: 'Оплата',
  OFFICE_INVITE: 'Приглашение в офис',
  COMPLETED: 'Готово'
};

document.addEventListener('DOMContentLoaded', async () => {
  const tabs = document.querySelectorAll('.manager-tab');
  const contents = document.querySelectorAll('.manager-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  getRequests();

});

async function getRequests()  {
  await fetch('/api/requests', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  }).then(res => {
    res.json().then(requests => {
      console.log(requests)
      const list = document.getElementById('requests');
        list.innerHTML  = '';
      requests.forEach(request => {

        const listItem = document.createElement('li');
        listItem.className = 'manager-request-item';
        listItem.dataset.status = request.status;

        const appSummary = document.createElement('div');
        appSummary.className = 'manager-request-summary';
        appSummary.onclick = function () { toggleRequestDetails(this); };

        const appName = document.createElement('span');
        appName.textContent = `${request.user.firstName} ${request.user.lastName} (${request.user.username}) - ${request.status}`;

      
        const chevronIcon = document.createElement('ion-icon');
        chevronIcon.setAttribute('name', 'chevron-down-outline');

        appSummary.appendChild(appName);
        if (request.status == 'Подано')  {
          const button = document.createElement('button');
          button.classList.add('manager-btn');
          button.classList.add('manager-btn-primary')
          button.textContent = 'Подтвердить'
          button.addEventListener('click', async () =>  {
            await fetch(`/api/requests/${request._id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
              },
              body: JSON.stringify({
                status: 'Оплата'
              })
            }).then(res => {
              if (res.ok) {
                getRequests();
              }
            })
          })
          appSummary.appendChild(button);
        } 
        appSummary.appendChild(chevronIcon);

        const appDetails = document.createElement('div');
        appDetails.className = 'manager-request-details';

        const tourInfoText = document.createElement('h3');
        tourInfoText.textContent = 'Информация о туре'

        const tourInfo = document.createElement('div');
        tourInfo.className ='manager-details-info';
          const tourName = document.createElement('p');
          tourName.textContent = `Название: ${request.tour.name}`

          const tourDescription = document.createElement('p');
          tourDescription.textContent = `Описание:  ${request.tour.description}`

          const tourPrice = document.createElement('p');
          tourPrice.textContent = `Цена:  ${request.tour.price} руб.`

          const tourDestination = document.createElement('p');
          tourDestination.textContent = `${request.tour.departureFlight.arrivalPlace.name} - ${formatDateTime(request.tour.departureFlight.departureTime).replace('T', ', ')} UTC`

          const tourType = document.createElement('p');
          tourType.textContent = `Тип:  ${request.tour.type}`

          const tourVisa = document.createElement('p');
          tourVisa.textContent = request.tour.visa ? 'Требуется виза' :  '';

          tourInfo.appendChild(tourName);
          tourInfo.appendChild(tourDescription);
          tourInfo.appendChild(tourPrice);
          tourInfo.appendChild(tourDestination);
          tourInfo.appendChild(tourType);
          tourInfo.appendChild(tourVisa);

      const hotelInfoText = document.createElement('h3')
      hotelInfoText.textContent = 'Информация о отеле'
        
      const hotelInfo = document.createElement('div');
      hotelInfo.className ='manager-details-info';

        const hotelName = document.createElement('p');
        hotelName.textContent = `Название:  ${request.tour.hotel.name}`;

        const hotelAddres = document.createElement('p');
        hotelAddres.textContent = `${request.tour.hotel.address}`;
      
        hotelInfo.appendChild(hotelName)
        hotelInfo.appendChild(hotelAddres)  

        const touristsBlocks = []

        let count = 1
        request.tourists.forEach(tourist => {
          const touristInfoText = document.createElement('h3');
          touristInfoText.textContent = `Информация о пассажире ${count}`
          const touristInfo = document.createElement('div');
          
          const touristName = document.createElement('p');
          touristName.textContent = `Имя :${tourist.firstName}`;

          const touristSurname = document.createElement('p');
          touristSurname.textContent = `Фамилия :${tourist.lastName}`

          const touristMiddleName = document.createElement('p');
          touristMiddleName.textContent = `Отчество :${tourist.midlleName} `

          const touristBirthdate = document.createElement('p');
          touristBirthdate.textContent = `Дата рождения :${formatDateTime(tourist.dateOfBirth).replace('T',  ',  ')} UTC`

          const touristGender = document.createElement('p');
          touristGender.textContent = `Пол:  ${tourist.gender}`;

          touristInfo.appendChild(touristName);
          touristInfo.appendChild(touristSurname);
          touristInfo.appendChild(touristMiddleName);
          touristInfo.appendChild(touristBirthdate);
          touristInfo.appendChild(touristGender);

          const touristPassportInfoText = document.createElement('h3');
          touristPassportInfoText.textContent = 'Паспорт'

          const touristPassportInfo = document.createElement('div');

          const touristPassportNumber = document.createElement('p');
          touristPassportNumber.textContent = `Номер и серия паспорта :${tourist.passport.series}`

          const touristPassportDate = document.createElement('p');
          touristPassportDate.textContent = `Дата выдачи :${formatDateTime(tourist.passport.dateOfIssue).replace('T',   ',   ')} UTC`

          const touristPassportIssued = document.createElement('p');
          touristPassportIssued.textContent = `Место выдачи : ${tourist.passport.issuedBy}`

          touristInfo.appendChild(touristPassportInfoText);
          touristPassportInfo.appendChild(touristPassportNumber);
          touristPassportInfo.appendChild(touristPassportDate);
          touristPassportInfo.appendChild(touristPassportIssued);
          touristInfo.appendChild(touristPassportInfo);

          if (tourist.internationalPassport) {
            const touristInternationalPassportInfoText = document.createElement('h3');
            touristInternationalPassportInfoText.textContent = 'Международный паспорт'

            const touristInternationalPassportInfo = document.createElement('div');

            const touristInternationalPassportNumber = document.createElement('p');
            touristInternationalPassportNumber.textContent = `Номер и серия паспорта :${tourist.internationalPassport.series}`

            const touristInternationalPassportDate = document.createElement('p');
            touristInternationalPassportDate.textContent = `Дата выдачи :${formatDateTime(tourist.internationalPassport.dateOfIssue).replace('T',    ',    ')} UTC`

            const touristInternationalPassportIssued = document.createElement('p');
            touristInternationalPassportIssued.textContent = `Место выдачи :${formatDateTime(tourist.internationalPassport.issuedBy).replace('T',     ',     ')} UTC`

            const touristInternationalPassportExpired = document.createElement('p');
            touristInternationalPassportExpired.textContent = `Дата истечения :${formatDateTime(tourist.internationalPassport.dateOfExpiry).replace('T',    ',    ')} UTC`

            const touristInternationalPassportFirstName = document.createElement('p');
            touristInternationalPassportFirstName.textContent = `Имя :${tourist.internationalPassport.firstName}`

            const touristInternationalPassportLastName = document.createElement('p');
            touristInternationalPassportLastName.textContent = `Фамилия :${tourist.internationalPassport.lastName} `

            touristInternationalPassportInfo.appendChild(touristInternationalPassportInfoText);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportFirstName);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportLastName);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportNumber);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportDate);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportExpired);
            touristInternationalPassportInfo.appendChild(touristInternationalPassportIssued);
            touristInfo.appendChild(touristInternationalPassportInfo);
          }


          touristsBlocks.push(touristInfo);
          count++
        })
        
        appDetails.appendChild(tourInfoText);
        appDetails.appendChild(tourInfo);
        appDetails.appendChild(hotelInfoText);
        appDetails.appendChild(hotelInfo);
        let countt  = 1
        touristsBlocks.forEach(tourist  =>  {
          const touristInfoText  = document.createElement('h3');
          touristInfoText.textContent = `Информация о пассажире ${countt} `;
          appDetails.appendChild(touristInfoText);
          appDetails.appendChild(tourist);
          countt++
        })

        listItem.appendChild(appSummary);
        if (request.status == 'Приглашение в офис') {
          appDetails.innerHTML += `
          <div>
            <form>
            <label for="packageFIles">Загрузите файлы</label>
            <input type="file" id="packageFIles" required multiple>
            <button type="button" class="manager-btn manager-btn-primary"
            onclick="finishRequest('${request._id}')">Завершить заявку</button>
            </form>
          </div>
        `
        }
        listItem.appendChild(appDetails);

        list.appendChild(listItem);
      });
    });
  });
}

async function finishRequest(id) {
  const docsInput = document.querySelector('#packageFIles').files;
  let docs = [];
  for (let docInput of docsInput) {
    const result = await encodeFileToBase64(docInput);
    docs.push({
      filename: result.filename,
      fileContent: result.base64Content
    })
  }
  await fetch(`/api/requests/${id}/finish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      files: docs
    })
  }).then(res => {
    if (res.ok) {
      getRequests();
    }
  })
}

function toggleRequestDetails(element) {
  const requestItem = element.closest('.manager-request-item');
  requestItem.classList.toggle('active');
}

function filterRequests(status) {
  const requestItems = document.querySelectorAll('.manager-request-item');

  requestItems.forEach(item => {
    if (status === 'all' || item.getAttribute('data-status') === status) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function searchRequests() {
  const input = document.getElementById('manager-search-input');
  const filter = input.value.toLowerCase();
  const requestItems = document.querySelectorAll('.manager-request-item');

  requestItems.forEach(item => {

    const elems = item.querySelectorAll('.manager-request-details p, .manager-request-summary span');
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

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const formattedDate = date.toISOString().slice(0, 16);
  return formattedDate;
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

function logout() {
  localStorage.removeItem('jwt');
  window.location.href = '/';
}