import { ICard } from '../../types';
import { IEvents } from '../base/events';

export class BasketModel {
	protected _products: ICard[];
	protected events: IEvents;

	constructor(events: IEvents) {
		this._products = [] as ICard[];
		this.events = events;
	}

	addItem(product: ICard): void {
		this._products.push(product);
		this.events.emit('basketModel:changed', product);
	}

	removeItem(cardId: string): void {
		this._products = this._products.filter((product) => product.id !== cardId);
		this.events.emit('basketModel:changed');
	}

	getTotalPrice(): number {
		return this._products.reduce(
			(total, product) => (total += product.price),
			0
		);
	}

	isBasketProduct(id: string): boolean {
		return this._products.some((product) => id === product.id);
	}

	isEmpty(): boolean {
		return !this._products.length;
	}

	getCounter(): number {
		return this._products.length;
	}

	get products(): ICard[] {
		return this._products;
	}

	clear(): void {
		this._products = [] as ICard[];
		this.events.emit('basketModel:changed');
	}
}
