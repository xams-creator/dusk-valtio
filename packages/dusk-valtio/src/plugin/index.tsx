import { DuskValtio, DvPlugin } from '@/types';

export const plugins: DvPlugin[] = [];
export const applyFunctions: DuskValtio.ApplyFunction<any>[] = [];
export const asyncApplyFunctions: DuskValtio.AsyncApplyFunction<any>[] = [];

export function getApplyFunctions(isAsync: boolean) {
    return isAsync ? asyncApplyFunctions : applyFunctions;
}

export function definePlugin(plugin: DvPlugin) {
    return plugin;
}

export function getInterceptorApplyFunctions(plugin: DvPlugin) {
    if (plugin.interceptor) {
        const applyFunctions: DuskValtio.ApplyFunction<any>[] = [];
        const asyncApplyFunctions: DuskValtio.AsyncApplyFunction<any>[] = [];
        if (plugin.interceptor?.sync?.apply) {
            applyFunctions.push(plugin.interceptor?.sync?.apply);
        }
        if (plugin.interceptor?.async?.apply) {
            asyncApplyFunctions.push(plugin.interceptor?.async.apply);
        }
        return [applyFunctions, asyncApplyFunctions];
    }
    return [[], []];
}

export function use(plugin: DvPlugin) {
    plugins.push(plugin);
    const [applyFunctionList, asyncApplyFunctionList] = getInterceptorApplyFunctions(plugin);
    applyFunctions.push(...applyFunctionList);
    asyncApplyFunctions.push(...asyncApplyFunctionList);
}
