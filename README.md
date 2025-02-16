# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

# Архитектура

Архитектурный паттерн: Model-View-Presenter.
Код приложения разделён на:

- слой данных (model), отвечает за хранение и изменение данных;
- слой отображения (view), отвечает за отображение данных на странице;
- презентер, отвечает за связь между отображением и слоем данных.

## Типы данных, используемые в приложении

Модель для работы с массивом товаров:

```
interface IAppModel {
	products: ICard[];
	preview: string | null;
	isBlocked: boolean;
	setItems(items: ICard[]): void;
	setPreview(id: string): void;
	getItem(cardId: string): ICard;
	getItems(): ICard[];
}
```

Товар:

```
interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number| null;
}
```

Корзина:

```
interface IBasketModel {
	products: ICard[];
	counter: number;
	addItem(cardId: string): number;
	removeItem(cardId: string): void;
	getTotalPrice(): number;
	isBasketProduct(id: string): boolean;
	getCounter(): number;
}
```

Данные покупателя:

```
interface IUserData {
	payment: string;
	email: string;
	phone: string;
	address: string;
}
```

Данные заказа:

```
interface IOrder extends IUserData {
	total: number;
	items: string[]; // массив с идентификаторами товаров
}
```

Типы ответа сервера после отправки заказа:

```
type TSuccessOrderResponse = {
	id: string;
	total: number;
}
```

```
type TFailOrderResponse = {
	error: string;
}
```

### Базовый код

#### Класс `Component<T>`

Абстрактный класс, наследуемый классами слоя отображения. Реализует методы создания элемента с помощью шаблона,\
его обновления и перерисовки, а также удаления из разметки. Конструктор класса принимает объект типа T,\
для определения и последующего использования его данных при заполнении и рендеринге элемента.

Конструктор:

```
constructor(template: HTMLTemplateElement, data: T, events: IEvents) {
	this.template = template;
	this.element = this.createElement(data);
	this.events = events;
}
```

Поля:

- `protected template: HTMLTemplateElement` — ссылка на шаблон элемента;
- `protected element: HTMLElement | HTMLButtonElement` — ссылка на разметку элемента;
- `protected events: IEvents` — экземпляр EventEmitter;

Методы:

- `protected abstract createElement(data: T): HTMLElement | HTMLButtonElement` — создаёт элемент и заполняет его первоначальными данными;
- `render(): HTMLElement` - возвращает разметку элемента;
- `update(data: Partial<T>): void` - обновляет данные элемента и его разметку;
- `remove(): void` — удаляет элемент из разметки;

Пример создания класса Card используя `Component<T>`:

```
class Card extends Component<ICard> {
	protected category?: HTMLElement;
	protected title?: HTMLElement;
	protected image?: HTMLImageElement;
	protected description?: HTMLElement;
	protected price?: HTMLElement;
	protected addToBasketButton?: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, data: ICard, events: IEvents) {
		super(template, data, events);
	}

	protected createElement(data: ICard) {
		const element = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		 // имена классов разметки взяты для примера
		this.category = element.querySelector('.category');
		this.title = element.querySelector('.title');
		this.image = element.querySelector('.image') as HTMLImageElement | null;
		this.description = element.querySelector('.description');
		this.price = element.querySelector('.price');
		this.addToBasketButton = element.querySelector('.button');

		if (this.category) this.category.textContent = data.category;
		if (this.title) this.title.textContent = data.title;
		if (this.image) this.image.src = data.image;
		if (this.description) this.description.textContent = data.description;
		if (this.price) this.price.textContent = data.price !== null ? `${data.price}` : 'Бесценно';
		if(this.addToBasketButton) this.addToBasketButton.addEventListener('click', () => this.events.emit('item:select', this));

		return element;
	}
}
```

#### Класс API

Содержит базовую логику отправки запросов. В конструктор передаётся адрес сервера и опционально — объект с заголовками запроса.

Методы:

- `get` — выполнит GET-запрос на переданный в параметрах эндпоинт и вернёт Promise с ответом сервера;
- `post` — принимает объект с данными, которые будут переданы в формате JSON в теле запроса, и отправляет эти данные на эндпоинт — второй параметр метода. Метод POST-запроса может быть переопределён путём задания третьего параметра, по-умолчанию выполняется POST.

#### Класс EventEmitter

Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий. Основные методы, реализуемые классом описаны интерфейсом. Класс имеет следующие методы:

