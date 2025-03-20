import { ICard } from '../../types';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/Events';
import { Component } from '../base/Component';
import { cloneTemplate } from '../../utils/utils';

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
	public basketItemIndex?: HTMLElement;

	constructor(template: HTMLTemplateElement, data: ICard, events: IEvents) {
		super(template, data, events);
		this._id = data.id;
		this.element = cloneTemplate(this.template);

		this.category = this.element.querySelector('.card__category');
		this.title = this.element.querySelector('.card__title');
		this.image = this.element.querySelector(
			'.card__image'
		) as HTMLImageElement | null;
		this.description = this.element.querySelector('.card__text');
		this.price = this.element.querySelector('.card__price');
		this.addToBasketButton = this.element.querySelector(
			'.card_full .card__button'
		) as HTMLButtonElement;
		this.removeFromBasket = this.element.querySelector(
			'.basket__item-delete'
		) as HTMLButtonElement;
		this.basketItemIndex = this.element.querySelector('.basket__item-index');

		this.fillElement(data);

		if (this.addToBasketButton)
			this.addToBasketButton.addEventListener('click', () =>
				this.events.emit('item:addToBasket', { records: data, card: this })
			);
		if (this.removeFromBasket) {
			this.removeFromBasket.addEventListener('click', () => {
				this.events.emit('item:removeFromBasket', data);
			});
		}
		if (template.id === 'card-catalog') {
			this.element.addEventListener('click', (evt) => {
				this.events.emit('item:open', this);
			});
		}
	}

	fillElement(data: ICard): void {
		// если элемент разметки имеется, заполним его данными товара
		if (this.title) this.title.textContent = data.title;
		if (this.image) this.image.src = `${CDN_URL}/${data.image}`;
		if (this.description) this.description.textContent = data.description;
		if (this.price)
			this.price.textContent =
				data.price != null ? `${data.price} синапсов` : 'Бесценно';
		if (this.category) {
			this.category.textContent = data.category;
			// в зависимости от категории присвоим ей цвет
			switch (data.category) {
				case 'софт-скил':
					this.category.classList.add('card__category_soft');
					break;
				case 'другое':
					this.category.classList.add('card__category_other');
					break;
				case 'дополнительное':
					this.category.classList.add('card__category_additional');
					break;
				case 'кнопка':
					this.category.classList.add('card__category_button');
					break;
				case 'хард-скил':
					this.category.classList.add('card__category_hard');
			}
		}
	}

	disableButtonAddToCart(): void {
		this.addToBasketButton.disabled = true;
	}

	get id(): string {
		return this._id;
	}
}
