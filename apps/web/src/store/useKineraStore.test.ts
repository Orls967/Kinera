import { describe, expect, it } from 'vitest';
import { useKineraStore } from './useKineraStore';

describe('Zustand Application Store & Configuration Rebind Cascade', () => {
  it('switches cleanly across ICE and EV configurations updating defaults', () => {
    const store = useKineraStore.getState();
    store.setActiveConfigId('vehicle.config.ev-dual-awd');
    expect(useKineraStore.getState().activeConfigId).toBe('vehicle.config.ev-dual-awd');
    expect(useKineraStore.getState().simDiffMode).toBe('ev_electronic');
    expect(useKineraStore.getState().simGearIndex).toBe(1);

    store.setActiveConfigId('vehicle.config.ice-4wd');
    expect(useKineraStore.getState().simDiffMode).toBe('locked');
    expect(useKineraStore.getState().simGearIndex).toBe(3);

    store.setExplodeFactor(0.75);
    store.setSectionCutEnabled(true);
    store.resetAssembly();
    expect(useKineraStore.getState().explodeFactor).toBe(0);
    expect(useKineraStore.getState().sectionCutEnabled).toBe(false);
  });
});
