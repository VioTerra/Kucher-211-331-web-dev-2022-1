const DEFAULT_URL = 'https://edu.std-900.ist.mospolytech.ru/api';
const API_KEY = '961e9cb4-b7bc-4159-ad2e-f420a0d711a9';
const PER_PAGE = 3;
const MAX_TEXT_SELECT_SIZE = 22;
const alertRemoveTime = 2000;
const rubleSymbol = '\u20bd';

// контейнер для уведомлений
let alertContainer = document.querySelector('.alert-container');
// уведомление-шаблон
let tempAlert = document.querySelector('#alert-template');
// уведомление об успешной операции
let successAlert = document.querySelector('#alert-success');
let dangerAlert = document.querySelector('#alert-danger');
// получение кнопки поиска
let tempWalkingRoutes = document.querySelector('#table-of-walking-routes');
let WalkingRoutes = document.querySelector('.table-walking-routes');
let tempGuides = document.querySelector('#table-of-guides');
let tableGuides = document.querySelector('.table-guides');
let searchField = document.querySelector('.search-field');
let paginationContainer = document.querySelector('.pagination-bar');
let landmarkSelect = document.querySelector('#landmark-select');

// модальное окно
// кнопка для создания заявки
let buttonCreateRequest = document.querySelector('#buttonSendRequest');

//вывод уведомления на экран
function Alert(type, text) {
    // клонирование шаблона уведомления
    let alertItem = tempAlert.content.firstElementChild.cloneNode(true);
    let alertSetStyle = alertItem.querySelector('#alertSetStyle');
    alertSetStyle.classList.remove('alert-warning');
    alertSetStyle.classList.remove('alert-success');
    alertSetStyle.classList.remove('alert-danger');
    if (type == 'warning') {
        alertSetStyle.classList.add('alert-warning');
        alertItem.querySelector('.text-alert-item').innerHTML = text;
    }
    if (type == 'success') {
        alertSetStyle.classList.add('alert-success');
        alertItem.querySelector('.text-alert-item').innerHTML = text;
    }
    if (type == 'danger') {
        alertSetStyle.classList.add('alert-danger');
        alertItem.querySelector('.text-alert-item').innerHTML = text;

    }
    // добавление в контейнер для уведомлений
    alertContainer.append(alertItem);
    // задание удаления уведомления по таймеру
    setTimeout(() => alertItem.remove(), alertRemoveTime);
}

//обмен данными с сервером
async function dataExchangeWithServer(method, type, params, id) {
    let error = false;
    let data = {};
    let url;
    if (method != undefined && type != undefined) {
        if (method == 'get') {
            if (type == 'routes') {
                if (id != undefined) {
                    // получить список гидов
                    url = new URL(`${DEFAULT_URL}/routes/${id}/guides`);
                } else {
                    // получить список маршрутов
                    url = new URL(`${DEFAULT_URL}/routes`);
                }
            };
            if (type == 'orders') {
                if (id != undefined) {
                    // посмотреть заявку
                    url = new URL(`${DEFAULT_URL}/orders/${id}`);
                } else {
                    // получить список заявок
                    url = new URL(`${DEFAULT_URL}/orders`);
                }
            }
            // если нужно получить информацию о конкретном гиде
            if (type == 'guide') {
                if (id != undefined) {
                    url = new URL(`${DEFAULT_URL}/guides/${id}`);
                } else {
                    error = true;
                }
            }
            // если нужно получить информацию о конкретном маршруте
            if (type == 'route') {
                if (id != undefined) {
                    url = new URL(`${DEFAULT_URL}/routes/${id}`);
                } else {
                    error = true;
                }
            }
        }
        if (method == 'post' && type == 'orders') {
            // добавить заявку
            url = new URL(`${DEFAULT_URL}/orders`);
        }
        if ((method == 'put' || method == 'delete')
            && type == 'orders' && id != undefined) {
            // редактировать или удалить заявку
            url = new URL(`${DEFAULT_URL}/orders/${id}`);
        }
    } else {
        error = true;
    }
    let bodyParams;
    if (params && Object.keys(params).length > 0) {
        bodyParams = new URLSearchParams();
        for (let i = 0; i < Object.keys(params).length; i++) {
            bodyParams.set(Object.keys(params)[i],
                params[Object.keys(params)[i]]);
        }
    }
    if (url != undefined) {
        url.searchParams.append('api_key', API_KEY);
        // отправка запросов
        data = await fetch(url, {
            method: method.toUpperCase(),
            body: bodyParams,
        }).then(response => response.json()).then(answer => {
            return answer;
        });
    } else {
        error = true;
    }
    if (error) console.log("Произошла ошибка при обмене данными с сервером");
    return data;
}

