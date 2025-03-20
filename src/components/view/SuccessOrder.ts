import { IEvents } from '../base/Events';

export class SuccessOrder {
	protected _element: HTMLElement;
	protected orderDescription: HTMLElement;
	protected submitButton: HTMLButtonElement;
	protected events: IEvents;

	constructor(element: HTMLElement, events: IEvents) {
		this._element = element;
		this.orderDescription = element.querySelector(
			'.order-success__description'
		);
		this.submitButton = element.querySelector('.button');
		this.events = events;

		this.submitButton.addEventListener('click', () => {
			this.events.emit('modal-success:submit');
		});
	}

	get element(): HTMLElement {
		return this._element;
	}

	showOrderAmount(amount: number): void {
		this.orderDescription.textContent = `Списано ${amount} синапсов`;
	}
}
