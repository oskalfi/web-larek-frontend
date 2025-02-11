export interface ICardsData {
	items: ICard[];
	getItem(cardId: string): ICard;
	getItems(): ICard[];
}

export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface IBasket extends ICardsData {
	counter: number;
	addItem(cardId: string): number;
	removeItem(cardId: string): void;
	getTotalPrice(): number;
}

export interface IUserData {
	payment: string;
	email: string;
	phone: string;
	address: string;
	clear(): void;
	getUserData(): IUserData;
}

export interface IOrder extends IUserData {
	total: number;
	items: string[]; // массив с идентификаторами товаров
}

export interface ICardView {
	id: string;
	cardTemplate: HTMLTemplateElement;
	element: HTMLElement;
	description: HTMLElement;
	image: HTMLImageElement;
	title: HTMLElement;
	category: HTMLElement;
	price: HTMLElement;
	render(): HTMLElement;
}

export interface IPage {
	container: HTMLElement;
	basketCounter: HTMLElement;
	render(items: ICard[]): void;
	showBasketAmount(items: number): void;
}

export interface IModal {
	template: HTMLTemplateElement;
	closeButton: HTMLButtonElement;
	submitButton: HTMLButtonElement;
	content: HTMLElement;
	open(): void;
	close(): void;
}
