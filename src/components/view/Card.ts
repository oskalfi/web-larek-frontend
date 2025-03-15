import { ICard } from '../../types';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';
import { Component } from './Component';

export class Card extends Component<ICard> {
	protected template: HTMLTemplateElement;
	public element: HTMLElement | HTMLButtonElement;
	protected events: IEvents;

	protected _id: string;
	protected category?: HTMLElement;
	protected title?: HTMLElement;
	protected image?: HTMLImageElement;
	protected description?: HTMLElement;
	protected price?: HTMLElement;
	protected addToBasketButton?: HTMLButtonElement;
	protected removeFromBasket?: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, data: ICard, events: IEvents) {
		super(template, data, events);
		this._id = data.id;

		if (template.id === 'card-catalog') {
			this.element.addEventListener('click', (evt) => {
				this.events.emit('item:open', this);
			});
		}
	}

	createElement(
		data: ICard,
		template: HTMLTemplateElement
	): HTMLElement | HTMLButtonElement {
		const element = template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		// вынесем по элементам разметку шаблона
		this.category = element.querySelector('.card__category');
		this.title = element.querySelector('.card__title');
		this.image = element.querySelector(
			'.card__image'
		) as HTMLImageElement | null;
		this.description = element.querySelector('.card__text');
		this.price = element.querySelector('.card__price');
		this.addToBasketButton = element.querySelector('.card_full .card__button');
		this.removeFromBasket = element.querySelector('.basket__item-delete');

		// если элемент есть в шаблоне, разместим в нём данные
		if (this.category) this.category.textContent = data.category;
		if (this.title) this.title.textContent = data.title;
		if (this.image) this.image.src = `${CDN_URL}/${data.image}`;
		if (this.description) this.description.textContent = data.description;
		if (this.price)
			this.price.textContent =
				data.price != null ? `${data.price} синапсов` : 'Бесценно';
		if (this.addToBasketButton)
			this.addToBasketButton.addEventListener('click', () =>
				this.events.emit('item:addToBasket', { records: data, card: this })
			);
		if (this.removeFromBasket) {
			this.removeFromBasket.addEventListener('click', () => {
				this.events.emit('item:removeFromBasket', data);
			});
		}
		return element; // вернём получившуюся разметку элемента
	}

	disableButtonAddToCart(): void {
		this.addToBasketButton.disabled = true;
	}

	get id(): string {
		return this._id;
	}
}
