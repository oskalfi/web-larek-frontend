import { ICard } from '../../types';
import { IEvents } from '../base/Events';

export class AppModel {
	protected products: ICard[];
	protected isBlocked: boolean;
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	setItems(items: ICard[]): void {
		this.products = items;
	}

	getItem(cardId: string): ICard {
		const item = this.products.find((product) => product.id === cardId);
		if (!item) {
			throw new Error(`Товар с id ${cardId} не найден`);
		}
		return item;
	}

	getItems(): ICard[] {
		return this.products;
	}

	blockThePage(): void {
		this.isBlocked = true;
		this.events.emit('page:block');
	}
}
