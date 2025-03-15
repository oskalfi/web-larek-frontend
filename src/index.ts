import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { Api } from './components/base/api';
import { AppModel } from './components/model/AppModel';
import { Card } from './components/view/Card';
import { Page } from './components/view/Page';
import { Form } from './components/view/Form';
import { UserData } from './components/model/UserData';
import {
	AddToBasketEvent,
	IOrder,
	IPaymentPickEvent,
	IUserData,
	TFailOrderResponse,
	TSuccessOrderResponse,
} from './types';
import { Modal } from './components/view/Modal';
import { Basket } from './components/view/Basket';
import { BasketModel } from './components/model/BasketModel';

const events = new EventEmitter();
const api = new Api(API_URL);
const page = new Page(events);
const appModel = new AppModel(events);
const userData = new UserData(events);
const basketModel = new BasketModel(events);

const modalElement = document.querySelector('.modal') as HTMLElement;
const modalWindow = new Modal(modalElement, events);

const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const basket = new Basket(basketTemplate, events);
basket.buttonState(basketModel.isEmpty());

const galleryCardTemplate = document.querySelector(
	'#card-catalog'
) as HTMLTemplateElement;
const modalCardTemplate = document.querySelector(
	'#card-preview'
) as HTMLTemplateElement;
const basketCardTemplate = document.querySelector(
	'#card-basket'
) as HTMLTemplateElement;

const formOrderTemplate = document.querySelector(
	'#order'
) as HTMLTemplateElement;
const formOrder = new Form(formOrderTemplate, events);

const formContactsTemplate = document.querySelector(
	'#contacts'
) as HTMLTemplateElement;
const formContacts = new Form(formContactsTemplate, events);

// решил не выделять для модального окна успешной покупки отдельного класса,
// т.к. из функционала у него разве что нажатие на кнопку и отображение итоговой
// суммы заказа
const successOrderElement = (
	document.querySelector('#success') as HTMLTemplateElement
).content.firstElementChild.cloneNode(true) as HTMLElement;
successOrderElement.querySelector('button').addEventListener('click', () => {
	modalWindow.close();
});

userData.setError({
	fieldName: 'address',
	errorMessage: 'Поле адрес обязательно для заполнения',
});

userData.setError({
	fieldName: 'email',
	errorMessage: 'Введите адрес электронной почты',
});

userData.setError({
	fieldName: 'phone',
	errorMessage: 'Введите номер телефона',
});

api
	.get('/product/')
	.then((data) => {
		appModel.setItems(data.items);
		const productCards = appModel.getItems().map((product) => {
			const item = new Card(galleryCardTemplate, product, events);
			return item.render();
		});
		page.showProducts(productCards);
	})
	.catch((error) => {
		console.error(error);
		appModel.blockThePage();
	});

// Управление закрытием модального окна
document.addEventListener('keydown', (evt) => {
	if (evt.key === 'Escape' && modalWindow.isOpened) {
		events.emit('modal:close');
	}
});

modalElement.addEventListener('click', (evt) => {
	if (evt.currentTarget === evt.target) {
		events.emit('modal:close');
	}
});

// Далее пользовательские сценарии
events.on<Card>('item:open', (card) => {
	modalWindow.setContent(
		card.createElement(appModel.getItem(card.id), modalCardTemplate)
	);
	if (
		basketModel.isBasketProduct(card.id) ||
		!appModel.getItem(card.id).price
	) {
		card.disableButtonAddToCart();
	}
	modalWindow.open();
});

events.on<AddToBasketEvent>('item:addToBasket', (product) => {
	basketModel.addItem(appModel.getItem(product.records.id));
	product.card.disableButtonAddToCart();
});

events.on<Event>('basket:open', () => {
	modalWindow.setContent(basket.element);
	modalWindow.open();
	if (basketModel.isEmpty()) {
		basket.list.textContent = 'Корзина пуста.';
	}
});

events.on<Card>('item:removeFromBasket', (product) => {
	basketModel.removeItem(product.id);
	if (basketModel.isEmpty()) {
		basket.list.textContent = 'Корзина пуста.';
	}
});

events.on<Card>('basketModel:changed', (addedProduct) => {
	basket.buttonState(basketModel.isEmpty());
	const products = basketModel.products.map(
		(product) => new Card(basketCardTemplate, product, events)
	);
	basket.displayProducts(products);
	basket.displayTotalAmount(basketModel.getTotalPrice());
	page.showBasketAmount(basketModel.products.length);
});

events.on<Event>('basket:submit', () => {
	modalWindow.clear();
	modalWindow.setContent(formOrder.form);
});

events.on<IPaymentPickEvent>('payment-method:changed', (pick) => {
	const pickedButton = pick.event.target as HTMLButtonElement;
	if (userData.payment) {
		// если одна из кнопок была активирована, деактивируем
		pick.allButtons[userData.payment].classList.remove('button_alt-active');
	}
	userData.payment = pickedButton.name;
	pickedButton.classList.add('button_alt-active');
	formOrder.toggleButtonState(!!userData.payment && !!userData.address);
});

events.on<Event>('address:changed', (evt) => {
	const input = evt.target as HTMLInputElement;
	userData.address = input.value;
	if (userData.validate(input.value)) {
		formOrder.hideInputError('address');
	} else {
		formOrder.showInputError('address', userData.errors.address);
	}
	formOrder.toggleButtonState(!!userData.payment && !!userData.address);
});

events.on<Event>('modal-address:submit', (evt) => {
	modalWindow.clear();
	modalWindow.setContent(formContacts.form);
});

events.on<Event>('email:changed', (evt) => {
	const input = evt.target as HTMLInputElement;
	userData.email = input.value;
	if (userData.validate(input.value)) {
		formContacts.hideInputError('email');
	} else {
		formContacts.showInputError('email', userData.errors.email);
	}
	formContacts.toggleButtonState(!!userData.email && !!userData.phone);
});

events.on<Event>('phone:changed', (evt) => {
	const input = evt.target as HTMLInputElement;
	userData.phone = input.value;
	if (userData.validate(input.value)) {
		formContacts.hideInputError('phone');
	} else {
		formContacts.showInputError('phone', userData.errors.phone);
	}
	formContacts.toggleButtonState(!!userData.email && !!userData.phone);
});

events.on<Event>('modal-contacts:submit', (evt) => {
	const total: number = basketModel.getTotalPrice();
	const itemsId: string[] = basketModel.products.map((product) => {
		return product.id;
	});
	const orderInformation: IUserData = userData.getOrderInformation();
	const order: IOrder = { ...orderInformation, total: total, items: itemsId };
	api
		.post('/order/', order)
		.then((data: TSuccessOrderResponse | TFailOrderResponse) => {
			if ('error' in data) {
				console.log('Ошибка запроса: ', data.error);
			} else {
				console.log('Заказ успешно оформлен! Общая стоимость: ', data.total);
			}
		});
	basketModel.clear();
	modalWindow.clear();
	successOrderElement.querySelector(
		'.order-success__description'
	).textContent = `Списано ${total} синапсов`;
	modalWindow.setContent(successOrderElement);
});

events.on<Event>('modal:close', () => {
	if (modalWindow.content.firstChild instanceof HTMLFormElement) {
		formOrder.clear();
		formContacts.clear();
	}
	modalWindow.close();
});

events.on<Event>('page:block', () => {
	alert('Ошибка запроса на сервер. Перезагрузите страницу');
});
