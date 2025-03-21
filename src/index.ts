import './scss/styles.scss';
import { EventEmitter } from './components/base/Events';
import { API_URL, CDN_URL, ERROR_MESSAGES, settings } from './utils/constants';
import { Api } from './components/base/Api';
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
import { cloneTemplate, ensureElement } from './utils/utils';
import { SuccessOrder } from './components/view/SuccessOrder';
import { FailOrder } from './components/view/FailOrder';

const events = new EventEmitter();
const api = new Api(API_URL);
const page = new Page(events);
const appModel = new AppModel(events);
const userData = new UserData(events);
const basketModel = new BasketModel(events);

const modalElement = ensureElement('.modal');
const modalWindow = new Modal(modalElement, events);

const basketTemplate = cloneTemplate('#basket') as HTMLElement;
const basket = new Basket(basketTemplate, events);
basket.buttonState(basketModel.isEmpty());

const galleryCardTemplate = ensureElement(
	'#card-catalog'
) as HTMLTemplateElement;

const modalCardTemplate = ensureElement('#card-preview') as HTMLTemplateElement;
const basketCardTemplate = ensureElement('#card-basket') as HTMLTemplateElement;

const formOrderTemplate = ensureElement('#order') as HTMLTemplateElement;
const formOrder = new Form(formOrderTemplate, events);

const formContactsTemplate = ensureElement('#contacts') as HTMLTemplateElement;
const formContacts = new Form(formContactsTemplate, events);

userData.setError({
	fieldName: 'address',
	errorMessage: ERROR_MESSAGES.address,
});

userData.setError({
	fieldName: 'email',
	errorMessage: ERROR_MESSAGES.email,
});

userData.setError({
	fieldName: 'phone',
	errorMessage: ERROR_MESSAGES.phone,
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
	const productInModal = new Card(
		modalCardTemplate,
		appModel.getItem(card.id),
		events
	);
	modalWindow.setContent(productInModal.render());
	if (
		basketModel.isBasketProduct(card.id) ||
		!appModel.getItem(card.id).price
	) {
		productInModal.disableButtonAddToCart();
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
	const products = basketModel.products.map((product, index) => {
		const card = new Card(basketCardTemplate, product, events);
		card.basketItemIndex.textContent = `${index + 1}`;
		return card;
	});
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
	validateInput(formOrder, evt);
	formOrder.toggleButtonState(!!userData.payment && !!userData.address);
});

events.on<Event>('modal-address:submit', (evt) => {
	modalWindow.clear();
	modalWindow.setContent(formContacts.form);
});

events.on<Event>('email:changed', (evt) => {
	validateInput(formContacts, evt);
	formContacts.toggleButtonState(!!userData.email && !!userData.phone);
});

events.on<Event>('phone:changed', (evt) => {
	validateInput(formContacts, evt);
	formContacts.toggleButtonState(!!userData.email && !!userData.phone);
});

const successOrder = new SuccessOrder(cloneTemplate('#success'), events);
const failOrder = new FailOrder(cloneTemplate('#success'), events);

events.on<Event>('modal-contacts:submit', (evt) => {
	const total: number = basketModel.getTotalPrice();
	const itemsId: string[] = basketModel.products.map((product) => {
		return product.id;
	});
	const orderInformation: IUserData = userData.getOrderInformation();
	const order: IOrder = { ...orderInformation, total: total, items: itemsId };
	api
		.post('/order/', order)
		.then((response: TSuccessOrderResponse) => {
			modalWindow.clear();
			successOrder.showOrderAmount(response.total);
			modalWindow.setContent(successOrder.element);
			formContacts.clear();
			formOrder.clear();
			basketModel.clear();
		})
		.catch((error: TFailOrderResponse) => {
			modalWindow.clear();
			modalWindow.setContent(failOrder.element);
			formContacts.clear();
			formOrder.clear();
			console.error('Ошибка запроса: ', error);
		});
});

events.on<Event>('modal-success:submit', () => {
	modalWindow.close();
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

function validateInput(formElement: Form, event: Event): void {
	const input = event.target as HTMLInputElement;
	userData[input.name] = input.value;
	if (userData.validate(input.value)) {
		formElement.hideInputError(input.name);
	} else {
		formElement.showInputError(input.name, userData.errors[input.name]);
	}
}
