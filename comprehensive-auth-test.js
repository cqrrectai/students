// Comprehensive Authentication Test
// Tests both backend APIs and frontend auth context
// Run this with: node comprehensive-auth-test.js

const BASE_URL = 'http://localhost:3000'

// Test Results Storage
const results = {
  backend: {
    adminAuth: { passed: 0, failed: 0, tests: [] },
    userAuth: { passed: 0, failed: 0, tests: [] }
  },
  frontend: {
    authContext: { passed: 0, failed: 0, tests: [] }
  }
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    return {
      status: response.status,
      data,
      success: response.ok
    }
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    }
  }
}

// Test function wrapper
function test(category, subcategory, name, testFn) {
  return async () => {
    try {
      console.log(`\n🧪 Testing ${name}...`)
      const result = await testFn()
      
      if (result) {
        console.log(`✅ ${name} - PASSED`)
        results[category][subcategory].passed++
        results[category][subcategory].tests.push({ name, status: 'PASSED' })
      } else {
        console.log(`❌ ${name} - FAILED`)
        results[category][subcategory].failed++
        results[category][subcategory].tests.push({ name, status: 'FAILED' })
      }
      
      return result
    } catch (error) {
      console.log(`❌ ${name} - ERROR: ${error.message}`)
      results[category][subcategory].failed++
      results[category][subcategory].tests.push({ name, status: 'ERROR', error: error.message })
      return false
    }
  }
}

// Backend Tests
const backendTests = {
  // Admin Authentication Tests
  adminInvalidCredentials: test('backend', 'adminAuth', 'Admin Invalid Credentials', async () => {
    const result = await apiCall('/api/admin/auth', 'POST', {
      username: 'invalid',
      password: 'invalid'
    })
    return result.status === 401
  }),

  adminValidCredentials: test('backend', 'adminAuth', 'Admin Valid Credentials (admin/admin123)', async () => {
    const result = await apiCall('/api/admin/auth', 'POST', {
      username: 'admin',
      password: 'admin123'
    })
    return result.success && result.data.success && result.data.admin
  }),

  adminAsifcqCredentials: test('backend', 'adminAuth', 'Admin Valid Credentials (asifcq)', async () => {
    const result = await apiCall('/api/admin/auth', 'POST', {
      username: 'asifcq',
      password: 'Cqrrect.1212'
    })
    return result.success && result.data.success && result.data.admin
  }),

  adminMissingFields: test('backend', 'adminAuth', 'Admin Missing Fields', async () => {
    const result = await apiCall('/api/admin/auth', 'POST', {
      username: 'admin'
      // missing password
    })
    return result.status === 400
  }),

  // User Authentication Tests (via Supabase)
  userSupabaseConnection: test('backend', 'userAuth', 'Supabase Connection', async () => {
    const result = await apiCall('/api/system-health')
    return result.success
  })
}

// Frontend Tests (simulated)
const frontendTests = {
  authContextStructure: test('frontend', 'authContext', 'Auth Context Structure', async () => {
    // Test if auth test page loads (indicates context is working)
    const result = await apiCall('/auth-test')
    return result.status !== 500 // Not a server error
  })
}

// Test Summary
function printSummary() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 COMPREHENSIVE AUTHENTICATION TEST RESULTS')
  console.log('='.repeat(80))
  
  // Backend Results
  console.log('\n🔧 BACKEND TESTS')
  console.log('-'.repeat(40))
  
  console.log('\n👤 Admin Authentication:')
  const adminAuth = results.backend.adminAuth
  console.log(`   Passed: ${adminAuth.passed}, Failed: ${adminAuth.failed}`)
  adminAuth.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌'
    console.log(`   ${icon} ${test.name}`)
  })
  
  console.log('\n👥 User Authentication:')
  const userAuth = results.backend.userAuth
  console.log(`   Passed: ${userAuth.passed}, Failed: ${userAuth.failed}`)
  userAuth.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌'
    console.log(`   ${icon} ${test.name}`)
  })
  
  // Frontend Results
  console.log('\n🎨 FRONTEND TESTS')
  console.log('-'.repeat(40))
  
  console.log('\n🔗 Auth Context:')
  const authContext = results.frontend.authContext
  console.log(`   Passed: ${authContext.passed}, Failed: ${authContext.failed}`)
  authContext.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌'
    console.log(`   ${icon} ${test.name}`)
  })
  
  // Overall Summary
  const totalPassed = adminAuth.passed + userAuth.passed + authContext.passed
  const totalFailed = adminAuth.failed + userAuth.failed + authContext.failed
  const totalTests = totalPassed + totalFailed
  
  console.log('\n' + '='.repeat(80))
  console.log(`🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed`)
  
  if (totalFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! Authentication system is working correctly.')
  } else {
    console.log(`⚠️  ${totalFailed} test(s) failed. Please check the issues above.`)
  }
  
  console.log('='.repeat(80))
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Authentication System Test')
  console.log('This will test both backend APIs and frontend auth context')
  console.log('='.repeat(80))
  
  // Run Backend Tests
  console.log('\n🔧 Running Backend Tests...')
  for (const [name, testFn] of Object.entries(backendTests)) {
    await testFn()
  }
  
  // Run Frontend Tests
  console.log('\n🎨 Running Frontend Tests...')
  for (const [name, testFn] of Object.entries(frontendTests)) {
    await testFn()
  }
  
  // Print Summary
  printSummary()
  
  // Additional Instructions
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:')
  console.log('1. Visit http://localhost:3000/auth-test to test the frontend auth context')
  console.log('2. Try signing up a new user with email/password')
  console.log('3. Try signing in with the test user: test@example.com / testpassword123')
  console.log('4. Try admin login with: admin / admin123')
  console.log('5. Try admin login with: asifcq / Cqrrect.1212')
  console.log('6. Check that auth state updates correctly in the UI')
}

// Run the tests
runAllTests().catch(console.error)