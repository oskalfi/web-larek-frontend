import { IEvents } from '../base/events';

export abstract class Component<T> {
	protected template: HTMLTemplateElement;
	protected element: HTMLElement;
	protected events: IEvents;

	constructor(template: HTMLTemplateElement, data: T, events: IEvents) {
		this.template = template;
		this.element = this.createElement(data, template);
		this.events = events;
	}

	abstract createElement(
		data: T,
		template: HTMLTemplateElement
	): HTMLElement | HTMLButtonElement;

	render(): HTMLElement {
		return this.element;
	}

	remove(): void {
		this.element.remove();
	}
}
