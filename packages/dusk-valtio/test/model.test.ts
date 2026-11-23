import { describe, expect, test } from 'vitest';
import { createValtioModel } from '../src';

function fetchUser(id: number) {
    return Promise.resolve({ id, name: 'xams-creator' });
}

describe('createValtioModel', () => {
    describe('state', () => {
        test('empty object', () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: {},
            });
            expect(vm.$namespace).toBe('vitest');
            expect(vm.$state).toEqual({});
        });
        test('object', () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: {
                    count: 1,
                },
            });
            expect(vm.count).toBe(1);
            expect(vm.$state.count).toBe(1);
        });
        test('empty object and function', () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: () => {
                    return {};
                },
            });
            expect(vm.$namespace).toBe('vitest');
            expect(vm.$state).toEqual({});
        });
        test('object and function', () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: () => {
                    return {
                        count: 1,
                    };
                },
            });
            expect(vm.count).toBe(1);
            expect(vm.$state.count).toBe(1);
        });
        test('complex', () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: () => {
                    return {
                        count: 1,
                        list: [],
                        obj: {
                            hello: 'world',
                        },
                        get double() {
                            return this.count * 2;
                        },
                    };
                },
            });
            expect(vm.count).toBe(1);
            expect(vm.$state.count).toBe(1);
            expect(vm.list).toEqual([]);
            expect(vm.obj.hello).toEqual('world');
            expect(vm.double).toBe(2);
        });
    });

    describe('actions', () => {
        test('counter', async () => {
            const vm = createValtioModel({
                namespace: 'vitest',
                initialState: {
                    count: 1,
                },
                actions: {
                    add() {
                        return this.$state.count++;
                    },
                    set(count: number) {
                        this.$state.count = count;
                    },
                    async request(id: number) {
                        return await fetchUser(id);
                    },
                },
            });
            expect(vm.add).not.toBeNull();
            expect(vm.set).not.toBeNull();
            expect(vm.request).not.toBeNull();

            expect(vm.$actions.add).not.toBeNull();
            expect(vm.$actions.set).not.toBeNull();
            expect(vm.$actions.request).not.toBeNull();

            vm.add()
            vm.$actions.add();
            expect(vm.count).toBe(3);

            vm.set(1)
            expect(vm.count).toBe(1);

            vm.$actions.set(2);
            expect(vm.count).toBe(2);

            vm.count++;
            expect(vm.$state.count).toBe(3);

            vm.count = 0;
            expect(vm.$state.count).toBe(0);

            const res = await vm.request(1);
            expect(res).toEqual({ id: 1, name: 'xams-creator' });

            vm.$reset();
            expect(vm.$state.count).toBe(1);

        });

    });



});
