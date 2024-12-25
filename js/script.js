'use strict';
const h1 = document.getElementsByTagName("h1")[0];
let screenBlock = document.querySelector(".screen");
//ур9. п2
const buttonsBtn = document.getElementsByClassName("handler_btn")[0];
const buttonReset = document.getElementsByClassName("handler_btn")[1];

//ур. 9 п.3
const buttonsPlus = document.querySelector(".screen-btn");
//ур. 9 п.4
const otherItemsPercent = document.querySelectorAll(".other-items.percent");

const otherItemsNumber = document.querySelectorAll(".other-items.number"); // Получаем NodeList чек-боксов и значений % для дооп услуг

const otherItems = document.querySelectorAll(".other-items");

//ур. 9. п.5
const inputTypeRange = document.querySelector(".rollback [type='range']");
// ур 9. п.6
const spanRangeValue = document.querySelector(".rollback .range-value");

// ур 9. п.7
const totalInput = document.getElementsByClassName("main-total__items")[0].querySelectorAll("input");
const total = document.getElementsByClassName('total-input')[0]

const totalCount = document.getElementsByClassName('total-input')[1]
const totalCountOther = document.getElementsByClassName('total-input')[2] // Стоимость доп. услуг
const fullTotalCount = document.getElementsByClassName('total-input')[3] // Итоговая стоимость

const totalCountRollback = document.getElementsByClassName('total-input')[4]
// ур 9. п.8
let screens = document.querySelectorAll(".screen");

const cms = document.getElementById('cms-open') //Получаем поле чек-бокса CMS
const hiddenVariants = document.querySelector('.hidden-cms-variants'); // для выпадающего списка вариантов CMS 
const mainControlsInput = hiddenVariants.querySelector('.main-controls__input');

const cmsSelect = document.querySelector('#cms-select');
const cmsOtherInput = document.querySelector('#cms-other-input');
let cmsPercent;

