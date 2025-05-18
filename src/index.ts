import {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';

type BindType =
		| 'text'
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
		| null;

type Updater<T> = T | ((v: T) => T);

interface Model<T = InputValue> {
	/**
	 * The props to bind the model with a form element.
	 * Supports multiple calls and synchronizes the values of multiple elements. (except for file input)
	 */
	bind: BindProps;

	// The current value of the model.
	val: T;

	// Set by current value of the model.
	set(val: Updater<T>): void;

	// The latest value of the model.
	latest: T;

	// Set by latest value of the model.
	setLatest(val: Updater<T>): void;

	// The only ref to the bound element or the first element in the refs array.
	ref: BindableElement | null;
	// An array of refs to the bound elements.
	refs: BindableElement[];

	// Resets the model to its initial value.
	reset(): void;

	// Returns the string representation of the model.
	toString(): string;
}


interface BindProps {
	ref: (el: BindableElement | null) => void;
	onChange: BindableChangeHandler;
	value?: InputValue;
	checked?: boolean;
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

/**
 * useModel is a custom React Hook for bidirectional form binding.
 *
 * Supported types:
 * - `text`: Applies to all text-like inputs (text, email, password, url, tel, search, hidden, color, date, time,
 * datetime-local, week, month, textarea).
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
		type: BindType = 'text',
): Model<T> {
	const [value, setValue] = useState<T>(initialValue);
	const [fileValue, setFileValue] = useState<string>('');
	const latestValue = useRef<T>(initialValue);
	const domSet = useRef(new Set<BindableElement>());

	const updateRef = useCallback((el: BindableElement | null) => {
		// wait for the next tick to ensure the DOM is updated
		setTimeout(() => {
			const set = domSet.current;
			if (el === null) {
				for (const item of set) {
					if (!document.contains(item as Node)) {
						set.delete(item);
					}
				}
			} else {
				if (type === 'file' && model.ref) {
					throw new Error('File model can only be bound once.');
				}
				set.add(el);
			}
		});
	}, []);

	// Sync DOM value to state. (e.g., color inputs might have a default value)
	useEffect(() => {
		if (type === 'text' || type === 'range') {
			if (model.ref) {
				setValue(model.ref.value as T);
			}
		}
	}, []);

	//  state sync for radio and checkbox inputs
	useEffect(() => {
		if (type === 'radio') {
			for (const dom of model.refs as HTMLInputElement[]) {
				dom.checked = dom.value === value;
			}
		} else if (type === 'checkbox') {
			if (typeof initialValue === 'boolean') {
				for (const dom of model.refs as HTMLInputElement[]) {
					dom.checked = value as boolean;
				}
			} else if (Array.isArray(initialValue)) {
				for (const dom of model.refs as HTMLInputElement[]) {
					dom.checked = (value as string[]).includes(dom.value);
				}
			}
		}

	}, [value]);


	const model = new class {
		bind = getBind();

		get val() {
			return value;
		}

		set val(newVal: T) {
			model.set(newVal);
		}

		get latest() {
			return latestValue.current;
		}

		set latest(newVal: T) {
			model.setLatest(newVal);
		}

		set(newValue: Updater<T>) {
			if (type === 'file') {
				throw new Error('File input cannot be set directly. Use the file input element to select files.');
			}
			const fn = typeof newValue === 'function' ?
					newValue as (v: T) => T :
					() => newValue;
			const next = fn(latestValue.current);
			setValue(next);
			latestValue.current = next;
		}

		setLatest(newVal: Updater<T>) {
			if (type === 'file') {
				throw new Error('File input cannot be set directly. Use the file input element to select files.');
			}
			const fn = typeof newVal === 'function' ?
					newVal as (v: T) => T :
					() => newVal;
			const next = fn(latestValue.current);
			setValue(next);
			latestValue.current = next;
		}

		get ref() {
			return model.refs[0] || null;
		}

		get refs() {
			return Array.from(domSet.current);
		}

		reset() {
			if (type === 'file') { // reset file input
				setFileValue('');
			}
			setValue(initialValue);
		}

		toString() {
			if (Array.isArray(value) || typeof value === 'object') {
				return JSON.stringify(value, (_, v) => replaceFile(v));
			}
			return String(replaceFile(value));

			function replaceFile(v: InputValue) {
				if (v instanceof File) {
					return `File{name: ${v.name}}`;
				} else {
					return v;
				}
			}
		}
	};

	function getBind(): BindProps {
		switch (type) {
			case 'text':
				return handleText();
			case 'number':
			case 'range':
				return handleNumeric();
			case 'select':
				return handleSelect();
			case 'file':
				return handleFile();
			case 'radio':
				return handleRadio();
			case 'checkbox':
				return handleCheckbox();
			default:
				throw new Error(`Unsupported bind type: ${type}`);
		}
	}

	function handleText(): BindProps {
		if (typeof initialValue !== 'string') {
			throw new Error('Initial value for type "default" must be a string.');
		}

		return {
			ref: updateRef,
			value,
			onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				setValue(e.target.value as T);
			},
		};
	}

	function handleNumeric(): BindProps {
		if (typeof initialValue !== 'number' && initialValue !== '') {
			throw new Error('Initial value for number/range must be a number or empty string.');
		}

		return {
			ref: updateRef,
			value,
			onChange: (e: ChangeEvent<HTMLInputElement>) => {
				setValue(Number(e.target.value) as T);
			},
		};

	}

	function handleSelect(): BindProps {
		if (typeof initialValue === 'string') {
			return {
				ref: updateRef,
				value,
				onChange: (e: ChangeEvent<HTMLSelectElement>) => {
					setValue(e.target.value as T);
				},
			};
		}

		if (Array.isArray(initialValue)) {
			return {
				ref: updateRef,
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

	function handleFile(): BindProps {
		if (initialValue !== null && !(Array.isArray(initialValue) && initialValue.length === 0)) {
			throw new Error('Initial value for file must be null or empty array.');
		}
		return {
			ref: updateRef,
			value: fileValue,
			onChange: (e: ChangeEvent<HTMLInputElement>) => {
				setFileValue(e.target.value);
				const files = Array.from(e.target.files || []);
				setValue((Array.isArray(initialValue) ? files : files[0] || null) as T);
			},
		};
	}

	function handleRadio(): BindProps {
		if (typeof initialValue !== 'string') {
			throw new Error('Initial value for radio must be a string.');
		}

		return {
			ref: updateRef,
			onChange: (e: ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value as T);
			},
		};
	}

	function handleCheckbox(): BindProps {
		if (typeof initialValue === 'boolean') {

			return {
				ref: updateRef,
				checked: value as boolean,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					setValue(e.target.checked as T);
				},
			};
		}

		if (Array.isArray(initialValue)) {

			return {
				ref: updateRef,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					if (e.target.checked) {
						setValue([...value as string[], e.target.value] as T);
					} else {
						setValue((value as string[]).filter((v) => v !== e.target.value) as T);
					}
				},
			};
		}

		throw new Error('Checkbox initial value must be boolean or string array.');
	}

	return model;
}

