import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getProductById, isOrderable } from '../data/catalogue';
import type { Product, Pack } from '../data/types';
import { addLine, BASKET_KEY, decodeBasket, encodeBasket, lineKey, MAX_QUANTITY, priceInMinorUnits, setLineQuantity } from '../basket/model';
import type { BasketLine } from '../basket/model';

export interface ResolvedBasketLine extends BasketLine {
  key: string;
  product?: Product;
  pack?: Pack;
  unitPrice: number | null;
  available: boolean;
}

interface BasketState {
  lines: ResolvedBasketLine[];
  count: number;
  subtotal: number;
  canEnquire: boolean;
  isOpen: boolean;
  notice: string;
  storageNotice: string;
  openBasket: () => void;
  closeBasket: () => void;
  add: (productId: string, packId: string, quantity: number) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  quantityOf: (productId: string, packId: string) => number;
}

const BasketContext = createContext<BasketState | null>(null);

function loadBasket() {
  try {
    const saved = decodeBasket(window.localStorage.getItem(BASKET_KEY));
    return { ...saved, failed: false };
  } catch {
    return { lines: [] as BasketLine[], recovered: false, failed: true };
  }
}

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState(loadBasket);
  const [selections, setSelections] = useState(initial.lines);
  // Updated synchronously as well as through React, so rapid adds see the latest quantity.
  const current = useRef(selections);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageNotice, setStorageNotice] = useState(initial.failed
    ? 'Browser storage is unavailable. Your basket will only last for this visit.'
    : initial.recovered ? 'Some saved basket data could not be restored. Please review your selection.' : '');

  const commit = useCallback((next: BasketLine[]) => {
    current.current = next;
    setSelections(next);
    try {
      window.localStorage.setItem(BASKET_KEY, encodeBasket(next));
    } catch {
      setStorageNotice('Your latest basket changes could not be saved. Keep this page open; refreshing may lose changes.');
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key !== BASKET_KEY && event.key !== null) || event.storageArea !== window.localStorage) return;
      const saved = decodeBasket(event.key === null ? null : event.newValue);
      current.current = saved.lines;
      setSelections(saved.lines);
      setNotice('Basket updated in another tab.');
      if (saved.recovered) setStorageNotice('Some saved basket data could not be restored. Please review your selection.');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const openBasket = useCallback(() => setIsOpen(true), []);
  const closeBasket = useCallback(() => setIsOpen(false), []);

  const add = useCallback((productId: string, packId: string, quantity: number): boolean => {
    const product = getProductById(productId);
    const pack = product?.packs.find((p) => p.id === packId);
    if (!product || !pack || !isOrderable(product) || !pack.available || priceInMinorUnits(pack.price) === null ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      setNotice('This selection cannot be added. Please check the product and pack.');
      return false;
    }
    const existing = current.current.find((line) => line.productId === productId && line.packId === packId)?.quantity ?? 0;
    const accepted = Math.min(quantity, MAX_QUANTITY - existing);
    if (accepted === 0) {
      setNotice(`The basket already contains the maximum of ${MAX_QUANTITY} packs of ${product.name} (${pack.label}).`);
      setIsOpen(true);
      return false;
    }
    commit(addLine(current.current, { productId, packId, quantity: accepted }));
    setNotice(`${product.name}, ${pack.label}: ${existing + accepted} in basket.${accepted < quantity ? ` Maximum ${MAX_QUANTITY} per pack size.` : ''}`);
    setIsOpen(true);
    return true;
  }, [commit]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const line = current.current.find((candidate) => lineKey(candidate) === key);
    if (!line || !Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return;
    const product = getProductById(line.productId);
    const pack = product?.packs.find((p) => p.id === line.packId);
    if (quantity > line.quantity && (!product || !pack?.available || !isOrderable(product))) return;
    commit(setLineQuantity(current.current, key, quantity));
    setNotice(quantity === 0 ? `${product?.name ?? 'Item'} removed from basket.` : `${product?.name ?? 'Item'} quantity updated to ${quantity}.`);
  }, [commit]);

  const lines = selections.map((line): ResolvedBasketLine => {
    const product = getProductById(line.productId);
    const pack = product?.packs.find((p) => p.id === line.packId);
    const unitPrice = pack ? priceInMinorUnits(pack.price) : null;
    return { ...line, key: lineKey(line), product, pack, unitPrice,
      available: !!product && !!pack?.available && isOrderable(product) && unitPrice !== null };
  });

  return <BasketContext.Provider value={{
    lines, count: selections.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + (line.available ? (line.unitPrice ?? 0) * line.quantity : 0), 0),
    canEnquire: lines.length > 0 && lines.every((line) => line.available),
    isOpen, notice, storageNotice, openBasket, closeBasket, add, setQuantity,
    quantityOf: (productId, packId) => selections.find((line) => line.productId === productId && line.packId === packId)?.quantity ?? 0,
  }}>{children}</BasketContext.Provider>;
};

export function useBasket(): BasketState {
  const value = useContext(BasketContext);
  if (!value) throw new Error('useBasket must be used within BasketProvider');
  return value;
}
