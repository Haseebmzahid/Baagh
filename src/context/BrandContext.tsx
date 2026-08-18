import React, { createContext, useContext, useState } from 'react';
import { brandConfig as defaultBrand, BrandConfig } from '../config/brand';

const BrandContext = createContext<BrandConfig>(defaultBrand);

export const BrandProvider: React.FC<{ value?: BrandConfig; children: React.ReactNode }> = ({
  value = defaultBrand,
  children,
}) => {
  const [config] = useState<BrandConfig>(value);
  return <BrandContext.Provider value={config}>{children}</BrandContext.Provider>;
};

export function useBrand(): BrandConfig {
  return useContext(BrandContext);
}
