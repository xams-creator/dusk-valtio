import { isAsyncFunction } from '@/common';
import { CreateValtioModelMiddlewareOptions, DuskValtio } from '@/types';

export const middlewareMap: CreateValtioModelMiddlewareOptions = {
    sync: [],
    async: [],
};

export function use<M extends DuskValtio.AsyncMiddleware | DuskValtio.Middleware>(middleware: M) {
    if (!middleware?.apply) {
        throw new Error(`Middleware must have an apply function`);
    }
    const isAsync = isAsyncFunction(middleware.apply);
    const array = isAsync ? middlewareMap.async : middlewareMap.sync;

    array?.push(middleware);
}
