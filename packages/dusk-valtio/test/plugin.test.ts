import { describe, expect, test } from 'vitest';
import { dvm } from '../src/plugin';

describe('dvm use plugin', () => {

    test('dvm.use', () => {

        dvm.use({
            name: 'test',
            setup: (ctx, options) => {
              console.log(123)
            }
        })


    });


});
