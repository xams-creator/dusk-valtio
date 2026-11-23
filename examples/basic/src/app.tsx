import { createValtioModel, useDuskValtioSnapshot } from '@xams-framework/dusk-valtio';

interface CounterState {
    count: number;
    double: number;
    obj: {
        list: any[]
    };
}

const initialState: CounterState = {
    count: 0,
    double: 0,
    obj: {
        list: [],
    },
};

const store = createValtioModel({
    namespace: 'counter',
    initialState:{
        count: 0,
        get double(){
            return this.count * 2;
        } ,
        obj: {
            list: [],
        },
    } as CounterState,
    actions: {
        add() {
            this.count++;
            this.$state.count++;
            return 'ok';
        },
        async asyncAdd() {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return this.add();
        },
    },
    onInitialization(){

    },
});
store.count = 10;

// @ts-ignore
window.store = store;
export default function App() {
    const snapshot = useDuskValtioSnapshot(store);
    return (
        <div>
            Hello World!

            <br />

            <button onClick={store.add}>+</button>
            {snapshot.count} {snapshot.double}

            <ul>
                {snapshot.obj.list.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
