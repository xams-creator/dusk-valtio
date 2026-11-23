import { use } from './middleware';
import { DuskValtio, DuskValtioManager } from './types';
import pkg from '../package.json';

function createDuskValtioManager(): DuskValtioManager {
    const dvm = new Proxy({
        version: pkg.version,
        use: <M extends DuskValtio.Middleware | DuskValtio.AsyncMiddleware>(middleware: M) => {
            use(middleware);
            return dvm;
        },
    }, {
        set: () => {
            throw new Error('Cannot set property on DuskValtioManager');
        },
    });
    return dvm;
}

export const dvm = createDuskValtioManager();
