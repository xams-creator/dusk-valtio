// import { proxy } from 'valtio';
//
// import { proxy as _proxy } from '../src/common';
//
// interface VMOptions<S, A> {
//     initialState: S | ((namespace: string) => S);
//     actions: A & ThisType<VM<S, A> & A>;
// }
//
// interface VM<S, A> {
//     state: S;
//     actions: A;
// }
//
// function createVM<S extends object, A extends object>(options: VMOptions<S, A>): VM<S, A> & A {
//     const { initialState, actions } = options;
//
//     const state = typeof initialState === 'function' ? initialState('namespace') : initialState;
//     const model: VM<S, A> = {
//         state: proxy(state),
//         actions: {
//             ...actions,
//             reset: function() {
//                 const freshState = typeof initialState === 'function'
//                     ? initialState('namespace')
//                     : { ...state };
//
//                 Object.keys(freshState).forEach(key => {
//                     model.state[key] = freshState[key];
//                 });
//             },
//         } as A,
//     };
//
//     for (const name of Object.keys(model.actions)) {
//         const fn = model.actions[name];
//         if (typeof fn === 'function') {
//             model.actions[name] = fn.bind(model);
//             _proxy(model, 'actions', name);
//         }
//     }
//
//     return model as VM<S, A> & A;
// }
//
// interface CounterState {
//     count: number;
// }
//
// const initialState: CounterState = {
//     count: 1,
// };
// const vm = createVM({
//     initialState,
//     actions: {
//         add() {
//             console.log('add');
//             return 123;
//         },
//         async minus() {
//             console.log('minus');
//             return 'bar';
//         },
//         test() {
//             this.state.count = 123;
//             this.actions.add();
//             this.add();
//             this.minus();
//         },
//     },
// });
//
// vm.actions.add();
// await vm.actions.minus();
// vm.state.count = 123;
// await vm.minus();
//
// const vm2 = createVM({
//     initialState: (namespace): CounterState => {
//         return {
//             count: 1,
//         };
//     },
//     actions: {
//         test() {
//             this.state.count++;
//         },
//
//     },
// });
//
// vm2.test();
