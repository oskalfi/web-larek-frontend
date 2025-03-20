import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

export class Modal {
	public isOpened: boolean;
	protected container: HTMLElement;
	protected _contentContainer: HTMLElement;
	protected closeButton: HTMLButtonElement;
	protected submitButton?: HTMLButtonElement;
	protected events: IEvents;

	constructor(modalElement: HTMLElement, events: IEvents) {
		this.container = modalElement;
		this.events = events;
		this._contentContainer = ensureElement('.modal__content', modalElement);
		this.closeButton = ensureElement(
			'.modal__close',
			modalElement
		) as HTMLButtonElement;
		this.isOpened = false;

		this.closeButton.addEventListener('click', (evt) => {
			this.events.emit('modal:close');
		});
	}

	open(): void {
		this.container.classList.add('modal_active');
		document.body.classList.add('no-scroll');
		this.isOpened = true;
	}

	close(): void {
		this.container.classList.remove('modal_active');
		document.body.classList.remove('no-scroll');
		this._contentContainer.firstElementChild.remove();
		this.isOpened = false;
	}

	setContent(content: HTMLElement): void {
		this._contentContainer.append(content);
	}

	clear(): void {
		this._contentContainer.firstElementChild.remove();
	}

	get content(): HTMLElement {
		return this._contentContainer;
	}
}
