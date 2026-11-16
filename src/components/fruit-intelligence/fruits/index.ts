import { FruitConfig, FruitSceneFactory } from '../core/types';
import { chaunsaConfig } from './chaunsa/config';
import { kinnowConfig } from './kinnow/config';
import { appleConfig } from './apple/config';
import { anaarConfig } from './anaar/config';

export interface FruitRegistryEntry {
  config: FruitConfig;
  loadFactory: () => Promise<FruitSceneFactory>;
}

export const fruitRegistry: Record<string, FruitRegistryEntry> = {
  chaunsa: {
    config: chaunsaConfig,
    loadFactory: () => import('./chaunsa/ChaunsaScene').then(module => module.createChaunsaScene),
  },
  kinnow: {
    config: kinnowConfig,
    loadFactory: () => import('./kinnow/KinnowScene').then(module => module.createKinnowScene),
  },
  apple: {
    config: appleConfig,
    loadFactory: () => import('./apple/AppleScene').then(module => module.createAppleScene),
  },
  anaar: {
    config: anaarConfig,
    loadFactory: () => import('./anaar/AnaarScene').then(module => module.createAnaarScene),
  },
};

export function getFruitEntry(fruitId: string): FruitRegistryEntry {
  const entry = fruitRegistry[fruitId.toLowerCase()];
  if (!entry) {
    console.warn(`Fruit "${fruitId}" not found in registry, falling back to "chaunsa"`);
    return fruitRegistry.chaunsa;
  }
  return entry;
}

