import React from 'react';
import './fruitPhoto.css';

/** Licensed reference photography, never a claim about a particular crop or pack. */
export const fruitPhotos: Record<string, string> = {
  chaunsa: '/images/fruit/chaunsa-orchard.png',
  kinnow: '/images/fruit/citrus.webp',
  apple: '/images/fruit/apple.webp',
  anaar: '/images/fruit/pomegranate.webp',
  mixed: '/images/fruit/mixed.webp',
};

export const FruitPhoto: React.FC<{
  fruit?: string; ratio?: string; priority?: boolean; alt?: string;
}> = ({ fruit = 'mixed', ratio = '4 / 5', priority = false, alt }) => (
  <div className="fruit-photo" style={{ aspectRatio: ratio }}>
    <img key={fruit} src={fruitPhotos[fruit] ?? fruitPhotos.mixed}
      alt={alt ?? ({ chaunsa: 'Ripe mangoes', kinnow: 'Fresh citrus fruit', apple: 'A red apple in natural light', anaar: 'Pomegranates and citrus fruit' }[fruit] ?? 'An assortment of fresh fruit')}
      loading={priority ? 'eager' : 'lazy'} decoding="async" />
  </div>
);