//вычисление стоимости
function calculateCost(guideServiceCost,
    hoursNumber, numberOfVisitors) {
    // 1, чтобы умножение происходило корректно
    let totalCost = 1;
    // стоимость услуг гида
    totalCost *= guideServiceCost;
    // длительность экскурсии
    totalCost *= hoursNumber;
    // надбавка за количество посетителей экскурсии
    if (numberOfVisitors > 5 && numberOfVisitors <= 10) {
        totalCost += 1000;
    }
    if (numberOfVisitors > 10 && numberOfVisitors <= 20) {
        totalCost += 1500;
    }
    return totalCost;
}

//проверка времени
function checkStartTime(concatDate) {
    let chosenHour = concatDate.getHours();
    let chosenMinute = concatDate.getMinutes();
    if (chosenMinute % 30 != 0) {
        if (chosenMinute > 30) {
            chosenMinute = '00';
            chosenHour += 1;
        } else {
            chosenMinute = '30';
        }
    }
    if (chosenHour < 9) {
        chosenHour = '09';
        chosenMinute = '00';
        return `${chosenHour}:${chosenMinute}`;
    }
    if (chosenHour + Number(duration.value) > 23) {
        chosenHour = `${23 - Number(duration.value)}`;
        chosenMinute = '00';
    }
    if (chosenMinute == 0) chosenMinute = '00';
    if (chosenHour < 10) chosenHour = `0${chosenHour}`;
    return `${chosenHour}:${chosenMinute}`;
}

function getCurrentDate() {
// заполнение даты экскурсии текущей датой
    let timeNow = new Date();
    let yearNow = `${timeNow.getFullYear()}`;
    let monthNow = timeNow.getMonth() + 1 >= 10 ? `${timeNow.getMonth()}` :
        `0${timeNow.getMonth() + 1}`;
    let dayNow = timeNow.getDate() + 1 >= 10 ? `${timeNow.getDate() + 1}` :
        `0${timeNow.getDate() + 1}`;
    return yearNow + "-" + monthNow + "-" + dayNow;
}

//описание доп. опций
function changeFieldRequestHandler(event) {
    // обращение к модальному окну
    let modalWindow = document.querySelector("#createRequest");
    // получение данных формы
    let formInputs = modalWindow.querySelector("form").elements;
    // получение необходимых полей
    let priceGuide = formInputs['priceGuide'];
    let excursionDate = formInputs['excursion-date'];
    let startTime = formInputs['start-time'];
    let duration = formInputs['duration'];
    let numberOfPeople = formInputs['number-of-people'];
    let option1 = formInputs['option-1'];
    let option2 = formInputs['option-2'];
    let totalCost = formInputs['total-cost'];
    let concatDate = new Date(excursionDate.value + ' ' + startTime.value);
    let nowDate = new Date();
    if (concatDate <= nowDate) {
        excursionDate.value = getCurrentDate();
        concatDate = new Date(excursionDate.value + ' ' + startTime.value);
    };
    startTime.value = checkStartTime(concatDate);
    if (excursionDate.value != '' && startTime.value != '') {
        let calculateTotalCost = calculateCost(priceGuide.value,
            duration.value, numberOfPeople.value);
        if (option1.checked) calculateTotalCost *= 1.30;
        if (option2.checked) calculateTotalCost = calculateTotalCost 
        + numberOfPeople.value * 1000;            
        totalCost.value = String(Math.ceil(calculateTotalCost)) +
            ' ' + rubleSymbol;
        buttonCreateRequest.dataset.bsDismiss = 'modal';
    } else {
        delete buttonCreateRequest.dataset.bsDismiss;
        console.log('Заполните все поля');
    }
}

