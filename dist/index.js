import { useState, useEffect, useRef } from 'react';

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
function useModel(initialValue = '', type = 'default') {
    const [value, setValue] = useState(initialValue);
    const [fileValue, setFileValue] = useState('');
    const [checkboxValue, setCheckboxValue] = useState('on');
    const refs = [];
    // Sync DOM value to state. (e.g., color inputs might have a default value)
    useEffect(() => {
        if (type === 'default' || type === 'range') {
            if (refs[0]?.current) {
                setValue(refs[0].current.value);
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
        set val(newVal) {
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
        set(newValue) {
            if (type === 'file') {
                throw new Error('File input cannot be set directly. Use the file input element to select files.');
            }
            setValue(newValue);
        },
        reset() {
            if (type === 'file') {
                setFileValue('');
                setValue(initialValue);
            }
            else {
                setValue(initialValue);
            }
        },
        toString() {
            if (Array.isArray(value)) {
                return JSON.stringify(value, (_, v) => v instanceof File ? fileToString(v) : v);
            }
            if (value instanceof File) {
                return fileToString(value);
            }
            return String(value);
            function fileToString(file) {
                return `File{name: ${file.name}}`;
            }
        },
        /**
         * Binds the model to an input element.
         *
         * @param optionValue Optional value to associate with radio/checkbox items.
         * @returns Binding props for a form element.
         */
        bind(optionValue = null) {
            if (type === 'default') {
                if (typeof initialValue !== 'string') {
                    throw new Error('Initial value for type "default" must be a string.');
                }
                const domRef = useRef(null);
                refs.push(domRef);
                return {
                    ref: domRef,
                    value,
                    onChange: (e) => {
                        setValue(e.target.value);
                    },
                };
            }
            if (type === 'number' || type === 'range') {
                if (typeof initialValue !== 'number' && initialValue !== '') {
                    throw new Error('Initial value for number/range must be a number or empty string.');
                }
                const domRef = useRef(null);
                refs.push(domRef);
                return {
                    ref: domRef,
                    value,
                    onChange: (e) => {
                        setValue(Number(e.target.value));
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
                const domRef = useRef(null);
                refs.push(domRef);
                return {
                    ref: domRef,
                    value: optionValue,
                    checked: value === optionValue,
                    onChange: (e) => {
                        setValue(e.target.value);
                    },
                };
            }
            if (type === 'checkbox') {
                if (typeof initialValue === 'boolean') {
                    if (optionValue !== null) {
                        throw new Error('Single checkbox does not require optionValue.');
                    }
                    const domRef = useRef(null);
                    refs.push(domRef);
                    return {
                        ref: domRef,
                        value: checkboxValue,
                        checked: value,
                        onChange: (e) => {
                            setValue(e.target.checked);
                        },
                    };
                }
                if (Array.isArray(initialValue)) {
                    if (optionValue === null) {
                        throw new Error('Checkbox group requires optionValue.');
                    }
                    const domRef = useRef(null);
                    refs.push(domRef);
                    return {
                        ref: domRef,
                        value: optionValue,
                        checked: value.includes(optionValue),
                        onChange: (e) => {
                            if (e.target.checked) {
                                setValue([...value, optionValue]);
                            }
                            else {
                                setValue(value.filter(v => v !== optionValue));
                            }
                        },
                    };
                }
                throw new Error('Checkbox initial value must be boolean or string array.');
            }
            if (type === 'select') {
                const domRef = useRef(null);
                refs.push(domRef);
                if (typeof initialValue === 'string') {
                    return {
                        ref: domRef,
                        value,
                        onChange: (e) => {
                            setValue(e.target.value);
                        },
                    };
                }
                if (Array.isArray(initialValue)) {
                    return {
                        ref: domRef,
                        value,
                        onChange: (e) => {
                            const selectedOptions = [...e.target.selectedOptions].map((option) => option.value);
                            setValue(selectedOptions);
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
                const domRef = useRef(null);
                refs.push(domRef);
                return {
                    ref: domRef,
                    value: fileValue,
                    onChange: (e) => {
                        setFileValue(e.target.value);
                        const files = Array.from(e.target.files || []);
                        setValue((Array.isArray(initialValue) ? files : files[0] || null));
                    },
                };
            }
            throw new Error(`Unsupported bind type: ${type}`);
        },
    };
    return model;
}

export { useModel };
//# sourceMappingURL=index.js.map
