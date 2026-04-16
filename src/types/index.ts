import { Snapshot } from 'valtio';

export interface ValtioModel<S, A> extends ValtioModelLifecycle<S, A> {
    readonly namespace: string;
    state: S;
    actions: A;

    $reset: () => void;
}

export type InitialStateProvider<S> = (namespace: string) => S;

export interface ValtioModelLifecycle<S, A> {
    onInitialization?: (this: A & Pick<ValtioModel<S, A>, 'state' | 'namespace' | 'actions'>) => void;
    onFinalize?: (state: Readonly<S>, model: ValtioModel<S, A>) => void;
    onStateChange?: (
        this: A & Pick<ValtioModel<S, A>, 'state' | 'namespace' | 'actions'>,
        oldState: Snapshot<S>,
        newState: Snapshot<S>,
    ) => void;
}

export interface CreateValtioModelMiddlewareOptions {
    sync?: DuskValtio.Middleware[];
    async?: DuskValtio.AsyncMiddleware[];
}

export interface CreateValtioModelOptions<S, A> extends ValtioModelLifecycle<S, A> {
    namespace: string;
    initialState: S | InitialStateProvider<S>;
    actions?: A & ThisType<ValtioModel<S, A> & A>;
    middleware?: CreateValtioModelMiddlewareOptions;
}

export declare namespace DuskValtio {
    interface BaseMiddleware {
        name: string;
        order?: number;
        enable?: boolean;
        apply: Function;
    }

    export interface Middleware extends BaseMiddleware {
        apply: DuskValtio.ApplyFunction<any>;
    }

    type ApplyFunction<T> = (ctx: T, next: DuskValtio.Next) => any;
    type Next = () => any;

    export interface AsyncMiddleware extends BaseMiddleware {
        apply: DuskValtio.AsyncApplyFunction<any>;
    }

    type AsyncApplyFunction<T> = (ctx: T, next: DuskValtio.AsyncNext) => Promise<any>;
    type AsyncNext = () => Promise<any>;
}
