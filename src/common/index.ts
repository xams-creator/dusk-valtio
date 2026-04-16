export function isAsyncFunction(fn: Function) {
    return fn.constructor.name === 'AsyncFunction';
}

export function noop(...args: any[]) {
}

export * from './proxy';