//кнопки доп.опций
async function btnChooseGuideHandler(event) {
    // получение идентификатора гида
    let guideId = event.target.closest('.row').dataset.idGuide;
    // получение данных о гиде
    let dataGuide = await dataExchangeWithServer('get',
        'guide', {}, guideId);
    // получение данных о маршруте
    let dataRoute = await dataExchangeWithServer('get',
        'route', {}, dataGuide.route_id);
    // обращение к модальному окну
    let modalWindow = document.querySelector("#createRequest");
    // сброс формы
    modalWindow.querySelector('form').reset();
    // получение елементов формы
    let formInputs = modalWindow.querySelector("form").elements;
    // получение необходимых полей
    let fio = formInputs['fio-guide'];
    let idGuide = formInputs['idGuide'];
    let priceGuide = formInputs['priceGuide'];
    let routeName = formInputs['route-name'];
    let idRoute = formInputs['idRoute'];
    let excursionDate = formInputs['excursion-date'];
    let option1Name = modalWindow.querySelector('#createRequest \
    .option-1 .form-check-label');
    let option1Desc = modalWindow.querySelector('#createRequest \
    .option-1 .description');
    let option1amount = formInputs['discount-amount-1'];
    let option2Name = modalWindow.querySelector('#createRequest \
    .option-2 .form-check-label');
    let option2Desc = modalWindow.querySelector('#createRequest \
    .option-2 .description');
    let option2amount = formInputs['discount-amount-2'];
    // заполнение полей необходимыми данными
    fio.value = dataGuide.name;
    idGuide.value = dataGuide.id;
    priceGuide.value = dataGuide.pricePerHour;
    routeName.value = dataRoute.name;
    idRoute.value = dataRoute.id;
    excursionDate.value = getCurrentDate();
    option1Name.innerHTML = 'Быстрый выезд гида';
    option1Desc.innerHTML = 'Гид приезжает в течение часа.\
    Стоимость увеличивается на 30%.';
    option1amount.value = '30%';
    option2Name.innerHTML = 'Легкие закуски и горячие напитки';
    option2Desc.innerHTML = 'Легкие закуски и горячие напитки во время экскурсии\
    увеличивают стоимость за каждого посетителя на ';
    option2amount.value = '1000 рублей';
    changeFieldRequestHandler();
}

//кнопка отправить
async function buttonSendRequestHandler(event) {
    let modalWindow = event.target.closest(".modal");
    let formInputs = modalWindow.querySelector("form").elements;
    if (formInputs['excursion-date'].value != '' &&
        formInputs['start-time'].value) {
        let params = {
            'guide_id': formInputs['idGuide'].value,
            'route_id': formInputs['idRoute'].value,
            'date': formInputs['excursion-date'].value,
            'time': formInputs['start-time'].value.slice(0, 5),
            'duration': formInputs['duration'].value,
            'persons': formInputs['number-of-people'].value,
            'duration': formInputs['duration'].value,
            'price': formInputs['total-cost'].value.split(' ')[0],
            'optionFirst': Number(formInputs['option-1'].checked),
            'optionSecond': Number(formInputs['option-2'].checked),
        };
        data = await dataExchangeWithServer('post', 'orders', params);
        // выводить предупреждение, что заявка создана
        // удаление старых уведомлений
        if (alertContainer.querySelector('.alert-item')) {
            alertContainer.querySelector('.alert-item').remove();
        }
        if (data.id != undefined) {
            let text = `Заявка успешно создана! :)<br>\
            Для просмотра заявок перейдите в ${linkPersonalAccount}`;
            Alert('success', text);
        } else {
            let text = `При создании заявки возникла ошибка<br>\
                    Превышен лимит в 10 заявок.<br>\
            Для удаления заявок перейдите в ${linkPersonalAccount}`;
            Alert('danger', text);
        }
    } else {
        // выводить предупреждение, что заявка не может быть создана
        // удаление старых уведомлений
        if (alertContainer.querySelector('.alert-item')) {
            alertContainer.querySelector('.alert-item').remove();
        }
        let text = 'Заявка не может быть создана<br>\
                Заполните все необходимые поля.';
        Alert('warning', text);
    }
}

//гиды 
function renGuides(data) {
    // очистка прошлых данных о гидах
    tableGuides.innerHTML = '';
    // формирование шапки таблицы путем клонирования шаблона
    let itemGuides =
        tempGuides.content.firstElementChild.cloneNode(true);
    // добавление шапки таблицы в таблицу
    tableGuides.append(itemGuides);
    // перебор и вывод строк таблицы
    for (let i = 0; i < data.length; i++) {
        // формирование элемента путем клонирования шаблона
        itemGuides = tempGuides.content.firstElementChild.cloneNode(true);
        // назначение скрытого идентификатора
        // используется для поиска информации по гиду
        itemGuides.dataset.idGuide = data[i]['id'];
        // добавление иконки
        let imgGuide = document.createElement('img');
        imgGuide.src = 'images/guide.png';
        imgGuide.classList.add('icon');
        let divImg = document.createElement('div');
        divImg.classList.add('white-square-with-rounded-edges');
        divImg.append(imgGuide);
        itemGuides.querySelector('.img').innerHTML = '';
        itemGuides.querySelector('.img').append(divImg);
        // добавление ФИО гида
        itemGuides.querySelector('.name').innerHTML = data[i]['name'];
        // добавление языков, которыми владеет гид
        if (data[i]['language'].includes(' ')) {
            let newData = data[i]['language'].split(' ');
            let langContainer = document.createElement('div');
            langContainer.classList.add('lang-container');
            for (let j = 0; j < newData.length; j++) {
                let langItem = document.createElement('div');
                langItem.classList.add('lang-item');
                langItem.innerHTML = newData[j];
                langContainer.append(langItem);
            }
            itemGuides.querySelector('.lang').innerHTML = '';
            itemGuides.querySelector('.lang').append(langContainer);
        } else {
            itemGuides.querySelector('.lang').innerHTML = data[i]['language'];
        }
        // добавление опыта работы
        let exp = data[i]['workExperience'];
        if (exp == 1) {
            itemGuides.querySelector('.exp').innerHTML =
                exp + ' год';
        } else {
            if (exp < 5) {
                itemGuides.querySelector('.exp').innerHTML =
                    exp + ' года';
            }
            if (exp >= 5) {
                itemGuides.querySelector('.exp').innerHTML =
                    exp + ' лет';
            }

        }

        // добавление стоимости услуг гида
        itemGuides.querySelector('.price').innerHTML = data[i]['pricePerHour'];
        // выбор области кнопки для выбора гида
        let choose = itemGuides.querySelector('.choose');
        // назначение стилей
        // удаление стандартного стиля
        choose.classList.remove('choose');
        // назначение стиля кнопки
        choose.classList.add('choose-btn');
        // отображение display: flex
        choose.classList.add('d-flex');
        // выравнивание
        choose.classList.add('justify-content-center');
        choose.classList.add('align-items-center');
        // создание элемента кнопки, при помощи которой выбирается маршрут
        let button = document.createElement('button');
        // добавление ссылки стилей кнопки
        button.classList.add('button');
        // добавление атрибутов для работы с модальным окном
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#createRequest';
        // добавление содержания кнопке
        button.innerHTML = 'Выбрать';
        // назначение обработчика на кнопку
        button.onclick = btnChooseGuideHandler;
        // зачистка
        choose.innerHTML = '';
        // добавление кнопки
        choose.append(button);
        // добавление строки таблицы в таблицу
        tableGuides.append(itemGuides);
    }
}

