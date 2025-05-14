# react-form-bind

- [中文版本](./README.zh-CN.md)

> 🧩 A lightweight, type-safe, and powerful React hook for two-way data binding, supporting various form elements.

## ✨ Features

* Supports various types of form controls: `text`, `number`, `checkbox`, `radio`, `select`, `file`, etc.
* Multi-element binding synchronization (excluding file inputs)
* Reset to initial value, serialize value, and access DOM references
* Infers state type and behavior based on the initial value
* Full TypeScript support with comprehensive type inference
* Supports multiple build formats:

  * Browser `global` version and `ESM` module
  * Node.js `CJS` and `MJS` modules

Live demo: [https://viocha.github.io/react-form-bind/](https://viocha.github.io/react-form-bind/)

## 📦 Installation

```bash
npm install react-form-bind
# or use yarn / pnpm
```

For browser environments:

```html
<script src="https://unpkg.com/react-form-bind/dist/global/index.js"></script>
<script>
  const { useModel } = ReactFormBind;
</script>
```

## 🚀 Quick Start

```tsx
import { useModel } from 'react-form-bind';

function ExampleForm() {
  const name = useModel();
  const age = useModel(0, 'number');
  const gender = useModel('male', 'radio');
  const hobbies = useModel([], 'checkbox');
  const avatar = useModel(null, 'file');

  return (
    <form>
      <input placeholder="Name" {...name.bind()} />
      <input type="number" placeholder="Age" {...age.bind()} />

      <label>
        <input type="radio" {...gender.bind('male')} />
        Male
      </label>
      <label>
        <input type="radio" {...gender.bind('female')} />
        Female
      </label>

      <label>
        <input type="checkbox" {...hobbies.bind('reading')} />
        Reading
      </label>
      <label>
        <input type="checkbox" {...hobbies.bind('sports')} />
        Sports
      </label>

      <input type="file" {...avatar.bind()} />

      <button type="button" onClick={() => console.log(name.val, age.val, gender.val, hobbies.val, avatar.val)}>
        Submit
      </button>
    </form>
  );
}
```

## 📘 API

### `useModel<T>(initialValue, type): Model<T>`

A React hook for two-way binding with form elements.

#### Parameters

| Name           | Type                                                                              | Description                           |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| `initialValue` | `T`                                                                               | Initial value, varies by control type |
| `type`         | `'default' \| 'number' \| 'range' \| 'radio' \| 'checkbox' \| 'select' \| 'file'` | Form control type                     |

#### Return Value: `Model<T>`

| Property / Method | Type                                  | Description                                   |
| ----------------- | ------------------------------------- | --------------------------------------------- |
| `val`             | `T`                                   | Current value (getter/setter)                 |
| `set(val)`        | `(val: T) => void`                    | Manually set the value                        |
| `reset()`         | `() => void`                          | Reset to initial value                        |
| `toString()`      | `() => string`                        | Get serialized string value                   |
| `bind()`          | `(optionValue?: string) => BindProps` | Get binding props for `input`, `select`, etc. |
| `ref`             | `HTMLElement \| null`                 | First bound DOM reference                     |
| `refs`            | `(HTMLElement \| null)[]`             | All bound DOM references                      |

### `bind(optionValue?)`

Used to bind to form elements, returns standard `ref`, `value`, `checked`, and `onChange`.

When binding multiple `radio` or `checkbox` inputs, `optionValue` must be passed to indicate the value for that option. The `value` attribute will be automatically set on the DOM element.

```tsx
<input {...model.bind()} />
<input type="checkbox" {...model.bind('value')} />
```

## ⌨️ Supported Types and Usage

| Type       | Controls                                | Example Initial Value            | Description                                                   |
| ---------- |-----------------------------------------| -------------------------------- | ------------------------------------------------------------- |
| `default`  | Text-based inputs (`text`, `email`, `password`, `textarea`, etc.) | `'abc'`, `''`, or omitted        | Default for text input; type and initial value may be omitted |
| `number`   | `input[type=number]`                    | `5` or `''`                      | Number input; `''` represents "input" state                   |
| `range`    | `input[type=range]`                     | `5` or `''`                      | Slider input, behaves like number                             |
| `radio`    | `input[type=radio]`                     | `'option1'`                      | Radio group with string value                                 |
| `checkbox` | `input[type=checkbox]`                  | `true` / `false` or `['a', 'b']` | Can bind to a single boolean or an array of selected values   |
| `select`   | `select`                                | `'a'` or `['a', 'b']`            | Single or multiple select                                     |
| `file`     | `input[type=file]`                      | `null` or `[]`                   | File input, **only syncs from DOM to state**                  |

## 📂 Multi-element Synchronization

For non-`file` bindings, you can call `bind()` on multiple components — values will stay in sync:

```tsx
<input {...model.bind()} />
<input {...model.bind()} /> <!-- Synchronized with the one above -->
```

## 📄 License

MIT License
