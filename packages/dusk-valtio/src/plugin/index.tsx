import { DuskValtio, DvPlugin } from '@/types';

export const plugins: DvPlugin[] = [];
export const applyFunctions: DuskValtio.ApplyFunction<any>[] = [];
export const asyncApplyFunctions: DuskValtio.AsyncApplyFunction<any>[] = [];

export function definePlugin(plugin: DvPlugin) {
    return plugin;
}

export function getInterceptorApplyFunctions(
    plugin: DvPlugin
): [DuskValtio.ApplyFunction<any>[],  DuskValtio.AsyncApplyFunction<any>[]] {
    const syncApply = plugin.interceptor?.sync?.apply;
    const asyncApply = plugin.interceptor?.async?.apply;
    return [
        syncApply ? [syncApply] : [],
        asyncApply ? [asyncApply] : [],
    ];
}

export function use(plugin: DvPlugin) {
    plugins.push(plugin);
    const [applyFunctionList, asyncApplyFunctionList] = getInterceptorApplyFunctions(plugin);
    applyFunctions.push(...applyFunctionList);
    asyncApplyFunctions.push(...asyncApplyFunctionList);
}
