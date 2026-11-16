export type SpecimenFruit = 'chaunsa' | 'kinnow' | 'apple' | 'anaar';

/** Lightweight lookup: importing shopping UI must not load Three.js engines. */
export function specimenFruitFor(productId: string, categoryId: string): SpecimenFruit | null {
  const id = productId.toLowerCase();
  if (['chaunsa','kinnow','apple','anaar'].includes(id)) return id as SpecimenFruit;
  if (categoryId === 'mangoes') return 'chaunsa';
  if (categoryId === 'citrus') return 'kinnow';
  if (categoryId === 'apples') return 'apple';
  return null;
}
