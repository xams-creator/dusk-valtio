import { isAsyncFunction } from '@/common';
import { CreateValtioModelMiddlewareOptions, DuskValtio } from '@/types';

export const middlewareMap: CreateValtioModelMiddlewareOptions = {
    sync: [],
    async: [],
};

export function use(middleware: DuskValtio.AsyncMiddleware | DuskValtio.Middleware) {
    if (!middleware?.apply) {
        throw new Error(`Middleware must have an apply function`);
    }
    const isAsync = isAsyncFunction(middleware.apply);
    const array = isAsync ? middlewareMap.async : middlewareMap.sync;

    array?.push(middleware);
}
