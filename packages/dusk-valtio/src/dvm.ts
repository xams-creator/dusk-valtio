import { plugins, use } from './plugin';
import { DvPlugin, DuskValtioManager } from './types';
import pkg from '../package.json';

function createDuskValtioManager(): DuskValtioManager {
    const dvm = new Proxy({
        version: pkg.version,
        plugins: plugins,
        use(plugin: DvPlugin) {
            use(plugin);
            return dvm;
        },
    } as DuskValtioManager, {
        set: () => {
            throw new Error('Cannot set property on DuskValtioManager');
        },
    });
    return dvm;
}

export const dvm = createDuskValtioManager();
