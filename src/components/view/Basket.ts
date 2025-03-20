import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { Card } from './Card';

export class Basket {
	protected _element: HTMLElement;
	protected _list: HTMLElement;
	protected totalAmount: HTMLElement;
	protected orderButton: HTMLButtonElement;
	protected events: IEvents;

	constructor(element: HTMLElement, events: IEvents) {
		this._element = element;
		this._list = ensureElement('.basket__list', this._element);
		this.totalAmount = ensureElement('.basket__price', this._element);
		this.orderButton = ensureElement(
			'.basket__button',
			this._element
		) as HTMLButtonElement;
		this.events = events;

		this.orderButton.addEventListener('click', () => {
			this.events.emit('basket:submit');
		});
	}

	get element(): HTMLElement {
		return this._element;
	}

	displayProducts(products: Card[]): void {
		this._list.replaceChildren();
		products.forEach((product) => {
			this._list.append(product.element);
		});
	}

	displayTotalAmount(value: number): void {
		this.totalAmount.textContent = `${value} синапсов`;
	}

	buttonState(value: boolean): void {
		this.orderButton.disabled = value;
	}

	get list(): HTMLElement {
		return this._list;
	}
}
