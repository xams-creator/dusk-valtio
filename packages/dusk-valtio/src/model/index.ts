import { isEqual } from 'lodash';
import { proxy, snapshot, subscribe } from 'valtio';
import {
    CreateValtioModelInterceptorOptions,
    CreateValtioModelOptions, DuskValtio, DvPluginContext,
    ValtioModel,
} from '@/types';

import { _proxy, isAsyncFunction } from '@/common';
import { deepClone } from 'valtio/utils';
import { plugins as _plugins, getInterceptorApplyFunctions, applyFunctions, asyncApplyFunctions } from '@/plugin';

export function createValtioModel<S extends object, A extends object>(
    options: CreateValtioModelOptions<S, A>,
): ValtioModel<S, A> & A & S {
    const { namespace, actions = {}, initialState, onInitialization, onStateChange, plugins = [] } = options;
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
    const $state = proxy(state);
    const model: ValtioModel<S, A> = {
        $namespace: namespace,
        $state: $state,
        // $actions: actions as WithUnderscorePrefix<A>,    // todo 拼接 _add 已完成
        $actions: actions as A,
        $methods: {} as A,
        $reset() {
            const initialState = deepClone(_initialState);
            Object.keys(initialState).forEach(key => {
                model.$state[key] = initialState[key];
            });
        },
        $plugins: [..._plugins, ...plugins],
    };

    const ctx = new Proxy(model, {
        get(target, prop) {
            if (prop in model.$actions)
                return model.$actions[prop as keyof typeof model.$actions];
            if (prop in target)
                return target[prop as keyof typeof target];
            return model.$state[prop as keyof typeof model.$state];
        },
        has(target, prop) {
            return prop in target || prop in model.$actions || prop in model.$state;
        },
        set(target, prop, value) {
            if (prop in model.$state) {
                model.$state[prop] = value;
            } else {
                target[prop] = value;
            }
            return true;
        },
    }) as ValtioModel<S, A> & A & S;

    for (const name of Object.keys(state)) {
        _proxy(model, '$state', name);
    }

    const interceptorOptions: CreateValtioModelInterceptorOptions = {
        sync: [],
        async: [],
    };
    plugins?.forEach(plugin => {
        const [applyFunctions, asyncApplyFunctions] = getInterceptorApplyFunctions(plugin);
        interceptorOptions.sync?.push(...applyFunctions);
        interceptorOptions.async?.push(...asyncApplyFunctions);
    });

    for (const name of Object.keys(model.$actions)) {
        const fn = model.$actions[name];
        if (typeof fn === 'function') {
            model.$methods[name] = fn.bind(ctx);
            model.$actions[name] = createInterceptedAction(fn, ctx, interceptorOptions).bind(ctx);
            // model.$actions['_' + name] = fn.bind(ctx);
            _proxy(model, '$actions', name);
        }
    }

    model.$plugins.forEach(plugin => {
        plugin.setup?.(ctx, options);
    });

    createSubscribe(model);
    if (onStateChange) {
        model.onStateChange = onStateChange?.bind(ctx);
    }
    if (onInitialization) {
        model.onInitialization = onInitialization?.bind(ctx);
        onInitialization.call(ctx);
    }
    return ctx;
}


function createInterceptedAction<F extends Function>(
    fn: F,
    model: any,
    middleware: CreateValtioModelInterceptorOptions,
) {
    const isAsync = isAsyncFunction(fn);
    const { async = [], sync = [] } = middleware;
    if (isAsync) {
        return new Proxy(fn, {
            apply: createAsyncMiddlewarePipeline([...(asyncApplyFunctions || []), ...async], model),
        });
    } else {
        return new Proxy(fn, {
            apply: createSyncMiddlewarePipeline([...(applyFunctions || []), ...sync], model),
        });
    }
}

function createSubscribe<S extends object = any, A extends object = any>(model: ValtioModel<S, A>) {
    let oldState = snapshot(model.$state);
    subscribe(model.$state, () => {
        const newState = snapshot(model.$state);
        if (!isEqual(oldState, newState)) {
            (model as ValtioModel<S, any>).onStateChange?.(oldState, newState);
            oldState = newState;
        }
    });
}

/** 通用调度器：只负责 index 守卫 + 终点分发 */
function makeDispatcher(
    size: number,
    final: () => any,
    invoke: (i: number, next: () => any) => any,
): (i: number) => any {
    let index = -1;
    const dispatch = (i: number): any => {
        if (i <= index) throw new Error('next() called multiple times');
        index = i;
        return i === size ? final() : invoke(i, () => dispatch(i + 1));
    };
    return dispatch;
}

function createSyncMiddlewarePipeline(
    middlewares: DuskValtio.ApplyFunction<any>[],
    model: any,
) {
    return function (target: Function, thisArg: any, argArray: any[]): any {
        const ctx = createMiddlewareContext(model, argArray, { target, thisArg, argArray });
        const dispatch = makeDispatcher(
            middlewares.length,
            () => Reflect.apply(target, thisArg, argArray),
            (i, next) => middlewares[i](ctx, next),
        );
        return dispatch(0);
    };
}

function createAsyncMiddlewarePipeline(
    middlewares: DuskValtio.AsyncApplyFunction<any>[],
    model: any,
) {
    return async function (target: Function, thisArg: any, argArray: any[]): Promise<any> {
        const ctx = createMiddlewareContext(model, argArray, { target, thisArg, argArray });
        const dispatch = makeDispatcher(
            middlewares.length,
            () => Reflect.apply(target, thisArg, argArray),
            (i, next) => middlewares[i](ctx, async () => await next()),  // ← 异步 here
        );
        // dispatch 返回的可能是 Promise（中间件异步）或值（中间件同步但异步版语义）
        return await dispatch(0);
    };
}

function createMiddlewareContext(model, args, origin): DvPluginContext {
    return {
        model,
        params: args,
        origin,
    };
}

