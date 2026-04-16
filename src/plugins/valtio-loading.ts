import { useSnapshot } from 'valtio/react';

import { use as _use, createValtioModel } from '../index.ts';

interface LoadingState {
    count: number;
    loading: boolean;
}

const vm = createValtioModel({
    namespace: 'valtio-loading',
    initialState: {
        count: 0,
        loading: false,
    } as LoadingState,
    actions: {
        start() {
            this.state.count += 1;
            this.state.loading = true;
        },
        stop() {
            this.state.count = Math.max(0, this.state.count - 1);
            this.state.loading = this.state.count > 0;
        },
    },
});

_use({
    name: 'valtio-plugin-loading',
    async apply(ctx, next) {
        try {
            console.log('[valtio-loading] begin...');
            vm.start();
            return await next();
        } finally {
            vm.stop();
            console.log('[valtio-loading] end...');
        }
    },
});

export function useLoading() {
    const snapshot = useSnapshot(vm.state);
    return [snapshot.loading];
}
