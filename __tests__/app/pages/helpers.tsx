import {expect} from 'vitest';

export function expectInOrder(container: HTMLElement, texts: string[]) {
  const text = container.textContent ?? '';
  let last = -1;
  for (const item of texts) {
    const index = text.indexOf(item, last + 1);
    expect(index, `"${item}" missing or out of order`).toBeGreaterThan(last);
    last = index;
  }
}
