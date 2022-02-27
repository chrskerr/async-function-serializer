# Async Function Serializer

[![Version][version-badge]][package]
[![Bundle size][bundlephobia-badge]][bundlephobia]
[![Downloads][downloads-badge]][npmtrends]

[![GPL 3.0 Licence][license-badge]][license]
[![Test status][test-status-badge]][test-status]

## Why

Initially, I needed to queue some fetch calls in another project, and since I was unaware of the Async package, I wrote something fast & dirty myself.

I then needed more functionality, and testing, and etc, so I split it out into a little package to see if I could make something which scratched my own itch.

Any time I think of something else I might need, or am just interested to see if I am capable of building, then I add it to this repo.

### Features

- Basic synchronous and asynchronous queue
- Optional execution concurrency
- Input transformer, allowing most recent results to influence the execution of the next step
- Returns execution results or error
- Batching on addition to queue
- Sorting immediately before drawing from queue
- Initial execution delaying

### Background

[https://www.chriskerr.com.au/serialising-async-functions](https://www.chriskerr.com.au/serialising-async-functions)

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

const { data, error } = await serialExample( 1000, inputOptions? );
```

## Serializer options

```ts
type SerializeOptions<Input, Return> = {
 /**
  * Maximum number of simultaneous executions
  * @defaultValue 1
  */
 concurrency?: number;

 /**
  * How long to delay before starting initial execution
  * @defaultValue 0
  */
 delay?: number;

 /**
  * Used to sort the queue at the beginning of each execution cycle
  * @defaultValue undefined
  */
 sortBy?: {
  /**
   * Key of input to sort. Will only populate if input is of type object, and only supports top-level keys.
   */
  key: keyof Input;
  /**
   * Sort direction.
   * @defaultValue 'asc'
   */
  direction?: 'asc' | 'desc';
 };

 /**
  * Batch input when adding them to the queue.
  * @defaultValue undefined
  */
 batch?: {
  /**
   * How to long wait before adding the batch to the queue
   */
  debounceInterval: number;

  /**
   * Maximum duration before a batch will close
   */
  maxDebounceInterval?: number;

  /**
   * Function to combine the new queue item into the current batch
   * @param existingBatch - the current batch
   * @param newInput - the new item being added into the batch
   */
  batchTransformer: (
   existingBatch: Input | undefined,
   newInput: Input,
  ) => Input;
 };

 /**
  * Function to transform the input at the beginning of each execution cycle
  * @param input - the current value being transformed
  * @param previousResult - the results from the previous execution, if any
  */
 inputTransformer?: (
  input: Input,
  previousResult: Awaited<Return> | undefined,
 ) => Input | Promise<Input>;
};
```

## Input options

```ts
type InputOptions = {
 /**
  * This will force-start a new batch. If another batch is in-progress, it will be immediately added to queue.
  * */
 startNewBatch?: boolean;
};
```

## Bugs, Feedback & Contributions

I'd be glad to hear from you! So please provide any through issues, discussions or as a pull request above 😃

[bundlephobia]: https://bundlephobia.com/package/async-function-serializer
[bundlephobia-badge]: https://img.shields.io/bundlephobia/minzip/async-function-serializer?style=flat-square

[test-status]: https://github.com/chrskerr/async-function-serializer/actions/workflows/tests.yml
[test-status-badge]: https://img.shields.io/github/workflow/status/chrskerr/async-function-serializer/Jest?style=flat-square&label=tests

[license]: LICENSE
[license-badge]: https://img.shields.io/npm/l/async-function-serializer.svg?style=flat-square&color=blue

[package]: https://npmjs.com/package/async-function-serializer
[version-badge]: https://img.shields.io/npm/v/async-function-serializer.svg?style=flat-square

[npmtrends]: https://www.npmtrends.com/async-function-serializer
[downloads-badge]: https://img.shields.io/npm/dm/async-function-serializer.svg?style=flat-square
