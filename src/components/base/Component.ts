import { IEvents } from './Events';

export abstract class Component<T> {
	protected template: HTMLTemplateElement;
	protected element: HTMLElement;
	protected events: IEvents;

	constructor(template: HTMLTemplateElement, data: T, events: IEvents) {
		this.template = template;
		this.events = events;
	}

	abstract fillElement(data: T): void;

	render(): HTMLElement {
		return this.element;
	}

	remove(): void {
		this.element.remove();
	}
}
