const puppeteer = require('playwright');

async function testAdminAccess() {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing admin access...');
    
    // Navigate to admin page
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle' });
    
    // Wait a bit for any redirects or loading
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're on login page or admin page
    if (currentUrl.includes('/admin/login')) {
      console.log('✅ Successfully redirected to admin login page');
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ Admin page loaded successfully');
    } else {
      console.log('❌ Unexpected redirect to:', currentUrl);
    }
    
    // Check for any errors in console
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    console.log('Console logs:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminAccess();