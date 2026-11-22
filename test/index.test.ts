import { describe, expect, it } from 'vitest';
import { dvm, createValtioModel } from '../src';

describe('index', () => {

    it('should export dvm object', () => {
        expect(dvm).toBeDefined();
        expect(typeof dvm.version).toBe('string');
        expect(typeof dvm.use).toBe('function');
    });

    it('should export createValtioModel', () => {
        expect(typeof createValtioModel).toBe('function');
    });

});