- `on` — устанавливает обработчик на событие;
- `off` — снимает обработчик с события;
- `emit` — воспроизводит событие;
- `trigger` — возвращает функцию, которая при вызове инициализирует событие, переданное в параметрах метода. Таким образом, помимо обработчиков события может содержать дополнительную обработку.
- `onAll` — вызвать все события;
- `offAll` — удалить все события.

### Слой данных

#### Класс AppModel

Класс необходим для работы с массивом карточек. Конструктор класса принимает экземпляр класса EventEmitter и массив карточек.\

Поля:

- `products: ICard[]` — массив карточек;
- `preview: string | null` — id объекта товара, отображаемого в модальном окне;
- `isBlocked: boolean` — заблокирована ли страница, если сервер вернул ошибку;
- `events: IEvents` — экземпляр класса `EventEmitter` для инициализации событий при изменении данных;

Методы:

- `setItems(items: ICard[]): void` — записывает полученный от сервера массив данных;
- `setPreview(id: string): void` — сохраняет id товара, открытого в модальном окне;
- `getItem(cardId: string): ICard` — возвращает отдельно взятую карточку;
- `getItems(): ICard[]` — возвращает массив карточек;

#### Класс UserData

Класс необходим для работы с данными пользователя.\
Конструктор класса принимает инстант брокера событий.\

Поля:

- `payment: string` — метод оплаты;
- `email: string` — эл.почта пользователя;
- `phone: string` — номер телефона пользователя;
- `address: string` — адрес пользователя;
- `events: IEvents` — экземпляр класса `EventEmitter` для инициализации событий при изменении данных;
- `errors: Record<string, string>` — объект, хранящий элементы ошибок, привязаных полям, где `string` — поле, `HTMLElement` — элемент ошибки;

Методы: геттеры и сеттеры для сохранения/получения данных пользователя, а также:

- `setError(data: {fieldName: string, errorMessage: string}): void` — добавляет ошибку в поле errors;
- `validate(value): boolean` — валидация данных пользователя;

#### Класс BasketModel

Предназначен для работы с данными корзины. Реализует методы добавления товара, подсчёта количества и общей стоиомости\
всех товаров в корзине.Конструктор класса принимает инстант брокера событий.\

Поля:

- `_products: ICard[]` — массив карточек;
- `events: IEvents` — экземпляр класса `EventEmitter` для инициализации событий при изменении данных;

Методы:

- `addItem(cardId: string): number` — добавит в корзину товар и вернёт общее количество товаров;
- `removeItem(cardId: string): void` — удалит товар из корзины и вызовет событие изменения корзины;
- `getTotalPrice(): number` — вернёт сумму всех товаров в корзине;
- `isBasketProduct(id: string): boolean` — есть ли в корзине товар с таким id;
- `getCounter(): number` — вернёт количество товаров в корзине;
- `get products(): ICard[]` — вернёт массив продуктов, добавленных в корзину;

### Слой отображения

Отвечают за отображение и взаимодействие с пользователем.

#### Класс Page

Наследует класс `Component<T>`. Предназначен для работы с контейнером карточек на главной странице.
Конструктор принимает экземпляр брокера событий, контейнер для карточек и контейнер кнопки корзины.

Поля:

- `container: HTMLElement` - контейнер с карточками;
- `protected basketCounter: HTMLElement` - элемент счётчика товаров;

Методы:

- `showBasketAmount(items: number): void` — отобразит в иконке корзины количество добавленных товаров;

#### Класс `Modal<T extends HTMLElement>`

Необходим для реализации модального окна.\
Содержит методы для открытия и закрытия модального окна (вставки в него контента), устанавливает слушатели на клавишу ESC (закрытие мод.окна при нажатии), на оверлей и кнопку-крестик (закрытие при клике).\

Поля:

- `protected container: HTMLElement` — контейнер модального окна;
- `protected _element: T;` — содержимое модального окна (контент);
- `closeButton: HTMLButtonElement` — кнопка закрытия;
- `submitButton: HTMLButtonElement` — кнопка подтверждения действия;
- `events: IEvents` — экземпляр класса `EventEmitter` для инициализации событий при изменении данных;

Методы:

- `open(element: HTMLElement): void` - вставляет контент в модальное окно и открывает его;
- `close(): void` — закрывает модальное окно, очищая контент;
- `set element(content: HTMLElement): void` — вставляет элемент в контейнер модального окна;

