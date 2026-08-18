import { FruitConfig, FruitSceneFactory } from '../core/types';
import { chaunsaConfig } from './chaunsa/config';
import { createChaunsaScene } from './chaunsa/ChaunsaScene';
import { kinnowConfig } from './kinnow/config';
import { createKinnowScene } from './kinnow/KinnowScene';
import { appleConfig } from './apple/config';
import { createAppleScene } from './apple/AppleScene';
import { anaarConfig } from './anaar/config';
import { createAnaarScene } from './anaar/AnaarScene';

export interface FruitRegistryEntry {
  config: FruitConfig;
  factory: FruitSceneFactory;
}

export const fruitRegistry: Record<string, FruitRegistryEntry> = {
  chaunsa: {
    config: chaunsaConfig,
    factory: createChaunsaScene,
  },
  kinnow: {
    config: kinnowConfig,
    factory: createKinnowScene,
  },
  apple: {
    config: appleConfig,
    factory: createAppleScene,
  },
  anaar: {
    config: anaarConfig,
    factory: createAnaarScene,
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

