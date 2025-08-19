// Test Dashboard Features
const { execSync } = require('child_process');

console.log('🧪 Testing Dashboard Features...\n');

// Test 1: Check if dashboard page loads
console.log('1. Testing dashboard page accessibility...');
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard', { encoding: 'utf8' });
  console.log(`   Dashboard HTTP Status: ${result}`);
} catch (error) {
  console.log('   ❌ Dashboard not accessible (server may not be running)');
}

// Test 2: Check dashboard subpages
const subpages = [
  '/dashboard/analytics',
  '/dashboard/create-exam', 
  '/dashboard/subscription'
];

console.log('\n2. Testing dashboard subpages...');
subpages.forEach(page => {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${page}`, { encoding: 'utf8' });
    console.log(`   ${page}: ${result}`);
  } catch (error) {
    console.log(`   ${page}: ❌ Not accessible`);
  }
});

// Test 3: Check API endpoints
console.log('\n3. Testing dashboard API endpoints...');
const apiEndpoints = [
  '/api/dashboard/analytics',
  '/api/student-exams',
  '/api/subscriptions'
];

apiEndpoints.forEach(endpoint => {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${endpoint}`, { encoding: 'utf8' });
    console.log(`   ${endpoint}: ${result}`);
  } catch (error) {
    console.log(`   ${endpoint}: ❌ Not accessible`);
  }
});

console.log('\n✅ Dashboard feature test completed!');
console.log('\nTo run the app and test manually:');
console.log('1. npm run dev');
console.log('2. Visit http://localhost:3000/dashboard');
console.log('3. Sign in and test each feature');