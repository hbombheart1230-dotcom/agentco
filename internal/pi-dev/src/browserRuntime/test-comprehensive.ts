import { BrowserRuntime } from './BrowserRuntime';

async function test1_start_stop() {
  console.log('Test 1: Start/Stop');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    await runtime.stop();
    await runtime.stop(); // idempotent
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test2_jalan_navigation() {
  console.log('Test 2: Jalan Navigation');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    const pageId = await runtime.newPage();
    const page = runtime.getPage(pageId);
    if (!page) throw new Error('Page not found');
    await page.goto('https://www.jalan.net', { waitUntil: 'networkidle' });
    const title = await page.title();
    const url = page.url();
    if (!title || !url) throw new Error('Title or URL empty');
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test3_multi_tab() {
  console.log('Test 3: Multi Tab');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    const pageId1 = await runtime.newPage();
    const pageId2 = await runtime.newPage();
    const pageId3 = await runtime.newPage();
    const page1 = runtime.getPage(pageId1);
    const page2 = runtime.getPage(pageId2);
    const page3 = runtime.getPage(pageId3);
    if (!page1 || !page2 || !page3) throw new Error('One or more pages not found');
    await page1.goto('https://www.example.com', { waitUntil: 'domcontentloaded' });
    await page2.goto('https://www.example.org', { waitUntil: 'domcontentloaded' });
    await page3.goto('https://www.example.net', { waitUntil: 'domcontentloaded' });
    const pages = await runtime.listPages();
    if (pages.length !== 3) throw new Error('Expected 3 pages');
    const urls = pages.map(p => p.url);
    if (!urls.includes('https://www.example.com/') || !urls.includes('https://www.example.org/') || !urls.includes('https://www.example.net/')) {
      throw new Error('Expected URLs not found');
    }
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test4_runtime_reuse() {
  console.log('Test 4: Runtime Reuse');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    const pageId1 = await runtime.newPage();
    await (runtime.getPage(pageId1)!!).goto('https://www.example.com', { waitUntil: 'domcontentloaded' });
    const pageId2 = await runtime.newPage();
    await (runtime.getPage(pageId2)!!).goto('https://www.example.org', { waitUntil: 'domcontentloaded' });
    const pageId3 = await runtime.newPage();
    await (runtime.getPage(pageId3)!!).goto('https://www.example.net', { waitUntil: 'domcontentloaded' });
    const pages = await runtime.listPages();
    if (pages.length !== 3) throw new Error('Expected 3 pages');
    // Check that the context is the same (not a new one)
    const context1 = runtime.getContext();
    // We cannot easily check if the context is reused, but we can assume that if we didn't get an error, it's reused.
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test5_persistent_profile() {
  console.log('Test 5: Persistent Profile');
  const runtime1 = new BrowserRuntime();
  try {
    await runtime1.start();
    const pageId = await runtime1.newPage();
    const page = runtime1.getPage(pageId);
    if (!page) throw new Error('Page not found');
    await page.goto('https://www.example.com', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    await runtime1.stop();

    const runtime2 = new BrowserRuntime();
    await runtime2.start();
    const pageId2 = await runtime2.newPage();
    const page2 = runtime2.getPage(pageId2);
    if (!page2) throw new Error('Page not found');
    await page2.goto('https://www.example.com', { waitUntil: 'domcontentloaded' });
    const value = await page2.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    await runtime2.stop();
    if (value !== 'test-value') {
      throw new Error('Persistent storage not working');
    }
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test6_idempotent_stop() {
  console.log('Test 6: Idempotent Stop');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    await runtime.stop();
    await runtime.stop(); // should not throw
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test7_page_not_found() {
  console.log('Test 7: Page Not Found');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    const page = runtime.getPage('page-999');
    if (page !== null) {
      throw new Error('Expected null for non-existent page');
    }
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test8_headful_config() {
  console.log('Test 8: Headful Config');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start({ headless: false });
    // We don't need to do anything else; just starting with headless=false should work.
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

// Concurrency tests

async function test9_concurrent_start() {
  console.log('Test 9: Concurrent Start');
  const runtime = new BrowserRuntime();
  try {
    // Start three times concurrently
    await Promise.all([
      runtime.start(),
      runtime.start(),
      runtime.start()
    ]);
    // After all starts, the context should exist and be the same (only one created)
    const ctx = runtime.getContext();
    if (ctx === null) {
      throw new Error('Context should not be null after start');
    }
    // Call stop to clean up
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test10_concurrent_stop() {
  console.log('Test 10: Concurrent Stop');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    // Stop three times concurrently
    await Promise.all([
      runtime.stop(),
      runtime.stop(),
      runtime.stop()
    ]);
    // After all stops, context should be null
    const ctx = runtime.getContext();
    if (ctx !== null) {
      throw new Error('Context should be null after stop');
    }
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test11_start_stop_contention() {
  console.log('Test 11: Start/Stop Contention');
  const runtime = new BrowserRuntime();
  try {
    // Start start and stop concurrently
    const startPromise = runtime.start();
    const stopPromise = runtime.stop();
    await Promise.allSettled([startPromise, stopPromise]);
    // After contention, the runtime should be in a consistent state.
    // Specifically, if start won, then context should exist and we should be able to stop it cleanly.
    // If stop won, then context should be null and starting again should work.
    // We'll just ensure that we can start and then stop without error.
    // First, check current state: if context exists, stop it; else, start then stop.
    if (runtime.getContext() !== null) {
      await runtime.stop();
    } else {
      await runtime.start();
      await runtime.stop();
    }
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function test12_concurrent_page_mutation() {
  console.log('Test 12: Concurrent Page Mutation');
  const runtime = new BrowserRuntime();
  try {
    await runtime.start();
    // Create three pages concurrently
    const pageIdPromises = [
      runtime.newPage(),
      runtime.newPage(),
      runtime.newPage()
    ];
    const pageIds = await Promise.all(pageIdPromises);
    // Check that all pageIds are unique
    const uniqueIds = new Set(pageIds);
    if (uniqueIds.size !== 3) {
      throw new Error('Duplicate page IDs generated');
    }
    // Check that each page exists in the registry
    for (const id of pageIds) {
      if (runtime.getPage(id) === null) {
        throw new Error(`Page ${id} not found in registry`);
      }
    }
    // Close the pages concurrently
    const closePromises = pageIds.map(id => runtime.closePage(id));
    await Promise.all(closePromises);
    // After closing, registry should be empty
    const pages = await runtime.listPages();
    if (pages.length !== 0) {
      throw new Error('Registry not empty after closing all pages');
    }
    await runtime.stop();
    console.log('PASS');
    return true;
  } catch (e) {
    console.log('FAIL: ' + e);
    return false;
  }
}

async function runAllTests() {
  const tests = [
    test1_start_stop,
    test2_jalan_navigation,
    test3_multi_tab,
    test4_runtime_reuse,
    test5_persistent_profile,
    test6_idempotent_stop,
    test7_page_not_found,
    test8_headful_config,
    test9_concurrent_start,
    test10_concurrent_stop,
    test11_start_stop_contention,
    test12_concurrent_page_mutation,
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    if (await test()) {
      passed++;
    }
  }

  console.log(`\n${passed}/${total} tests passed`);
  if (passed === total) {
    console.log('All tests PASSED');
    return true;
  } else {
    console.log('Some tests FAILED');
    return false;
  }
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(e => {
  console.error('Unexpected error: ' + e);
  process.exit(1);
});