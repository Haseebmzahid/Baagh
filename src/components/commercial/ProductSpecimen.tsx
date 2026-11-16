import React from 'react';
import type { Product } from '../../data/catalogue';
import { FruitPhoto } from './FruitPhoto';

export interface ProductSpecimenProps { product: Product; ratio?: string; compact?: boolean; }
export const ProductSpecimen: React.FC<ProductSpecimenProps> = ({ product, ratio = '1 / 1', compact = false }) => (
  <FruitPhoto fruit={product.id} ratio={ratio} priority={!compact} />
);
