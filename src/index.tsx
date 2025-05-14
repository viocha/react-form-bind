import {ChangeEvent, RefObject, useEffect, useRef, useState} from 'react';

type BindType =
		| 'default'
		| 'number'
		| 'range'
		| 'radio'
		| 'checkbox'
		| 'select'
		| 'file';

type InputValue =
		| number
		| boolean
		| string
		| string[]
		| File
		| File[]
		| null

interface Model<T = InputValue> {
	// The current value of the model.
	val: T;

	// Sets the value of the model.
	set(val: T): void;

	// Resets the model to its initial value.
	reset(): void;

	// Returns the string representation of the model.
	toString(): string;

	/**
	 * Binds the model to a form element.
	 * Supports multiple calls and synchronizes the values of multiple elements. (except for file input)
	 * @param optionValue Optional value to associate with multiple checkboxes or radio buttons.
	 */
	bind(optionValue?: string): BindProps;

	// The only ref to the bound element or the first element in the refs array.
	ref: BindableElement | null;
	// An array of refs to the bound elements.
	refs: (BindableElement | null)[];
}

/**
 * The props returned by the bind() method.
 * This is used to bind the model to a form element.
 * @example <input {...bind()} />
 */
interface BindProps {
	ref: RefObject<BindableElement | null>;
	value: InputValue;
	checked?: boolean;
	onChange: BindableChangeHandler;
}

type BindableElement = ElementMap[keyof ElementMap];

type BindableChangeHandler = {
	[K in keyof ElementMap]: (e: ChangeEvent<ElementMap[K]>) => void;
}[keyof ElementMap];

type ElementMap = {
	0: HTMLInputElement;
	1: HTMLTextAreaElement;
	2: HTMLSelectElement;
};

type InternalRef = RefObject<BindableElement | null>[];

/**
 * useModel is a custom React Hook for bidirectional form binding.
 *
 * Supported types:
 * - `default`: Applies to all text-like inputs (text, email, password, url, tel, search, hidden, color, date, time, datetime-local, week, month, textarea).
 *   - `initialValue`: optional or a string.
 *
 * - `number` / `range`: For numeric or range inputs.
 *   - `initialValue`: a number or an empty string ("") to indicate unentered state.
 *
 * - `radio`: Represents the selected value of a radio group.
 *   - `initialValue`: a string value.
 *
 * - `checkbox`: Either a boolean (for a single checkbox) or a string array (for multiple checkboxes).
 *
 * - `select`: A string (single select) or a string array (multi-select).
 *
 * - `file`: File input (one-way binding only, from DOM to model).
 *   - `initialValue`: must be `null` or an empty array.
 */