//генерирование гидов
function genGuides(data) {
    renGuides(data);
}

//кнопка выбора маршрута
async function buttonChooseRouteHandler(event) {
    let row = event.target.closest('.row');
    let idRoute = row.dataset.idRoute;
    let dataRoute = await dataExchangeWithServer('get', 'route',
        {}, idRoute);
    let data = await dataExchangeWithServer('get', 'routes', {}, idRoute);
    let nameRoute = '"' + row.querySelector('.name').innerHTML + '"';
    document.querySelector('.guides-name-of-route').innerHTML = nameRoute;
    genGuides(data);
}

//доступные маршруты
function renAvailableRoutes(data) {
    // очистка прошлых данных
    WalkingRoutes.innerHTML = '';
    // формирование шапки таблицы путем клонирования шаблона
    let itemWalkingRoutes = 
    tempWalkingRoutes.content.firstElementChild.cloneNode(true);
    // добавление шапки таблицы в таблицу
    WalkingRoutes.append(itemWalkingRoutes);

    // перебор и вывод строк таблицы
    for (let i = 0; i < data.length; i++) {
        // формирование элемента путем клонирования шаблона
        itemWalkingRoutes = 
        tempWalkingRoutes.content.firstElementChild.cloneNode(true);
        // назначение скрытого идентификатора
        // используется для поиска гидов по маршруту
        itemWalkingRoutes.dataset.idRoute = data[i]['id']; 
        // назначение названия маршрута
        itemWalkingRoutes.querySelector('.name').innerHTML = data[i]['name']; 
        // назначение описания маршрута
        itemWalkingRoutes.querySelector('.desc').innerHTML = 
        data[i]['description']; 
        // назначение описания главных объектов на маршруте
        itemWalkingRoutes.querySelector('.main-object').innerHTML = 
        data[i]['mainObject']; 
        // выбор области кнопки для выбора маршрута
        let choose = itemWalkingRoutes.querySelector('.choose'); 
        // создание элемента кнопки, при помощи которой выбирается маршрут
        // удаление стандартного стиля
        choose.classList.remove('choose');
        // назначение стиля кнопки
        choose.classList.add('choose-btn'); 
        // отображение display: flex
        choose.classList.add('d-flex'); 
        // выравнивание
        choose.classList.add('justify-content-center'); 
        choose.classList.add('align-items-center'); 
        // создание элемента кнопки, при помощи которой выбирается маршрут
        let button = document.createElement('a'); 
        //добавление ссыки на секцию с информацией о гидах
        button.href = '#list-of-guides'; 
        // добавление ссылки стилей кнопки
        button.classList.add('button'); 
        // добавление содержания кнопке
        button.innerHTML = 'Выбрать'; 
        // назначение обработчика на кнопку
        button.onclick = buttonChooseRouteHandler;
        // зачистка
        choose.innerHTML = ''; 
        // добавление кнопки
        choose.append(button); 
        // добавление строки таблицы в таблицу
        WalkingRoutes.append(itemWalkingRoutes); 
    }
}

//создание кнопки для навигации по страницам
function createPageBtn(page, classes = []) {
    // создание кнопки-ссылки
    // ссылка используется для того, чтобы при нажатии возвращаться в начало выдачи результатов
    let btn = document.createElement('a'); 
    // в цикле кнопке назначаются классы
    for (cls of classes) {
        btn.classList.add(cls);
    }
    // добавление стилей bootstrap
    btn.classList.add('page-link');
    // установка данных внутрь кода кнопки
    btn.dataset.page = page;
    // присвоение номера страницы кнопке
    btn.innerHTML = page;
    // назначение якоря на начало выдачи результатов
    btn.href = '#label-search-field';
    return btn;
}