#### Класс Form

Наследует класс `Component<T>`. Предназначен для реализации отображения формы. При сабмите инициирует событие, в которое передаёт объект с данными из полей ввода. При изменении данных в поле ввода также инициирует событие изменения данных. Управляет активностью кнопки подтверждения.

Поля:

- `formName: string` — название формы;
- `inputs: HTMLCollection<HTMLInputElement>` — коллекция всех полей ввода формы;
- `submitButton: HTMLButtonElement` — кнопка подтверждения;

Методы:

- `toggleButtonState(formValid: boolean): void` — включает/отключает кнопку подтверждения;
- `showInputError(fieldName: string, errorMessage: string): void` — отображает текст ошибки;
- `hideInputError(fieldName: string)` — скрывает текст ошибки под указанным полем ввода;
- `close(): void` — расширяет родительский метод, при закрытии модального окна дополнительно очищая поля ввода и деактивируя кнопку сохранения;
- `get form(): HTMLFormElement` — геттер для получения элемента формы;

#### Класс Card

Наследует класс `Component<T>`. Отвечает за работу с различными шаблонами карточек товара, их отображением и взаимодействие с пользователем.\
Конструктор принимает объект ICard, шаблон и экземпляр брокера событий.

Поля:

- `_id: string` — идентификатор товара;
- `element: HTMLElement` — элемент карточки;
- `description: HTMLElement` — описание товара;
- `image: HTMLImageElement` — изображение товара;
- `title: HTMLElement` — название товара;
- `category: HTMLElement` — категория товара;
- `price: HTMLElement` — цена товара;
- `addToBasketButton: HTMLButtonElement` — кнопка «добавить в корзину»

Методы:

- `get id(): string` — возвращает \_id карточки;
- `toggleButtonState(cardId): void` — отключает/включает кнопку «В корзину», если товар уже был добавлен в корзину;

#### Класс Basket

Наследует класс `Component<T>`. Предназначен для отображения модального окна корзины.

Поля:

- `itemsList: HTMLElement` — контейнер списка товаров;
- `itemsCost: HTMLElement` — элемент разметки, отображающий общую стоимость товаров;

### Слой коммуникации

#### Класс AppAPI

Класс предоставляет методы взаимодействия с бэкендом. Конструктор принимает инстант класса API.

## Слой презентера

Роль презентера будет выполнять код, распологающийся в файле `./src/index.ts`. Он описывает взаимодействие отображения и данных.\
Сначала создаются все необходимые экземпляры классов, а затем настраивается работа событий.\
События, генерируемые брокером событий вызывают обработчики, за счёт которых и осуществляется взаимодействие.\

### Список событий

#### События изменения данных

_Создаются классами моделей._

- `basket:changed` - изменение количества товаров корзины;
- `userData:changed` - изменение данных пользователя;
- `item:selected` - добавление товара в корзину;

#### События взаимодействия с интерфейсом

_Создаются классами отображения._

- `modal:close` - закрытие модального окна;
- `basket:open` - открытие корзины;
- `basket:removeItem` - удаление товара из корзины;
- `basket:submit` - нажатие кнопки «оформить» в корзине;
- `item:open` - нажатие на карточку;
- `item:select` - нажатие на кнопку «в корзину» в модальном окне карточки;
- `payment-method: changed` - выбор метода оплаты;
- `address: changed` - изменение данных в поле с адресом;
- `modal-address:submit` - нажатие на кнопку «далее» в модальном окне с адресом доставки;
- `email:changed` - изменение данных в поле с почтой;
- `phone-number:changed` - изменение данных в поле с номером телефона;
- `modal-contacts:submit` - нажатие на кнопку «далее» в модальном окне с почтой и телефоном;

### Пример взаимодействия

_Взаимодействия классов на примере добавления товара в корзину:_

1. Слой отображения. В классе ModalWithItem навешивается слушатель события клика по кнопке «Добавить в корзину».
2. Слой презентера. Клик вызывает обработчик события «item:selected» из слоя презентера. В обработчике события вызывается метод модели Basket.addItem(cardId).
3. Слой данных. Модель записывает новые данные, после чего происходит событие «basket:changed».
4. Слой презентера. В обработчике «basket:changed» вызывается функция слоя отображения ModalWithBasket.render(items).
5. Слой отображения. Метод render() отобразит карточки из массива Basket.items.
