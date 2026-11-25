import { definePlugin } from "@xams-framework/dusk-valtio/src/plugin";
import { isAsyncFunction } from "@xams-framework/dusk-valtio";

// Logger 类型枚举
type LoggerType = "sync" | "async" | "all";

// Logger 配置接口
interface ValtioLoggerOptions {
    number?: number;
    enabled?: boolean; // 是否启用 logger
    types?: LoggerType[]; // 启用的 logger 类型，默认全部开启
    logParams?: boolean; // 是否记录参数
    logResult?: boolean; // 是否记录返回值
    excludedActions?: string[]; // 排除的 action 列表
}

// 从环境变量读取默认配置
const DEFAULT_OPTIONS: Required<ValtioLoggerOptions> = {
    enabled: import.meta.env.VITE_APP_DUSK_VALTIO_LOGGER === "true",
    types: ["sync", "async"], // 默认全部开启
    logParams: import.meta.env.VITE_APP_DUSK_VALTIO_LOGGER_PARAMS !== "false",
    logResult: import.meta.env.VITE_APP_DUSK_VALTIO_LOGGER_RESULT === "true",
    excludedActions: [],
    number: 1
};

export default function createValtioLogger(options?: ValtioLoggerOptions) {
    // 合并配置
    const config: Required<ValtioLoggerOptions> = {
        ...DEFAULT_OPTIONS,
        ...options,
        types: options?.types || DEFAULT_OPTIONS.types,
        excludedActions: [...DEFAULT_OPTIONS.excludedActions, ...(options?.excludedActions || [])]
    };

    // 创建排除动作集合
    const excludedActions = new Set(config.excludedActions);

    const shouldEnableSync = config.types.includes("sync") || config.types.includes("all");
    const shouldEnableAsync = config.types.includes("async") || config.types.includes("all");

    return definePlugin({
        name: "test",
        interceptor: {
            sync: {
                apply(ctx, next) {
                    console.log('hel2222222222');
                    if (shouldEnableSync) {
                        return logAction(ctx, next, config, excludedActions);
                    }
                    return next();
                }
            },
            async: {
                async apply(ctx, next) {

                    if (shouldEnableAsync) {
                        return logAction(ctx, next, config, excludedActions);
                    }
                    return next();
                }
            }
        }
    });
}


// CSS 样式配置
const STYLES = {
    prefix: "color: #3b82f6; font-weight: bold;", // 蓝色加粗 [valtio]
    sync: "color: #06b6d4; font-weight: bold;", // 青色 sync
    async: "color: #a855f7; font-weight: bold;", // 洋红色 async
    action: "color: #1f2937; font-weight: bold;", // 深灰色加粗 action名称
    success: "color: #10b981; font-weight: bold;", // 绿色 ✓
    error: "color: #ef4444; font-weight: bold;", // 红色 ✗
    label: "color: #9ca3af;" // 灰色标签
};

// 记录成功日志
function logSuccess(
    ctx,
    actionName: string,
    syncType: string,
    startTime: number,
    result: any,
    config: Required<ValtioLoggerOptions>
) {
    const typeStyle = syncType === "async" ? STYLES.async : STYLES.sync;
    const duration = (performance.now() - startTime).toFixed(2);

    // 创建分组标题
    const groupTitle = `%c[valtio%c:%c${syncType}%c]%c %c${actionName}%c %c✓ ${duration}ms`;
    const groupArgs = [STYLES.prefix, STYLES.prefix, typeStyle, STYLES.prefix, "", STYLES.action, "", STYLES.success];

    // 开始分组（默认折叠）
    console.group(groupTitle, ...groupArgs);

    // 记录参数
    if (config.logParams) {
        console.debug("%cparams:", STYLES.label, ctx?.params || "(no params)");
    }

    // 记录返回值
    if (config.logResult && result !== undefined && result !== null) {
        console.debug("%cresult:", STYLES.label, result);
    }

    // 结束分组
    console.groupEnd();
}

// 记录错误日志
function logError(
    ctx,
    actionName: string,
    syncType: string,
    startTime: number,
    error: any,
    config: Required<ValtioLoggerOptions>
) {
    const typeStyle = syncType === "async" ? STYLES.async : STYLES.sync;
    const duration = (performance.now() - startTime).toFixed(2);

    // 创建分组标题
    const groupTitle = `%c[valtio%c:%c${syncType}%c]%c %c${actionName}%c %c✗ ${duration}ms`;
    const groupArgs = [STYLES.prefix, STYLES.prefix, typeStyle, STYLES.prefix, "", STYLES.action, "", STYLES.error];

    // 开始分组（默认展开，因为错误更重要）
    console.group(groupTitle, ...groupArgs);

    // 记录参数
    if (config.logParams) {
        console.debug("%cparams:", STYLES.label, ctx?.params || "(no params)");
    }

    // 记录错误详情
    console.error("%cerror:", STYLES.error, error);

    // 结束分组
    console.groupEnd();
}

// 核心日志逻辑 - 统一处理同步和异步场景
function logAction(ctx: any, next: Function, config: Required<ValtioLoggerOptions>, excludedActions: Set<string>) {
    const namespace: string = ctx.model.$namespace;
    const name: string = ctx.origin.target.name;
    const action = namespace + "/" + name;

    // 跳过排除的 action
    if (excludedActions.has(action)) {
        return next();
    }
    const startTime = performance.now();
    const type = isAsyncFunction(ctx.origin.target) ? "async" : "sync";
    const isAsync = type === "async";
    try {
        logStart(action);
        // 执行下一个中间件或目标函数
        const result = next();

        // 如果是异步，通过 Promise 链处理
        if (isAsync) {
            return (result as Promise<any>).then(
                resolvedResult => {
                    logSuccess(ctx, action, type, startTime, resolvedResult, config);
                    return resolvedResult;
                },
                error => {
                    logError(ctx, action, type, startTime, error, config);
                    throw error;
                }
            );
        }

        // 同步场景直接记录
        logSuccess(ctx, action, type, startTime, result, config);
        return result;
    } catch (error) {
        logError(ctx, action, type, startTime, error, config);
        throw error;
    }
}

function logStart(actionName: string) {
    console.log(`%c[valtio]%c %cLogger started!%c ${actionName}`, STYLES.prefix, "", STYLES.success, STYLES.action);
}
