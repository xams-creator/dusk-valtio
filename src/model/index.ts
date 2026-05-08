import { isEqual } from 'lodash';
import { proxy, snapshot, subscribe } from 'valtio';

import { middlewareMap } from '@/middleware';
import {
    CreateValtioModelMiddlewareOptions,
    CreateValtioModelOptions,
    ValtioModel,
} from '@/types';
import { scheduler } from '@/utiils';

import { _proxy, isAsyncFunction } from '@/common';
import { deepClone } from 'valtio/utils';

export function createValtioModel<S extends object, A extends object>(
    options: CreateValtioModelOptions<S, A>,
): ValtioModel<S, A> & A {
    const { namespace, actions = {}, initialState, onInitialization, onStateChange, middleware = {} } = options;
    if (!namespace) {
        throw new Error('`namespace` is a required option for model');
    }
    if (!initialState) {
        throw new Error(
            'You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`',
        );
    }
    const state = typeof initialState == 'function' ? initialState(namespace) : initialState;
    const _initialState = deepClone(state);
    const model: ValtioModel<S, A> = {
        namespace,
        state: proxy(state),
        actions: actions as A,
        $reset() {
            const initialState = deepClone(_initialState);
            Object.keys(initialState).forEach(key => {
                model.state[key] = initialState[key];
            });
        },
    };
    for (const name of Object.keys(model.actions)) {
        const fn = model.actions[name];
        if (typeof fn === 'function') {
            model.actions[name] = createInterceptedAction(fn, model, middleware).bind(model);
            _proxy(model, 'actions', name);
        }
    }
    if (onInitialization) {
        // @ts-ignore
        model.onInitialization = onInitialization?.bind(model);
    }
    if (onStateChange) {
        // @ts-ignore
        model.onStateChange = onStateChange?.bind(model);
    }
    createSubscribe(model);
    Object.freeze(model);
    if (onInitialization) {
        scheduler(model.onInitialization);
    }
    return model as ValtioModel<S, A> & A;
}

function createInterceptedAction<F extends Function>(
    fn: F,
    model: any,
    middleware: CreateValtioModelMiddlewareOptions,
) {
    const isAsync = isAsyncFunction(fn);
    const { async = [], sync = [] } = middleware;
    if (isAsync) {
        return new Proxy(fn, {
            apply: createAsyncMiddlewarePipeline([...(middlewareMap.async || []), ...async], model),
        });
    } else {
        return new Proxy(fn, {
            apply: createSyncMiddlewarePipeline([...(middlewareMap.sync || []), ...sync], model),
        });
    }
}

function createSubscribe<S extends object = any, A extends object = any>(model: ValtioModel<S, A>) {
    let oldState = snapshot(model.state);
    subscribe(model.state, () => {
        const newState = snapshot(model.state);
        if (!isEqual(oldState, newState)) {
            (model as ValtioModel<S, any>).onStateChange?.(oldState, newState);
            oldState = newState;
        }
    });
}

/**
 * 创建异步中间件管道
 */
function createAsyncMiddlewarePipeline(middlewares: Array<{ apply: Function }>, model) {
    return async function(target: Function, thisArg: any, argArray: any[]) {
        let index = -1;

        const ctx = createMiddlewareContext(null, model, argArray, {
            target,
            thisArg,
            argArray,
        });
        const next = async (i: number): Promise<any> => {
            if (i <= index) {
                throw new Error('next() called multiple times');
            }
            index = i;
            if (i === middlewares.length) {
                // 执行原始函数
                return Reflect.apply(target, thisArg, argArray);
            }
            const middleware = middlewares[i];
            return await middleware.apply(ctx, () => next(i + 1));
        };

        return next(0);
    };
}

function createMiddlewareContext(app, model, args, origin) {
    return {
        app: null,
        model,
        params: args,
        origin,
    };
}

/**
 * 创建同步中间件管道
 */
function createSyncMiddlewarePipeline(middlewares: Array<{ apply: Function }>, model) {
    return function(target: Function, thisArg: any, argArray: any[]) {
        let index = -1;
        const ctx = createMiddlewareContext(null, model, argArray, {
            target,
            thisArg,
            argArray,
        });
        const next = (i: number): any => {
            if (i <= index) {
                throw new Error('next() called multiple times');
            }
            index = i;

            if (i === middlewares.length) {
                // 执行原始函数
                return Reflect.apply(target, thisArg, argArray);
            }

            const middleware = middlewares[i];
            return middleware.apply(ctx, () => next(i + 1));
        };

        return next(0);
    };
}
