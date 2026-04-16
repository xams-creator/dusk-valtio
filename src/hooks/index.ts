import { useSnapshot } from 'valtio/react';
import { ValtioModel } from '@/types';

export function useDuskValtioSnapshot<S extends object>(model: ValtioModel<S, any>) {
    return useSnapshot(model.state);
}
