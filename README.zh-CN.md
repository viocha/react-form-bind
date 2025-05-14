# react-form-bind

> 🧩 一个轻量、类型安全、功能强大的 React 双向数据绑定 Hook，支持多种表单元素。

## ✨ 特性

* 支持各种类型的表单控件：`text`、`number`、`checkbox`、`radio`、`select`、`file` 等
* 多元素绑定同步（除文件输入）
* 初始值重置，序列化输出，获取 DOM 引用
* 根据初始值类型决定状态的类型和行为方式
* 全 TypeScript 支持，类型推导完善
* 同时支持多种构建格式：

  * 浏览器 `global` 版本和 `ESM` 模块
  * Node.js 的 `CJS` 和 `MJS` 模块

使用示例演示：https://github.io/viocha/react-form-bind

## 📦 安装

```bash
npm install react-form-bind
# 或者使用 yarn / pnpm
```

浏览器环境：

```html
<script src="https://unpkg.com/react-form-bind/dist/global/index.js"></script>
<script>
  const { useModel } = ReactFormBind;
</script>
```

## 🚀 快速开始

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
      <input placeholder="姓名" {...name.bind()} />
      <input type="number" placeholder="年龄" {...age.bind()} />

      <label>
        <input type="radio" {...gender.bind('male')} />
        男
      </label>
      <label>
        <input type="radio" {...gender.bind('female')} />
        女
      </label>

      <label>
        <input type="checkbox" {...hobbies.bind('reading')} />
        阅读
      </label>
      <label>
        <input type="checkbox" {...hobbies.bind('sports')} />
        运动
      </label>

      <input type="file" {...avatar.bind()} />

      <button type="button" onClick={() => console.log(name.val, age.val, gender.val, hobbies.val, avatar.val)}>
        提交
      </button>
    </form>
  );
}
```

## 📘 API

### `useModel<T>(initialValue, type): Model<T>`

一个用于表单元素双向绑定的 React Hook。

#### 参数

| 参数名            | 类型                                                                                | 说明            |
| -------------- | --------------------------------------------------------------------------------- | ------------- |
| `initialValue` | `T`                                                                               | 初始值，类型取决于控件类型 |
| `type`         | `'default' \| 'number' \| 'range' \| 'radio' \| 'checkbox' \| 'select' \| 'file'` | 控件类型          |

#### 返回值 `Model<T>`

| 属性 / 方法      | 类型                                                          | 说明                             | 
| ------------ |-------------------------------------------------------------| ------------------------------ | 
| `val`        | `T`                                                         | 当前的值（getter/setter）            |              
| `set(val)`   | `(val: T) => void`                                          | 手动设置值                          |               
| `reset()`    | `() => void`                                                | 重置为初始值                         |               
| `toString()` | `() => string`                                              | 返回序列化后的字符串表示                   |               
| `bind()`     | `(optionValue?: string) => BindProps`                       | 返回用于 `input`/`select` 等元素的绑定属性 |               
| `ref`        | `HTMLElement                          \| null`              | 第一个绑定的 DOM 引用 |
| `refs`       | `(HTMLElement                                   \| null)[]` | 所有绑定元素的引用数组   |

### `bind(optionValue?)`

用于绑定到表单元素上，返回标准的 `ref`、`value`、`checked`、`onChange`。

当绑定多个 `radio` 或 `checkbox` 时，需要传入 `optionValue` 作为当前选项的值，此时会自动设置DOM的value属性。

```tsx
<input {...model.bind()} />
<input type="checkbox" {...model.bind('value')} />
```

## ⌨️ 支持的类型与用法

| 类型         | 控件                            | 初始值示例                          | 说明                             |
| ---------- | ----------------------------- |--------------------------------|--------------------------------|
| `default`  | `input[type=text]`、`textarea` | `'abc'`或`''` 或省略               | 文本类输入，默认类型。这种情况可以不指定类型，初始值也能省略 |
| `number`   | `input[type=number]`          | `5` 或 `''`                     | 数字输入，空值表示为输入状态                 |
| `range`    | `input[type=range]`           | `5` 或 `''`                     | 滑动条，和数字输入类似                    |
| `radio`    | `input[type=radio]`           | `'option1'`                    | 单选按钮组                          |
| `checkbox` | `input[type=checkbox]`        | `true` / `false` 或 `['a','b']` | 支持绑定为单个布尔值 或 字符串数组             |
| `select`   | `select`                      | `'a'` 或 `['a', 'b']`           | 单选 / 多选下拉框                     |
| `file`     | `input[type=file]`            | `null` 或 `[]`                  | 文件上传，**仅支持从 DOM 到状态的同步**       |

## 📂 多元素同步

对于非 `file` 类型的绑定，可以在多个组件中调用 `bind()`，值会自动同步：

```tsx
<input {...model.bind()} />
<input {...model.bind()} /> <!-- 与上方同步 -->
```

## 📄 License

MIT License
