import {
	cloneTemplate,
	ensureAllElements,
	ensureElement,
} from '../../utils/utils';
import { IEvents } from '../base/Events';

// При сабмите
// инициирует событие, в которое передаёт объект с данными из полей ввода.

export class Form {
	protected element: HTMLFormElement;
	protected formName: string;
	protected submitButton: HTMLButtonElement;
	protected events: IEvents;
	protected inputs: NodeListOf<HTMLInputElement>;
	protected inputsErrors: Record<string, HTMLElement> = {};
	protected paymentButtons?: Record<'card' | 'cash', HTMLButtonElement>;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		this.events = events;
		this.element = cloneTemplate(template) as HTMLFormElement;
		// далее инициализация используемых элементов формы
		this.formName = this.element.name;
		this.submitButton = ensureElement(
			'.modal__actions .button',
			this.element
		) as HTMLButtonElement;
		this.inputs = this.element.querySelectorAll('.form__input');
		ensureAllElements('.form__input-error', this.element).forEach(
			(errorElement) => {
				this.inputsErrors[errorElement.id] = errorElement as HTMLElement;
			}
		);

		if (this.formName === 'order') {
			this.paymentButtons = {
				card: this.element.elements.namedItem('card') as HTMLButtonElement,
				cash: this.element.elements.namedItem('cash') as HTMLButtonElement,
			};
			// далее на каждую кнопку повесим слушатель клика
			// для этого получим объект итератор c полями объекта this.paymentButton
			// и пройдёмся по нему циклом for...of.
			// В обработчик события будет передаваться объект типа IPaymentPickEvent
			// В котором содержится объект события и ссылка на this.paymentButtons
			// чтобы в обработчике события деактивировать прошлый выбор, если он был
			for (const [buttonName, button] of Object.entries(this.paymentButtons)) {
				button.addEventListener('click', (evt) => {
					this.events.emit('payment-method:changed', {
						event: evt,
						allButtons: this.paymentButtons,
					});
				});
			}
		}

		// добавление слушателей событий
		this.inputs.forEach((input) => {
			input.addEventListener('input', (evt) => {
				this.events.emit(`${input.name}:changed`, evt);
			});
		});

		this.form.addEventListener('submit', (evt) => {
			evt.preventDefault();
			switch (this.formName) {
				case 'order':
					this.events.emit('modal-address:submit', evt);
					break;
				case 'contacts':
					this.events.emit(`modal-contacts:submit`, evt);
					break;
				default:
					console.log('Для данной формы не предусмотрен обработчик события');
			}
		});
	}

	get form(): HTMLFormElement {
		return this.element;
	}

	toggleButtonState(validity: boolean): void {
		this.submitButton.disabled = !validity;
	}

	clear(): void {
		this.inputs.forEach((input) => (input.value = ''));

		if (this.paymentButtons) {
			Object.values(this.paymentButtons).forEach((button) => {
				button.classList.remove('button_alt-active');
			});
		}
	}

	showInputError(fieldName: string, errorMessage: string): void {
		this.inputsErrors[fieldName].textContent = errorMessage;
	}

	hideInputError(fieldName: string) {
		this.inputsErrors[fieldName].textContent = '';
	}
}
