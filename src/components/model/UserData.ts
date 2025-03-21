import { IUserData } from '../../types';
import { IEvents } from '../base/Events';

export class UserData {
	[key: string]: any;
	protected data: IUserData;
	protected events: IEvents;
	public errors: Record<string, string>;

	constructor(events: IEvents) {
		this.data = {} as IUserData;
		this.errors = {};
		this.events = events;
	}

	set payment(value: string) {
		this.data.payment = value;
	}

	get payment(): string {
		return this.data.payment;
	}

	set email(value: string) {
		this.data.email = value.trim();
	}

	get email(): string {
		return this.data.email;
	}

	set phone(value: string) {
		this.data.phone = value.trim();
	}

	get phone(): string {
		return this.data.phone;
	}

	set address(value: string) {
		this.data.address = value.trim();
	}

	get address(): string {
		return this.data.address;
	}

	getOrderInformation(): IUserData {
		return this.data;
	}

	setError(data: { fieldName: string; errorMessage: string }): void {
		this.errors[data.fieldName] = data.errorMessage;
	}

	validate(value: string): boolean {
		return value.trim() !== '';
	}

	clear(): void {
		for (const key in this.data) {
			this.data[key as keyof IUserData] = '';
		}
	}
}
