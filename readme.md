# Async Function Serializer

![gzip size badge](https://img.badgesize.io/chrskerr/async-function-serializer/master/dist/index.js?compression=gzip)
![Jest](https://github.com/chrskerr/async-function-serializer/actions/workflows/tests.yml/badge.svg?event=push)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![NPM Version](https://img.shields.io/npm/v/async-function-serializer)](https://www.npmjs.com/package/async-function-serializer)

## Purpose

This package is a small, simple helper designed to convert a function from parallel to serial, ensuring that the next item in the queue does not run until the current has returned.

- Provides an ability to prevent function execution overlap due to differing execution time
- Returns the results of the execution, and an error object if thrown
- Includes a sortByKey option to keep your queue sorted when adding to the queue (only works when the input is type object)

## Usage

```bash
npm i async-function-serializer
yarn add async-function-serializer
```

```ts
import serializer from "async-function-serializer";

const exampleFunction = async ( wait: number ): Promise<number> => {
 return await new Promise( resolve => setTimeout(() => resolve( wait ), wait ));
};

const serialExample = serializer( exampleFunction, options? );

const { data, error } = await serialExample( 1000 );
```

```ts
type SerializeOptions<T, R> = {
 // Delay the initial execution of the queue 
 // Potentially useful to delay sorting until more than one item is in the queue
 delay?: number,

 // Can be used to sort the queue before the next item is drawn from it. 
 // Will only work when the input type is an object, and the key is a number or string
 sortBy?: {
  key: keyof T,
  direction?: "asc" | "desc", // default 'asc'
 },

 // Used to transform the input before calling the next function in the queue. useful if you need to carry-forward data from the result before
 inputTransformer?: ( input: T, previousResult: Awaited<PreviousResult> | undefined ) => T | Promise<T>,

// Allows inputs to be batched. Only the executed items will return a result
  batch?: {
  debounceInterval: number,
  batchTransformer: ( existingBatch: T | undefined,  newInput: T ) => T,
 }
}
```

## Bugs, Feedback & Contributions

I'd be glad to hear from you! So please provide any through issues, discussions or as a pull request above 😃
