// Frontend Auth Test Script
// This script will test the frontend auth by making requests to the test pages
// Run this with: node frontend-auth-test.js

const BASE_URL = 'http://localhost:3000'

async function testPage(path, description) {
  console.log(`\n🧪 Testing ${description}...`)
  
  try {
    const response = await fetch(`${BASE_URL}${path}`)
    const text = await response.text()
    
    console.log(`Status: ${response.status}`)
    
    if (response.status === 200) {
      // Check for common error indicators in the HTML
      if (text.includes('Auth Context Error')) {
        console.log('❌ Auth Context Error detected in page')
        return false
      } else if (text.includes('Auth Context Missing')) {
        console.log('❌ Auth Context Missing detected in page')
        return false
      } else if (text.includes('useAuth must be used within an AuthProvider')) {
        console.log('❌ Auth Provider not properly set up')
        return false
      } else if (text.includes('Cannot read properties of undefined')) {
        console.log('❌ JavaScript runtime error detected')
        return false
      } else if (text.includes('Loading...') && text.length < 1000) {
        console.log('⚠️  Page seems to be stuck in loading state')
        return false
      } else {
        console.log('✅ Page loaded successfully')
        return true
      }
    } else {
      console.log(`❌ HTTP Error: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`)
    return false
  }
}

async function testAuthAPI() {
  console.log('\n🔧 Testing Auth API endpoints...')
  
  // Test admin auth
  try {
    const response = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Admin Auth API working')
    } else {
      console.log('❌ Admin Auth API failed')
    }
  } catch (error) {
    console.log(`❌ Admin Auth API error: ${error.message}`)
  }
}

async function runFrontendTests() {
  console.log('🚀 Starting Frontend Authentication Tests')
  console.log('=' .repeat(60))
  
  // Test if server is running
  console.log('\n🌐 Testing if development server is running...')
  try {
    const response = await fetch(BASE_URL)
    if (response.ok) {
      console.log('✅ Development server is running')
    } else {
      console.log('❌ Development server returned error:', response.status)
      return
    }
  } catch (error) {
    console.log('❌ Development server is not running or not accessible')
    console.log('Please run: npm run dev')
    return
  }
  
  // Test API endpoints
  await testAuthAPI()
  
  // Test pages
  const pageTests = [
    ['/', 'Homepage'],
    ['/simple-auth-test', 'Simple Auth Test Page'],
    ['/auth-test', 'Detailed Auth Test Page'],
    ['/auth/sign-in', 'Sign In Page'],
    ['/auth/sign-up', 'Sign Up Page']
  ]
  
  let passed = 0
  let failed = 0
  
  for (const [path, description] of pageTests) {
    const result = await testPage(path, description)
    if (result) {
      passed++
    } else {
      failed++
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log(`📊 Frontend Test Results: ${passed}/${passed + failed} pages loaded successfully`)
  
  if (failed === 0) {
    console.log('🎉 All frontend pages are loading correctly!')
    console.log('\n📋 Next Steps:')
    console.log('1. Visit http://localhost:3000/simple-auth-test to test auth functions')
    console.log('2. Check the browser console for any JavaScript errors')
    console.log('3. Look for the Auth Debug component in the bottom-right corner')
  } else {
    console.log('⚠️  Some pages failed to load. Check the errors above.')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure the development server is running: npm run dev')
    console.log('2. Check browser console for JavaScript errors')
    console.log('3. Verify that the auth context is properly set up')
  }
}

runFrontendTests().catch(console.error)