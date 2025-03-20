import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { SuccessOrder } from './SuccessOrder';

export class FailOrder extends SuccessOrder {
	constructor(element: HTMLElement, events: IEvents) {
		super(element, events);
		this.element.classList.replace('order-success', 'order-fail');
		ensureElement('h2', element).textContent = 'Что-то пошло не так...';
		this.showOrderAmount(0);
		this.submitButton.textContent = 'Попробовать заново';
	}
}