//отрисовка элементов навигации
function renPaginationElement(currentPage, totalPages) {
    // страховка, на случай, если будет передана строка, содержащия число
    currentPage = parseInt(currentPage);
    totalPages = parseInt(totalPages);
    // объявление кнопки и инициализация раздела навигации по страницам
    let btn;
    let li;
    // обнуление прошлых значений
    paginationContainer.innerHTML = '';
    // создание контейнера, для хранения кнопок навигации по страницам
    let buttonsContainer = document.createElement('ul');
    // назначаение класса
    buttonsContainer.classList.add('pagination');
    // создание кнопки "Первая страница"
    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    // создание элемента списка и назначение необходимых классов
    li = document.createElement('li');
    li.classList.add('page-item');
    // если страница 1, то скрытие кнопки "Первая страница"
    if (currentPage == 1) {
        li.classList.add('disabled');
    }
    li.append(btn);
    // добавление кнопки "Первая страница" в контейнер для кнопок
    buttonsContainer.append(li);

    // вычисление максимального и минимального значения
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, totalPages);
    // в цикле созданются и добавляются кнопки для навигации по страницам

    for (let i = start; i <= end; i++) {
        let li = document.createElement('li');
        li.classList.add('page-item');
        btn = createPageBtn(i, i == currentPage ? ['active'] : []);
        li.append(btn);
        buttonsContainer.append(li);
    }
    // создание кнопки "Последняя страница"
    btn = createPageBtn(totalPages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    // создание элемента списка и назначение необходимых классов
    li = document.createElement('li');
    li.classList.add('page-item');
    // кнопка скрывается при достижении конца страниц или при их отсутствии
    if (currentPage == totalPages || totalPages == 0) {
        li.classList.add('disabled');
    }
    li.append(btn);
    // добавление кнопки "Последняя страница" в контейнер для кнопок
    buttonsContainer.append(li); 
    // добавление всех кнопок в контейнер
    paginationContainer.append(buttonsContainer); 
}

//отрисовка селектора для фильтрации маршрутов 
function renderSelectorOfAvailableRoutes(data) {
    // set используется для того, чтобы получить набор названий 
    // достопримечательностей без повторений 
    let setMainObject = new Set();
    for (let i = 0; i < Object.keys(data).length; i++) {
        let mainObject = data[i]['mainObject'];
        if (mainObject.includes('-')) {
            mainObject = mainObject.split('-');
            for (let j = 0; j < mainObject.length; j++) {
                setMainObject.add(mainObject[j]);
            }
        }
    }
    let resultMainObject = [];
    // перевод set в array
    setMainObject.forEach((value) => {
        resultMainObject.push(value);
    });
    // сортировка массива по алфавиту
    resultMainObject.sort();
    // запись текущего значения
    let temp = landmarkSelect.value; 
    // зачистка прошлых элементов и создание первого "пустого"
    landmarkSelect.innerHTML = '';
    let optionElem = document.createElement('option');
    optionElem.innerHTML = '';
    landmarkSelect.append(optionElem);
    // создание элементов и добавление их в селектор
    for (let i = 0; i < resultMainObject.length; i++) {
        let optionElem = document.createElement('option');
        optionElem.innerHTML = resultMainObject[i];
        landmarkSelect.append(optionElem);
    }
    landmarkSelect.value = temp; // возврат текущего значения
}
//фильтрация по названию
async function getAndFilterData(qParam) {
    // запрос данных о доступных маршрутах
    let data = await dataExchangeWithServer('get', 'routes');
    // если есть параметр
    if (qParam) {
        // то данные фильтруются по названию
        data = data.filter(value =>
            value['name'].toUpperCase().includes(qParam.toUpperCase()));
    }
    data = data.filter(value =>
        value['mainObject'].includes(landmarkSelect.value));
    return data;
}

