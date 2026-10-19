const COMPARE_KEY = 'blitzmall_compare';
const MAX_COMPARE_ITEMS = 4;

export function loadCompareIds(): number[] {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveCompareIds(ids: number[]): void {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('blitzmall_compare_change'));
}

export function isInCompare(productId: number): boolean {
  return loadCompareIds().includes(productId);
}

export function toggleCompare(productId: number): number[] {
  const ids = loadCompareIds();
  const next = ids.includes(productId)
    ? ids.filter((id) => id !== productId)
    : [...ids, productId].slice(0, MAX_COMPARE_ITEMS);
  saveCompareIds(next);
  return next;
}

export function removeFromCompare(productId: number): number[] {
  const next = loadCompareIds().filter((id) => id !== productId);
  saveCompareIds(next);
  return next;
}

export function clearCompare(): void {
  saveCompareIds([]);
}
