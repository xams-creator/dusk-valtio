import { describe, expect, test } from 'vitest';
import { createValtioModel } from '../src';

interface CounterState {
    count: number;
    double: number;
}

function fetchUser(id: number) {
    return Promise.resolve({ id, name: 'xams-creator' });
}

describe('createDuskValtioModel', () => {

    const vm = createValtioModel({
        namespace: 'vitest',
        initialState: {
            count: 1,
            get double() {
                return this.count * 2;
            },
        } as CounterState,
        actions: {
            add() {
                return this.state.count++;
            },
            set(count: number) {
                this.state.count = count;
            },
            async request(id: number) {
                return await fetchUser(id);
            },
        },
    });

    test('returns vm.namespace', () => {
        expect(vm.namespace).toBe('vitest');
    });

    test('returns vm.state', () => {
        expect(vm.state).toEqual({
            count: 1,
            double: 2,
        });
    });

    test('returns vm.add and vm.actions.add', () => {
        expect(vm.add).not.toBeNull();
        expect(vm.actions.add).not.toBeNull();
        vm.add();
        expect(vm.state.count).toBe(2);
    });

    test('returns vm.state.double', () => {
        expect(vm.state.double).toBe(4);
    });

    test('returns vm.set and vm.$reset', () => {
        expect(vm.set).not.toBeNull();
        expect(vm.$reset).not.toBeNull();
        vm.set(998);
        expect(vm.state.count).toBe(998);
        vm.$reset();
        expect(vm.state.count).toBe(1);
        expect(vm.state.double).toBe(2);
    });


    test('returns vm.request', async () => {
        expect(vm.request).not.toBeNull();
        const res = await vm.request(1);
        expect(res.id).toBe(1);
    });

});
