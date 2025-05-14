import { ChangeEvent, RefObject } from 'react';
type BindType = 'default' | 'number' | 'range' | 'radio' | 'checkbox' | 'select' | 'file';
type InputValue = number | boolean | string | string[] | File | File[] | null;
interface Model<T = InputValue> {
    val: T;
    set(val: T): void;
    reset(): void;
    toString(): string;
    /**
     * Binds the model to a form element.
     * Supports multiple calls and synchronizes the values of multiple elements. (except for file input)
     * @param optionValue Optional value to associate with multiple checkboxes or radio buttons.
     */
    bind(optionValue?: string): BindProps;
    ref: BindableElement | null;
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
export declare function useModel<T extends InputValue>(initialValue?: T, type?: BindType): Model<T>;
export {};