//объявление переменных
const appData = {
    title: '',
    screens: [],
    screenPrice: 0,
    adaptive: true,
    rollback: 0,
    servicePricesPercent: 0,
    servicePricesNumber: 0,
    fullPrice: 0,
    servicePercentPrice: 0,
    servicesPercent: {},
    servicesNumber: {},
    rollbackMessage: 0,
    isError: true,
    sumScreens: 0,


    init: function () {
        this.addTitle()
        //НАВЕШИВАНИЕ СОБЫТИЯ НА КНОПКУ "РАСЧИТАТЬ"
        buttonsBtn.addEventListener('click', () => {
            this.start()
        })
        buttonReset.addEventListener('click', () => {
            this.reset()
        })

        buttonsPlus.addEventListener('click', this.addScreenBlock)
        inputTypeRange.addEventListener('input', this.rangeAssembled)
        inputTypeRange.addEventListener('change', this.rangeAssembled)

        // открытие блока с вып. списком CMS
        cms.addEventListener('change', this.openCmsVariants) //отлов активации чек-бокса cms

        cmsSelect.addEventListener('change', (e) => { // слушаем и фиксирум события в поле выбора варианта cms
            this.openCmsPercent();
            if (e.target.value === '50') {
                cmsPercent = 50;
            }
        })

        cmsOtherInput.addEventListener('input', (e) => {
            cmsPercent = e.target.value;

        });
    },
    // отрытие поля с типами CMS, если выбран чек-бокс CMS или закрытие
    openCmsVariants: function () {
        if (this.checked) {
            hiddenVariants.style.display = 'flex';
        } else {
            hiddenVariants.style.display = 'none';
        }
    },
    // отрытие поля с % стоимости за CMS, если в CMS выбран вариант "Другое"
    openCmsPercent: function () {

        if (cmsSelect.value === 'other') {
            mainControlsInput.style.display = '';
            // this.getCmsPercent();
        } else {
            mainControlsInput.style.display = 'none'
        }
    },

    //ВЫВОД ЗАГОЛОВКА В НАЗВАНИЕ СТРАНИЦЫ
    addTitle: function () {
        document.title = title.textContent

    },
    start: function () {
        this.revise()
        if (this.isError) {
            this.addScreens();
        }

        this.addServices()
        this.addPrices()

        //this.logger(); - //активация вывода содержимого appData

        this.showResult(); // активация метода вывода данных

        this.block(); // ЗАПУСК МЕТОДА БЛОКИРОВКИ ЧЕК-БОКСА CMS И ПОЛОЗКИ С % ОТКАТА
    },

    //Блокировка полей ввода после нажатия на Расчитать

    rangeAssembled: (event) => {
        spanRangeValue.innerText = event.target.value + "%"
        appData.rollback = event.target.value
    },

    revise: () => {
        screens = document.querySelectorAll(".screen")

        screens.forEach((screen) => {
            const select = screen.querySelector("select");
            const input = screen.querySelector("input");
            if (select.value.trim().length === 0 || input.value.trim().length === 0) {
                appData.isError = false;
                console.log('isError в функции revise: ' + this.isError);
            }
            select.addEventListener("change", this.revise);
        })
    },
    // вывод результатов вычисление в соответствующие поля
    showResult: function () {
        total.value = this.screenPrice // вывод стоимости верстки

        totalCount.value = this.sumScreens // вывод суммы экранов

        totalCountOther.value = this.servicePricesPercent + this.servicePricesNumber // вывод доп. услуг ( доп. сервисов)
        fullTotalCount.value = this.fullPrice // вывод Итоговой стоимости
        totalCountRollback.value = this.servicePercentPrice // 
    },

    addScreens: function () {
        // ВЫДЕЛЕНИЕ ПОЛЕЙ ВВОДА: (ТИПЫ ЭКРАНА + ВЫПАДАЮЩИЙ СПИСОК) И КОЛИЧЕСТВО ЭКРАНОВ 
        // + ФОРМИРОВАНИЕ МАССИВА ПО ЭКРАНАМ С РАСЧЕТОМ СТОИМОСТИ
        // + БЛОКИРОВКА ПОЛЕЙ ЧЕРЕЗ DISABLED ПОСЛЕ НАЖАТИЯ КНОПКИ "РАСЧЕТ"
        screens = document.querySelectorAll(".screen")

        screens.forEach(function (screen, index) {
            let select = screen.querySelector('select');
            select.disabled = 'true'; //блокировка поля "Тит экранов"
            const input = screen.querySelector('input')
            input.disabled = 'true' //блокировка поля "Количество экранов"
            const selectName = select.options[select.selectedIndex].textContent

            appData.screens.push({
                id: index,
                name: selectName,
                price: +select.value * +input.value,
                count: input.value
            })
        })

    },
    //ПЕРЕБОР ПОЛЕЙ С ЧЕК-БОКСАМИ И ИХ РАСЧЕТ
    addServices: function () {
        //ВЫЧИСЛЕНИЕ, БЛОКИРОВКА ЧЕК - БОКСОВ ПОЛЕЙ, РАСЧИТЫВАЕМЫХ ОТ % СТОИМОСТИ ЭКРАНОВ
        otherItemsPercent.forEach(function (item) {
            const check = item.querySelector('input[type=checkbox]')
            check.disabled = 'true' //блокировка чек-боксов выбора полей со стоимостью в % от стоимости экранов (АДАПТАЦИЯ ПОД ПЛАНШЕТЫ И МОБИЛЬНИКИ)
            const label = item.querySelector('label')
            const input = item.querySelector('input[type=text]')
            // console.log(check);
            // console.log(label);
            // console.log(input);
            if (check.checked) {
                appData.servicesPercent[label.textContent] = +input.value
            }
        })

        //ВЫЧИСЛЕНИЕ, БЛОКИРОВКА ЧЕК-БОКСОВ ПОЛЕЙ С ФИКСИРОВАННОЙ СТОИМОСТЬЮ
        otherItemsNumber.forEach(function (item) {
            const check = item.querySelector('input[type=checkbox]')
            check.disabled = 'true' //блокировка чек-боксов выбора полей с фиксированной стоимостью
            const label = item.querySelector('label')
            const input = item.querySelector('input[type=text]')
            if (check.checked) {
                appData.servicesNumber[label.textContent] = +input.value
            }
        })
    },

    addScreenBlock: function () {
        const cloneScreen = screens[0].cloneNode(true)
        screens[screens.length - 1].after(cloneScreen)
    },

    addPrices: function () {
        //Считаем суммарную стоимость экранов в массиве screens через reduce        
        this.screenPrice = this.screens.reduce(function (sum, item) {
            return sum + (+item.price)
        }, 0)
        this.sumScreens = this.screens.reduce(function (sum, item) {
            return sum + (+item.count)
        }, 0)

        //метод - цикл для ввода и валидации доп. услуг
        for (let key in this.servicesNumber) {
            this.servicePricesNumber += this.servicesNumber[key]
        }

        for (let key in this.servicesPercent) {
            this.servicePricesPercent += this.screenPrice * (this.servicesPercent[key] / 100);
        }

        if (cmsSelect.value === '50') {
            this.fullPrice = (+this.screenPrice + this.servicePricesNumber + this.servicePricesPercent) + (0.5 * (+this.screenPrice + this.servicePricesNumber + this.servicePricesPercent))
        } else if (cmsSelect.value === 'other') {

            this.fullPrice = (+this.screenPrice + this.servicePricesNumber + this.servicePricesPercent) + (+cmsOtherInput.value / 100) * (+this.screenPrice + this.servicePricesNumber + this.servicePricesPercent);
        } else {
            this.fullPrice = +this.screenPrice + this.servicePricesNumber + this.servicePricesPercent;
        }

        // const hiddenVariantsNew = document.querySelector('.hidden-cms-variants');

        this.servicePercentPrice = this.fullPrice - (this.fullPrice * (this.rollback / 100))
    },

    //Метод, блокирующий поля ввода при нажатии кнопки "Расчитать"(блокировку других полей см. в методах addScreens и addServices )
    block: () => {
        inputTypeRange.disabled = 'true' //блокировка ползунка с процентами открата
        cms.disabled = 'true' //Блокировка чек-бока CMS
        buttonsBtn.style.display = 'none' // Убираем кнопку "Расчитать" после нажатия на нее (см. метод Init)
        buttonReset.style.display = ''
    },

    //метод подсчета стоимости за вычетом отката
    getServicePercentPrices: function () {},

    // Расчет скидки в зависимости от суммы
    getRollbackMessage: function (price) {
        switch (true) {
            case price > 30000:
                this.rollbackMessage = 'Даем скидку 10%';
                break;
            case 15000 < price && price <= 30000:
                this.rollbackMessage = 'Даем скидку 5%';
                break;
            case 0 < price && price <= 15000:
                this.rollbackMessage = 'Скидка не предусмотрена';
                break;
            case price <= 0:
                this.rollbackMessage = 'Что-то пошло не так';
                break;
        }
    },

    logger: function () {
        //вывод состава метода appData - для запуска надо активировать функцию сверху
        for (const key in appData) {}

        //вывод в консоль общей стоимости экранов       
        // console.log('Экраны_сумма(screenPrice): ' + this.screenPrice);
    },

    reset: function () {
        this.resetBtn(); //Возвращение кнопки рассчитать
        this.resetScreens(); //разблокирует поля 
        this.resetCheckBox(); //разблокировка и обнуление чек- боксов
        this.resetTotal(); //
        this.showResult();
    },

    // РАЗБЛОКИРОВКА И УДАЛЕНИЕ ПОЛЕЙ С ЭКРАНАМИ
    resetScreens: () => {
        screens.forEach(function (screen, index) {
            let select = screen.querySelector('select');
            select.disabled = ''; //разблокировка поля "Тит экранов"
            const input = screen.querySelector('input')
            input.disabled = '' //разблокировка поля "Количество экранов"
            //Удаление (ниже) экранов всех, кроме первого
            if (index > 0) {
                screen.remove();
            }
            select.selectedIndex = "";
            input.value = ""
        })
    },

    resetBtn: () => {
        buttonsBtn.style.display = '' // Убираем кнопку "Расчитать" после нажатия на нее (см. метод Init)
        buttonReset.style.display = 'none'
    },
    //РАЗБЛОКИРОВКА ЧЕК-БОКСОВ 
    resetCheckBox: () => {
        console.log(otherItems)
        otherItems.forEach(function (item) {
            const check = item.querySelector('input[type=checkbox]')
            check.disabled = '' //РАЗБЛОКИРОВКА чек-боксов выбора полей с % И ФИКСИР. СТОИМОСТЬЮ
            check.checked = '' //ОБНУЛЕНИЕ чек-боксов выбора полей с % И ФИКСИР. СТОИМОСТЬЮ
        })
        cms.disabled = '' //РАЗБЛОКИРОВКА чек-бока CMS
        cms.checked = '' //ОБНУЛЕНИЕ чек-бока CMS
        inputTypeRange.disabled = '' //РАЗБЛОКИРОВКА ползунка с процентами отката
        inputTypeRange.value = 0 //ОБНУЛЕНИЕ ползунка с процентами отката
        spanRangeValue.innerText = 0 + '%' //ОБНУЛЕНИЕ НАДПИСИ ПОД ПОЛЗУНКОМ с процентами отката
    },

    resetTotal: function () {
        this.screenPrice = 0;
        this.servicePricesNumber = 0;
        this.servicePricesPercent = 0;
        this.fullPrice = 0;
        this.servicePercentPrice = 0;
        this.sumScreens = 0;
        this.totalInput = 0;
        this.total = 0;
        this.totalCount = 0;
        this.totalCountOther = 0;
        this.fullTotalCount = 0;
        this.totalCountRollback = 0;
        cmsSelect.value = "";
        cmsOtherInput.value = "";
        hiddenVariants.style.display = 'none';
        mainControlsInput.style.display = 'none'
    },
};
//КОНЕЦ ОБЬЕКТА appData  

// функционал
appData.init();