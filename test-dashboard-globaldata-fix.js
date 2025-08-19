const { chromium } = require('playwright');

async function testDashboardGlobalDataFix() {
  console.log('🧪 Testing Dashboard GlobalData Provider Fix...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    // Go to dashboard page
    console.log('📍 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Wait a bit for any runtime errors to appear
    await page.waitForTimeout(3000);
    
    // Check if the specific GlobalData error occurred
    const hasGlobalDataError = errors.some(error => 
      error.includes('useGlobalData must be used within a GlobalDataProvider')
    );
    
    if (hasGlobalDataError) {
      console.log('❌ FAILED: GlobalDataProvider error still occurs');
      console.log('Errors found:', errors);
      return false;
    }
    
    // Check if page loaded successfully
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    
    // Check if we can see either the sign-in prompt or dashboard content
    const hasSignInPrompt = await page.locator('text=Please Sign In').isVisible().catch(() => false);
    const hasDashboardContent = await page.locator('text=Dashboard').isVisible().catch(() => false);
    
    if (hasSignInPrompt) {
      console.log('✅ Dashboard page loaded - showing sign-in prompt (expected when not authenticated)');
    } else if (hasDashboardContent) {
      console.log('✅ Dashboard page loaded - showing dashboard content (user is authenticated)');
    } else {
      console.log('⚠️  Dashboard page loaded but content unclear');
    }
    
    // Check for any runtime errors in general
    if (errors.length > 0) {
      console.log('⚠️  Some errors were found:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No runtime errors detected');
    }
    
    console.log('\n🎉 GlobalDataProvider fix appears to be working!');
    return true;
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Test with authentication flow
async function testDashboardWithAuth() {
  console.log('\n🔐 Testing Dashboard with Authentication...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  try {
    // First sign in
    console.log('📍 Going to sign-in page...');
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle' });
    
    // Fill in test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    console.log('🔑 Attempting to sign in...');
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    // Now try to access dashboard
    console.log('📍 Navigating to dashboard after sign-in...');
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    // Check for GlobalData error specifically
    const hasGlobalDataError = errors.some(error => 
      error.includes('useGlobalData must be used within a GlobalDataProvider')
    );
    
    if (hasGlobalDataError) {
      console.log('❌ FAILED: GlobalDataProvider error still occurs after authentication');
      return false;
    }
    
    console.log('✅ No GlobalDataProvider errors after authentication');
    
    // Check what's displayed
    const pageContent = await page.textContent('body');
    if (pageContent.includes('Dashboard')) {
      console.log('✅ Dashboard content is visible');
    } else if (pageContent.includes('Please Sign In')) {
      console.log('ℹ️  Still showing sign-in prompt (authentication may have failed)');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting GlobalDataProvider Fix Tests\n');
  
  const test1 = await testDashboardGlobalDataFix();
  const test2 = await testDashboardWithAuth();
  
  console.log('\n📊 Test Results:');
  console.log('- Basic Dashboard Load:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('- Dashboard with Auth:', test2 ? '✅ PASS' : '❌ FAIL');
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! GlobalDataProvider fix is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

runTests().catch(console.error);