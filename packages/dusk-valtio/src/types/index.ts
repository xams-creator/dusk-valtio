import { Snapshot } from 'valtio';

export interface ValtioModel<S, A> extends ValtioModelLifecycle<S, A> {
    readonly $namespace: string;
    $state: S;
    // $actions: WithUnderscorePrefix<A>;// todo 拼接 _add 已完成
    $actions: A;
    $methods: A;
    $reset: () => void;

    $plugins: DvPlugin<S, A>[];
}

export type WithUnderscorePrefix<T> = T & {
    [K in keyof T as `_${string & K}`]: T[K];
};


export type InitialStateProvider<S> = (namespace: string) => S;

export interface ValtioModelLifecycle<S, A> {
    onInitialization?: (this: A & S & Omit<ValtioModel<S, A>, | 'onInitialization' | 'onFinalize' | 'onStateChange'>) => void;
    onFinalize?: (state: Readonly<S>, model: ValtioModel<S, A>) => void;
    onStateChange?: (
        this: A & S & Omit<ValtioModel<S, A>, | 'onInitialization' | 'onFinalize' | 'onStateChange'>,
        oldState: Snapshot<S>,
        newState: Snapshot<S>,
    ) => void;
}

export interface CreateValtioModelInterceptorOptions {
    sync?: DuskValtio.ApplyFunction<ValtioModel<any, any>>[];
    async?: DuskValtio.AsyncApplyFunction<ValtioModel<any, any>>[];
}


export interface CreateValtioModelOptions<S, A> extends ValtioModelLifecycle<S, A> {
    namespace: string;
    initialState: S | InitialStateProvider<S>;
    actions?: A & ThisType<ValtioModel<S, A> & A & S>;
    plugins?: DvPlugin<S, A>[];
}

export declare namespace DuskValtio {

    type ApplyFunction<T> = (ctx: T, next: DuskValtio.Next) => any;
    type Next = () => any;

    type AsyncApplyFunction<T> = (ctx: T, next: DuskValtio.AsyncNext) => Promise<any>;
    type AsyncNext = () => Promise<any>;
}


export interface DuskValtioManager {
    version: string;
    plugins: DvPlugin[];
    use(plugin: DvPlugin): this;
}


export interface DvPlugin<S = any, A = any> {
    name: string;
    order?: number;
    enable?: boolean;

    setup?: (model: ValtioModel<S, A>, options: CreateValtioModelOptions<S, A>) => void;

    interceptor?: {
        sync?: {
            apply: DuskValtio.ApplyFunction<DvPluginContext>
        }
        async?: {
            apply: DuskValtio.AsyncApplyFunction<DvPluginContext>
        }
    };
}

export interface DvPluginContext {
    model: ValtioModel<any, any>;
    params: any[];
    origin: any;

    [key: string]: any
}
