import { createValtioModel, definePlugin } from "@xams-framework/dusk-valtio";

interface LoadingState {
    count: number;
    loading: boolean;
}

const vm = createValtioModel({
    namespace: "valtio-loading",
    initialState: {
        count: 0,
        loading: false
    } as LoadingState,
    actions: {
        start() {
            this.count += 1;
            this.loading = true;
        },
        stop() {
            this.count = Math.max(0, this.count - 1);
            this.loading = this.count > 0;
        }
    }
});

export default function createAppValtioLoading() {
    return definePlugin({
        name: "app-valtio-loading",
        interceptor: {
            sync: {
                async apply(ctx, next) {
                    try {

                        console.log(`[valtio-loading] begin... ${ctx.origin.target.name}`);
                        vm.start();
                        return await next();
                    } finally {
                        vm.stop();
                        console.log(`[valtio-loading] end... ${ctx.origin.target.name}`);
                    }
                }
            }
        }
    });
}
