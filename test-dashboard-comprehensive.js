// Comprehensive Dashboard Feature Test
const { execSync } = require('child_process');

console.log('🧪 Comprehensive Dashboard Feature Test\n');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123'; // Mock user ID for testing

// Helper function to test HTTP endpoints
function testEndpoint(url, method = 'GET', expectedStatus = 200) {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X ${method} "${url}"`, { encoding: 'utf8' });
    const status = parseInt(result.trim());
    const success = status === expectedStatus;
    console.log(`   ${success ? '✅' : '❌'} ${method} ${url} - Status: ${status}`);
    return success;
  } catch (error) {
    console.log(`   ❌ ${method} ${url} - Error: ${error.message}`);
    return false;
  }
}

// Test 1: Dashboard Pages Accessibility
console.log('1. Testing Dashboard Pages...');
const dashboardPages = [
  '/dashboard',
  '/dashboard/analytics',
  '/dashboard/create-exam',
  '/dashboard/subscription'
];

let pagesAccessible = 0;
dashboardPages.forEach(page => {
  if (testEndpoint(`${BASE_URL}${page}`)) {
    pagesAccessible++;
  }
});

console.log(`   📊 ${pagesAccessible}/${dashboardPages.length} pages accessible\n`);

// Test 2: API Endpoints
console.log('2. Testing API Endpoints...');
const apiEndpoints = [
  { url: `/api/dashboard/analytics?userId=${TEST_USER_ID}`, method: 'GET' },
  { url: '/api/student-exams', method: 'GET', expectedStatus: 400 }, // Should require userId
  { url: '/api/subscriptions', method: 'GET' }
];

let apisWorking = 0;
apiEndpoints.forEach(({ url, method, expectedStatus = 200 }) => {
  if (testEndpoint(`${BASE_URL}${url}`, method, expectedStatus)) {
    apisWorking++;
  }
});

console.log(`   📊 ${apisWorking}/${apiEndpoints.length} APIs responding correctly\n`);

// Test 3: Static Assets
console.log('3. Testing Static Assets...');
const staticAssets = [
  '/favicon.ico',
  '/manifest.json'
];

let assetsAvailable = 0;
staticAssets.forEach(asset => {
  if (testEndpoint(`${BASE_URL}${asset}`)) {
    assetsAvailable++;
  }
});

console.log(`   📊 ${assetsAvailable}/${staticAssets.length} static assets available\n`);

// Test 4: Authentication Flow
console.log('4. Testing Authentication Pages...');
const authPages = [
  '/auth/sign-in',
  '/auth/sign-up'
];

let authPagesWorking = 0;
authPages.forEach(page => {
  if (testEndpoint(`${BASE_URL}${page}`)) {
    authPagesWorking++;
  }
});

console.log(`   📊 ${authPagesWorking}/${authPages.length} auth pages accessible\n`);

// Test 5: Public Pages
console.log('5. Testing Public Pages...');
const publicPages = [
  '/',
  '/about',
  '/contact',
  '/pricing'
];

let publicPagesWorking = 0;
publicPages.forEach(page => {
  if (testEndpoint(`${BASE_URL}${page}`)) {
    publicPagesWorking++;
  }
});

console.log(`   📊 ${publicPagesWorking}/${publicPages.length} public pages accessible\n`);

// Summary
console.log('📋 Test Summary:');
console.log(`   Dashboard Pages: ${pagesAccessible}/${dashboardPages.length}`);
console.log(`   API Endpoints: ${apisWorking}/${apiEndpoints.length}`);
console.log(`   Static Assets: ${assetsAvailable}/${staticAssets.length}`);
console.log(`   Auth Pages: ${authPagesWorking}/${authPages.length}`);
console.log(`   Public Pages: ${publicPagesWorking}/${publicPages.length}`);

const totalTests = dashboardPages.length + apiEndpoints.length + staticAssets.length + authPages.length + publicPages.length;
const totalPassed = pagesAccessible + apisWorking + assetsAvailable + authPagesWorking + publicPagesWorking;

console.log(`\n🎯 Overall Score: ${totalPassed}/${totalTests} (${Math.round((totalPassed/totalTests)*100)}%)`);

if (totalPassed === totalTests) {
  console.log('🎉 All tests passed! Dashboard is fully functional.');
} else {
  console.log('⚠️  Some tests failed. Check the server and fix issues.');
}

console.log('\n🚀 Manual Testing Instructions:');
console.log('1. Start the development server: npm run dev');
console.log('2. Visit http://localhost:3000/dashboard');
console.log('3. Sign in with a test account');
console.log('4. Test each dashboard feature:');
console.log('   - View analytics');
console.log('   - Create an exam');
console.log('   - Check subscription status');
console.log('   - Navigate between sections');
console.log('5. Verify contrast and accessibility');