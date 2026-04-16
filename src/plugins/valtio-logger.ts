import { use as _use } from '../index.ts';

_use({
    name: 'valtio-plugin-logger',
    async apply(ctx, next) {
        try {
            console.log(`[valtio-plugin-logger] [${ctx.origin.target.name}] begin.....`);
            return await next();
        } finally {
            console.log(`[valtio-plugin-logger] [${ctx.origin.target.name}] end.....`);
        }
    },
});