//вывод ограниченного количества данных о доступных маршрутах
async function genAvailableRoutesItem(page, perPage, qParam) {
    let data = await getAndFilterData(qParam);
    // обнуление данных для отображения на странице
    let dataToRender = [];
    // вычисление колическтва страниц
    let totalPages = Math.ceil(data.length / perPage);
    // удаление старых уведомлений
    if (alertContainer.querySelector('.alert-item')) {
        alertContainer.querySelector('.alert-item').remove();
    }
    // если значение страницы выходит за допустимые пределы
    if (page > totalPages && page < 1) {
        WalkingRoutes.innerHTML = 'Ошибка: выход за пределы доступных страниц';
    } else {
        if (Object.keys(data).length == 0) {
            WalkingRoutes.innerHTML = '';
            paginationContainer.innerHTML = '';
            // клонирование шаблона уведомления
            let text = 'По данному запросу "' + qParam + '" ничего не \
            найдено\<br>Попробуйте изменить запрос \
                    или зайдите позже.';
            Alert('warning', text);
            return;
        }
        // иначе добавляются данные для отображения в определнном количестве
        let max = Math.min(page * perPage, data.length);
        for (let i = (page - 1) * perPage; i < max; i++) {
            dataToRender.push(data[i]);
        }
        // вызов функций отображения маршрутов и панели навигации по страницам
        renAvailableRoutes(dataToRender);
        renPaginationElement(page, totalPages);
    }
}

//обработка изменения значения селектора достопримечательностей
function selectorOfAvailableRoutesHandler(event) {
    genAvailableRoutesItem(1, PER_PAGE, searchField.value);
}

//обработчик для кнопок навигации по странице
function pageBtnHandler(event) {
    // если нажата не клавиша навигации, то обработчик прекращает работу
    if (!event.target.classList.contains('page-link')) return;
    // если клавиша неактивна, то обработчик прекращает работу
    if (event.target.classList.contains('disabled')) return;
    // иначе, обработчик подгружает данные по нужной странице
    genAvailableRoutesItem(event.target.dataset.page, 
        PER_PAGE, searchField.value);
}

//генерация селектора
async function generateSelector() {
    let data = await getAndFilterData(searchField.value);
    renderSelectorOfAvailableRoutes(data);
}

//поле поиска
async function searchFieldHandler(event) {
    genAvailableRoutesItem(1,
        PER_PAGE,
        event.target.value);
    generateSelector();
}


//делигирование
window.onload = function () {
    // первоначальная загрузка доступных маршрутов и селектора
    genAvailableRoutesItem(1, PER_PAGE);
    generateSelector();
    // назначение обрабтчика на нажатие по панели навигации
    document.querySelector('.pagination-bar').onclick = pageBtnHandler;
    // назначение обработчика на изменение в поле поиска
    searchField.oninput = searchFieldHandler;
    // назначение обработчика на изменение селектора достопримечательностей
    landmarkSelect.onchange = selectorOfAvailableRoutesHandler;
    buttonCreateRequest.onclick = buttonSendRequestHandler;
    // получение полей формы модального окна, у которых необходимо отслеживать изменения
    document.querySelector('#excursion-date').onchange = 
    changeFieldRequestHandler;
    document.querySelector('#start-time').onchange = changeFieldRequestHandler;
    document.querySelector('#duration').onchange = changeFieldRequestHandler;
    document.querySelector('#number-of-people').onchange = 
    changeFieldRequestHandler;
    document.querySelector('#option-1').onchange = changeFieldRequestHandler;
    document.querySelector('#option-2').onchange = changeFieldRequestHandler;
    // назначение обработчика на кнопку "отмена" у модального окна
    document.querySelector('#buttonCancel').onclick = function () {
        // удаление старых уведомлений
        if (alertContainer.querySelector('.alert-item')) {
            alertContainer.querySelector('.alert-item').remove();
        };
    };
};
