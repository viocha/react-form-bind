# react-form-bind


> 🧩 A lightweight, type-safe, and powerful React hook for two-way data binding, supporting various form elements.

## ✨ Features

* Supports various types of form controls: `text`, `number`, `checkbox`, `radio`, `select`, `file`, etc.
* Multi-element binding synchronization (excluding file inputs)
* Reset to initial value, serialize value, and access DOM references
* Infers state type and behavior based on the initial value
* Full TypeScript support with comprehensive type inference

Live Demo: [useModel](https://viocha.github.io/react-form-bind)

## 📦 Installation

```bash
npm install react-form-bind
# or use yarn / pnpm
```

For browser environments:

```html
<script src="https://unpkg.com/react-form-bind/dist/index.umd.js"></script>
<script>
  const { useModel } = reactFormBind;
</script>
```

## 🚀 Quick Start

```tsx
import {useModel} from 'react-form-bind';

function ExampleForm() {
	const name = useModel();
	const age = useModel(0, 'number');
	const gender = useModel('male', 'radio');
	const hobbies = useModel([], 'checkbox');
	const avatar = useModel(null, 'file');

	return (
			<form>
				<input placeholder="Name" {...name.bind} />
				<input type="number" placeholder="Age" {...age.bind} />

				<label>
					<input type="radio" value="male" {...gender.bind} />
					Male
				</label>
				<label>
					<input type="radio" value="female" {...gender.bind} />
					Female
				</label>

				<label>
					<input type="checkbox" value="reading" {...hobbies.bind} />
					Reading
				</label>
				<label>
					<input type="checkbox" value="sports" {...hobbies.bind} />
					Sports
				</label>

				<input type="file" {...avatar.bind} />

				<button type="button" onClick={() => console.log(name.val, age.val, gender.val, hobbies.val, avatar.val)}>
					Submit
				</button>
			</form>
	);
}
```

## 📄 License

MIT License
