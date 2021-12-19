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

const { data. error } = await serialExample( 1000 );
```

```ts
const options = {
 sortBy: {
  key: keyof functionInput,
  dir: 'asc' | 'desc',
 }, // an optional key which can be used to sort the queue when a new item is added. Will only work when the input type is an object.
 delay: number, // delay the initial execution of starting the queue, in case you have a large number of items being added to the queue and wish to ensure that sorting has happened before starting to execute
}
```

## Bugs, Feedback & Contributions

I'd be glad to hear from you! So please provide any through issues, discussions or as a pull request above 😃
