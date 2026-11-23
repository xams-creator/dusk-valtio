# Dusk Valtio

React frontend framework based on [valtio](https://github.com/pmndrs/valtio)

## Features

- Typescript supports
- Lifecycle
- Plugin
- Simplified model

## Installation

```
npm i lodash

npm i @xams-framework/dusk-valtio
```

## Usage

### Basic

```tsx
import { createValtioModel } from '@xams-framework/dusk-valtio';

interface CounterState {
    count: number;
}

function fetchUser(id: number) {
    return Promise.resolve({ id, name: 'xams-creator' });
}

const vm = createValtioModel({
    namespace: 'vitest',
    initialState: {
        count: 0,
    } as CounterState,
    actions: {
        add() {
            return this.state.count++;
        },
        set(count: number) {
            this.state.count = count;
        },
        async request(id: number) {
            console.log('execute...')
            return await fetchUser(id);
        },
    },
});

// result: 1
vm.actions.add();

// result: 2
vm.add();

// effect method
await vm.actions.request(1);

// set count...
vm.set(998)

// it's ok
vm.state.count = 123;

// reset state
vm.$reset();

conosle.log(vm.state.count === 0)   // true
```

### Plugins

```tsx
import { use } from '@xams-framework/dusk-valtio';

// global use...
use({
    name: 'test1',
    async apply(ctx, next) {
        console.log('[test1] begin....')
        await next();
        console.log('[test1] end....')
    }
})
use({
    name: 'test2',
    async apply(ctx, next) {
        console.log('[test2] begin....')
        await next();
        console.log('[test2] end....')
    }
})

/**
 *  省略创建模型代码...
 *
 *  const vm = createValtioModel({
 *      ...
 })
 * ***/

await vm.requet()
/*
*   [test1] begin...
*       [test2] begin...
*           execute...
*       [test2] end...
*   [test1] end...
* */
```

### Lifecycle

```tsx
const vm = createValtioModel({
    namespace: 'vitest',
    initialState: {
        count: 0,
    } as CounterState,
    onInitialization() {
        console.log(this.state);    // {count: 0}
    },
    onStateChange(oldState, newState) {
        console.log(oldState, newState)
    },
});
```
