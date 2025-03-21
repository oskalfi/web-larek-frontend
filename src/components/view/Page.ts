import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

export class Page {
	protected main: HTMLElement;
	protected basket: HTMLButtonElement;
	protected basketCounter: HTMLElement;
	protected events: IEvents;

	constructor(events: IEvents) {
		this.main = ensureElement('.gallery');
		this.basket = ensureElement('.header__basket') as HTMLButtonElement;
		this.basketCounter = ensureElement('.header__basket-counter');
		this.events = events;

		this.basket.addEventListener('click', (evt) => {
			this.events.emit('basket:open', evt);
		});
	}

	showProducts(items: HTMLElement[]): void {
		items.forEach((item: Node) => {
			this.main.append(item);
		});
	}

	showBasketAmount(items: number): void {
		this.basketCounter.textContent = `${items}`;
	}
}
