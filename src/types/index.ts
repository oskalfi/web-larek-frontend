import { Card } from '../components/view/Card';

export interface IAppModel {
	products: ICard[];
	preview: string | null;
	isBlocked: boolean;
	setItems(items: ICard[]): void;
	setPreview(id: string): void;
	getItem(cardId: string): ICard;
	getItems(): ICard[];
}

export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IBasketModel {
	products: ICard[];
	counter: number;
	addItem(card: ICard): number;
	removeItem(cardId: string): void;
	getTotalPrice(): number;
	isBasketProduct(id: string): boolean;
	getCounter(): number;
}

export interface IUserData {
	payment: string;
	email: string;
	phone: string;
	address: string;
}

export interface IOrder extends IUserData {
	total: number;
	items: string[]; // массив с идентификаторами товаров
}

export type TSuccessOrderResponse = {
	id: string;
	total: number;
};

export type TFailOrderResponse = {
	error: string;
};

export interface IPaymentPickEvent {
	event: Event;
	allButtons: Record<string, HTMLButtonElement>;
}

export type AddToBasketEvent = {
	records: ICard;
	card: Card;
};
