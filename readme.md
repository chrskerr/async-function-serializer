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

[Background](https://www.chriskerr.com.au/serialising-async-functions)

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
type SerializeOptions<Input, Return> = {
 /**
  * How long to delay before starting initial execution
  * @defaultValue 0
  */
 delay?: number,

 /**
  * Used to sort the queue at the beginning of each execution cycle
  * @defaultValue undefined
  */
 sortBy?: {
  /**
   * Key of input to sort. Will only populate if input is of type object, and only supports top-level keys.
   */
  key: keyof Input,
  /**
   * Sort direction.
   * @defaultValue 'asc'
   */
  direction?: "asc" | "desc",
 },

 /**
  * Batch input when adding them to the queue.
  * @defaultValue undefined
  */
 batch?: {
  /**
   * How to long wait before adding the batch to the queue
   */
  debounceInterval: number,

  /**
   * Function to combine the new queue item into the current batch
   * @param existingBatch - the current batch
   * @param newInput - the new item being added into the batch
   */
  batchTransformer: ( existingBatch: Input | undefined,  newInput: Input ) => Input,
 }

 /**
  * Function to transform the input at the beginning of each execution cycle
  * @param input - the current value being transformed
  * @param previousResult - the results from the previous execution, if any
  */
 inputTransformer?: ( input: Input, previousResult: Awaited<Return> | undefined ) => Input | Promise<Input>,
}
```

## Bugs, Feedback & Contributions

I'd be glad to hear from you! So please provide any through issues, discussions or as a pull request above 😃