export function useModel<T extends InputValue>(
		initialValue: T = '' as T,
		type: BindType = 'default',
): Model<T> {
	const [value, setValue] = useState<T>(initialValue);
	const [fileValue, setFileValue] = useState<string>('');
	const [checkboxValue, setCheckboxValue] = useState<string>('on');
	const refs: InternalRef = [];

	// Sync DOM value to state. (e.g., color inputs might have a default value)
	useEffect(() => {
		if (	type === 'default' ||			type === 'range'	) {
			if (refs[0]?.current) {
				setValue(refs[0].current.value as T);
			}
		}
	}, []);

	// Sync single checkbox value with state.
	useEffect(() => {
		if (type === 'checkbox' && typeof initialValue === 'boolean') {
			setCheckboxValue(value ? 'on' : 'off');
		}
	}, [value]);


	const model = {
		get val() {
			return value;
		},
		set val(newVal: T) {
			model.set(newVal);
		},
		get ref() {
			if (refs.length === 0) {
				throw new Error('You must call bind() before accessing refs.');
			}
			return refs[0].current;
		},
		get refs() {
			if (refs.length === 0) {
				throw new Error('You must call bind() before accessing refs.');
			}
			return refs.map(r => r.current);
		},
		set(newValue: T) {
			if (type === 'file') {
				throw new Error('File input cannot be set directly. Use the file input element to select files.');
			}
			setValue(newValue);
		},
		reset() {
			if (type === 'file') {
				setFileValue('');
				setValue(initialValue as T);
			} else {
				setValue(initialValue);
			}
		},
		toString() {
			if (Array.isArray(value)) {
				return JSON.stringify(value, (_, v) =>
						v instanceof File ? fileToString(v) : v,
				);
			}
			if (value instanceof File) {
				return fileToString(value);
			}
			return String(value);

			function fileToString(file: File) {
				return `File{name: ${file.name}}`;
			}
		},
		/**
		 * Binds the model to an input element.
		 *
		 * @param optionValue Optional value to associate with radio/checkbox items.
		 * @returns Binding props for a form element.
		 */
		bind(optionValue: any = null): BindProps {
			if (type === 'default') {
				if (typeof initialValue !== 'string') {
					throw new Error('Initial value for type "default" must be a string.');
				}

				const domRef = useRef<BindableElement>(null);
				refs.push(domRef);

				return {
					ref: domRef,
					value,
					onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
						setValue(e.target.value as T);
					},
				};
			}

			if (type === 'number' || type === 'range') {
				if (typeof initialValue !== 'number' && initialValue !== '') {
					throw new Error('Initial value for number/range must be a number or empty string.');
				}

				const domRef = useRef<BindableElement>(null);
				refs.push(domRef);

				return {
					ref: domRef,
					value,
					onChange: (e: ChangeEvent<HTMLInputElement>) => {
						setValue(Number(e.target.value) as T);
					},
				};
			}

			if (type === 'radio') {
				if (optionValue === null) {
					throw new Error('Radio type requires optionValue.');
				}
				if (typeof initialValue !== 'string') {
					throw new Error('Initial value for radio must be a string.');
				}

				const domRef = useRef<BindableElement>(null);
				refs.push(domRef);

				return {
					ref: domRef,
					value: optionValue,
					checked: value === optionValue,
					onChange: (e: ChangeEvent<HTMLInputElement>) => {
						setValue(e.target.value as T);
					},
				};
			}

			if (type === 'checkbox') {
				if (typeof initialValue === 'boolean') {
					if (optionValue !== null) {
						throw new Error('Single checkbox does not require optionValue.');
					}
					const domRef = useRef<BindableElement>(null);
					refs.push(domRef);
					return {
						ref: domRef,
						value: checkboxValue,
						checked: value as boolean,
						onChange: (e: ChangeEvent<HTMLInputElement>) => {
							setValue(e.target.checked as T);
						},
					};
				}

				if (Array.isArray(initialValue)) {
					if (optionValue === null) {
						throw new Error('Checkbox group requires optionValue.');
					}

					const domRef = useRef<BindableElement>(null);
					refs.push(domRef);

					return {
						ref: domRef,
						value: optionValue,
						checked: (value as string[]).includes(optionValue),
						onChange: (e: ChangeEvent<HTMLInputElement>) => {
							if (e.target.checked) {
								setValue([...value as string[], optionValue] as T);
							} else {
								setValue((value as string[]).filter(v => v !== optionValue) as T);
							}
						},
					};
				}

				throw new Error('Checkbox initial value must be boolean or string array.');
			}

			if (type === 'select') {
				const domRef = useRef<BindableElement>(null);
				refs.push(domRef);

				if (typeof initialValue === 'string') {
					return {
						ref: domRef,
						value,
						onChange: (e: ChangeEvent<HTMLSelectElement>) => {
							setValue(e.target.value as T);
						},
					};
				}

				if (Array.isArray(initialValue)) {
					return {
						ref: domRef,
						value,
						onChange: (e: ChangeEvent<HTMLSelectElement>) => {
							const selectedOptions = [...e.target.selectedOptions].map(
									(option: HTMLOptionElement) => option.value,
							);
							setValue(selectedOptions as T);
						},
					};
				}

				throw new Error('Select initial value must be a string or array.');
			}

			if (type === 'file') {
				if (initialValue !== null && (!Array.isArray(initialValue) || initialValue.length !== 0)) {
					throw new Error('Initial value for file must be null or empty array.');
				}
				if (refs.length > 0) {
					throw new Error('File model can only be bound once.');
				}

				const domRef = useRef<BindableElement>(null);
				refs.push(domRef);

				return {
					ref: domRef,
					value: fileValue,
					onChange: (e: ChangeEvent<HTMLInputElement>) => {
						setFileValue(e.target.value);
						const files = Array.from(e.target.files || []);
						setValue((Array.isArray(initialValue) ? files : files[0] || null) as T);
					},
				};
			}

			throw new Error(`Unsupported bind type: ${type}`);
		},
	};

	return model;
}

