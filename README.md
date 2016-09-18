# One-based array

An array with indexes starting at one.

Warning: this is only an experiment created to prove that it's possible to create a one-based array in JavaScript. It is *not* meant to be used in production environment.

## Instalation

```
$ npm i one-based-array
```

## Examples

### Basic usage

```js
import OneBasedArray from 'one-based-array'

const arr = new OneBasedArray('a', 'b', 'c')
console.log(arr[1]) // 'a'
console.log(arr[0]) // undefined
arr[4] = 'd'
console.log(arr[4]) // 'd'
```
### Iteration

```js
const arr = new OneBasedArray('a', 'b', 'c')

for (let i = 1, len = arr.length; i <= len; i++) {
  console.log(i, arr[i]) // logs 1 'a', 2 'b', 3 'c'
}
for (const [i, element] of arr.entries()) {
  console.log(i, element) // logs 1 'a', 2 'b', 3 'c'
}
for (const i of arr.keys()) {
  console.log(i) // logs 1, 2, 3
}
for (const element of arr) {
  console.log(element) // logs 'a', 'b', 'c'
}
arr.forEach((element, i) => console.log(element, i)) // logs 'a' 1, 'b' 2, 'c' 3
```

### Array methods

```js
const arr = new OneBasedArray('a', 'b', 'c')

console.log(arr.indexOf('b')) // 2
console.log(arr.indexOf('d')) // -1
console.log(arr.slice(1, 3)) // equals new OneBasedArray('a', 'b')
```

## License

[MIT](LICENSE.md)
