import {expect, test} from '@playwright/test';

/**
 * Layout Shift (CLS) tests.
 * Measures Cumulative Layout Shift using the PerformanceObserver API.
 *
 * CLS Thresholds (Core Web Vitals):
 * - Good: < 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: > 0.25
 */

// CLS threshold - should be below 0.1 for "good" score
const CLS_THRESHOLD = 0.1;

// Pages to test for layout shifts
const pagesToTest = [
  {name: 'Homepage', path: '/'},
  {name: 'Activiteiten', path: '/activiteiten'},
  {name: 'Nieuws', path: '/nieuws'},
  {name: 'Contact', path: '/contact'},
];

type LayoutShiftEntry = {
  value: number;
  sources: Array<{
    node: string;
    previousRect: {x: number; y: number; width: number; height: number};
    currentRect: {x: number; y: number; width: number; height: number};
  }>;
};

type ClsResult = {
  cls: number;
  entries: LayoutShiftEntry[];
};

/**
 * Inject CLS measurement script into the page.
 * Returns CLS value and the elements that caused shifts.
 */
async function measureCLS(page: import('@playwright/test').Page): Promise<ClsResult> {
  return page.evaluate(() => new Promise<ClsResult>(resolve => {
    let clsValue = 0;
    const clsEntries: LayoutShiftEntry[] = [];

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input

        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value as number;

          // Capture which elements shifted

          const sources = ((entry as any).sources ?? []) as Array<{
            node: Element | null;
            previousRect: DOMRectReadOnly;
            currentRect: DOMRectReadOnly;
          }>;

          clsEntries.push({

            value: (entry as any).value as number,
            sources: sources.map(source => ({
              node: source.node?.outerHTML?.slice(0, 200) ?? 'unknown',
              previousRect: {
                x: source.previousRect.x,
                y: source.previousRect.y,
                width: source.previousRect.width,
                height: source.previousRect.height,
              },
              currentRect: {
                x: source.currentRect.x,
                y: source.currentRect.y,
                width: source.currentRect.width,
                height: source.currentRect.height,
              },
            })),
          });
        }
      }
    });

    observer.observe({type: 'layout-shift', buffered: true});

    // Wait for page to stabilize, then report CLS
    setTimeout(() => {
      observer.disconnect();
      resolve({cls: clsValue, entries: clsEntries});
    }, 3000);
  }));
}

for (const pageConfig of pagesToTest) {
  test.describe(`Layout Shift: ${pageConfig.name}`, () => {
    test(`should have CLS below ${CLS_THRESHOLD} on ${pageConfig.path}`, async ({page}) => {
      // Navigate to page
      await page.goto(pageConfig.path);

      // Wait for initial load
      await page.waitForLoadState('networkidle');

      // Measure CLS
      const result = await measureCLS(page);

      // Log detailed results
      console.log(`\n=== CLS Results for ${pageConfig.path} ===`);
      console.log(`Total CLS: ${result.cls.toFixed(4)}`);
      console.log(`Status: ${result.cls < CLS_THRESHOLD ? 'GOOD' : (result.cls < 0.25 ? 'NEEDS IMPROVEMENT' : 'POOR')}`);

      if (result.entries.length > 0) {
        console.log('\nLayout shift events:');
        for (const entry of result.entries) {
          console.log(`\n  Shift value: ${entry.value.toFixed(4)}`);
          for (const source of entry.sources) {
            console.log(`  Element: ${source.node}`);
            console.log(`  Moved from: (${source.previousRect.x}, ${source.previousRect.y}) ${source.previousRect.width}x${source.previousRect.height}`);
            console.log(`  Moved to: (${source.currentRect.x}, ${source.currentRect.y}) ${source.currentRect.width}x${source.currentRect.height}`);
          }
        }
      }

      expect(result.cls, `CLS should be below ${CLS_THRESHOLD}`).toBeLessThan(CLS_THRESHOLD);
    });

    test(`should not shift on scroll on ${pageConfig.path}`, async ({page}) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // Wait for initial content to load
      await page.waitForTimeout(1000);

      // Start measuring CLS after initial load
      const clsAfterScroll = await page.evaluate(() => new Promise<number>(resolve => {
        let clsValue = 0;

        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value as number;
            }
          }
        });

        observer.observe({type: 'layout-shift', buffered: false});

        // Scroll down the page
        window.scrollTo(0, document.body.scrollHeight / 2);

        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 500);

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      }));

      console.log(`\n=== CLS after scroll on ${pageConfig.path}: ${clsAfterScroll.toFixed(4)} ===`);

      // CLS after scroll should be minimal (scrolling itself doesn't count as input for lazy-loaded content)
      expect(clsAfterScroll, 'CLS after scroll should be minimal').toBeLessThan(0.05);
    });
  });
}

test.describe('Layout Shift: Images', () => {
  test('images should have explicit dimensions to prevent CLS', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();

    const imagesWithoutDimensions: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      if (await img.isVisible()) {
        const hasWidth = await img.evaluate(el => {
          const width = el.getAttribute('width') ?? el.style.width;
          const hasAspectRatio = window.getComputedStyle(el).aspectRatio !== 'auto';
          return Boolean(width) || hasAspectRatio;
        });

        const hasHeight = await img.evaluate(el => {
          const height = el.getAttribute('height') ?? el.style.height;
          const hasAspectRatio = window.getComputedStyle(el).aspectRatio !== 'auto';
          return Boolean(height) || hasAspectRatio;
        });

        if (!hasWidth || !hasHeight) {
          const src = await img.getAttribute('src');
          imagesWithoutDimensions.push(src ?? 'unknown');
        }
      }
    }

    if (imagesWithoutDimensions.length > 0) {
      console.log('\n=== Images without explicit dimensions ===');
      for (const src of imagesWithoutDimensions) {
        console.log(`  - ${src}`);
      }
    }

    expect(imagesWithoutDimensions, 'All visible images should have explicit dimensions').toEqual([]);
  });
});

test.describe('Layout Shift: Fonts', () => {
  test('should not have FOUT/FOIT causing layout shifts', async ({page}) => {
    // Listen for font loading
    const fontLoadTimes: Array<{font: string; loadTime: number}> = [];

    await page.goto('/');

    // Check if fonts cause layout shifts during load
    const fontCLS = await page.evaluate(() => new Promise<number>(resolve => {
      let clsValue = 0;

      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value as number;
          }
        }
      });

      observer.observe({type: 'layout-shift', buffered: true});

      // Wait for fonts to load
      document.fonts.ready.then(() => {
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      }).catch(() => {
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    }));

    console.log(`\n=== Font-related CLS: ${fontCLS.toFixed(4)} ===`);
    console.log('Font load times:', fontLoadTimes);

    // Font loading should not cause significant layout shifts
    expect(fontCLS, 'Font loading should not cause significant CLS').toBeLessThan(0.05);
  });
});
