import { createValtioModel, dvm } from "@xams-framework/dusk-valtio";

interface CounterState {
    count: number;
    double: number;
    obj: {
        list: any[]
    };
}

const initialState: CounterState = {
    count: 0,
    get double() {
        return this.count * 2;
    },
    obj: {
        list: []
    }
};


export const store = createValtioModel({
    namespace: "counter",
    initialState,
    actions: {
        add() {
            this.count++;
            this.$state.count++;
            console.log(this.count);
            return "ok";
        },
        async asyncAdd() {
            this.count++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.count++;
        }
    },
    onInitialization() {
        this.count++;
    },
    plugins: [
        // createValtioLogger({ number: 2 })
    ]
});
// @ts-ignore
window.store = store;

