// Comprehensive Authentication Test
// This will test the auth system and identify redirection issues
// Run this with: node test-auth-comprehensive.js

const BASE_URL = 'http://localhost:3000'

async function testPage(path, description) {
  console.log(`\n🧪 Testing ${description}...`)
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      redirect: 'manual' // Don't follow redirects automatically
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      console.log(`   Redirect to: ${location}`)
      return { status: response.status, redirect: location, success: false }
    }
    
    if (response.status === 200) {
      const text = await response.text()
      
      // Check for common error indicators
      if (text.includes('useAuth must be used within an AuthProvider')) {
        console.log('   ❌ Auth Provider Error detected')
        return { status: 200, success: false, error: 'Auth Provider Missing' }
      }
      
      if (text.includes('Cannot read properties of undefined')) {
        console.log('   ❌ JavaScript runtime error detected')
        return { status: 200, success: false, error: 'Runtime Error' }
      }
      
      if (text.includes('Module not found')) {
        console.log('   ❌ Module import error detected')
        return { status: 200, success: false, error: 'Import Error' }
      }
      
      console.log('   ✅ Page loaded successfully')
      return { status: 200, success: true }
    }
    
    console.log(`   ❌ HTTP Error: ${response.status}`)
    return { status: response.status, success: false }
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`)
    return { status: 0, success: false, error: error.message }
  }
}

async function testAPI(endpoint, method = 'GET', body = null, description = '') {
  console.log(`\n🔧 Testing API: ${description || endpoint}...`)
  
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
    
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log('   ✅ API call successful')
      return { status: response.status, data, success: true }
    } else {
      console.log(`   ❌ API call failed: ${data.error || 'Unknown error'}`)
      return { status: response.status, data, success: false }
    }
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}`)
    return { status: 0, data: { error: error.message }, success: false }
  }
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE AUTHENTICATION SYSTEM TEST')
  console.log('=' .repeat(60))
  
  // Test server connection
  console.log('\n🌐 TESTING SERVER CONNECTION')
  const serverTest = await testPage('/', 'Homepage')
  if (!serverTest.success) {
    console.log('\n❌ Server is not running or has issues.')
    console.log('Please ensure the development server is running: npm run dev')
    return
  }
  
  // Test API endpoints
  console.log('\n🔧 TESTING API ENDPOINTS')
  
  await testAPI('/api/admin/auth', 'POST', {
    username: 'invalid',
    password: 'invalid'
  }, 'Admin Auth - Invalid Credentials')
  
  await testAPI('/api/admin/auth', 'POST', {
    username: 'admin',
    password: 'admin123'
  }, 'Admin Auth - Valid Credentials')
  
  await testAPI('/api/system-health', 'GET', null, 'System Health Check')
  
  // Test authentication pages
  console.log('\n📄 TESTING AUTHENTICATION PAGES')
  
  const authPages = [
    ['/auth/sign-in', 'User Sign In Page'],
    ['/auth/sign-up', 'User Sign Up Page'],
    ['/admin/login', 'Admin Login Page'],
    ['/auth-test', 'Auth Test Page']
  ]
  
  const authResults = []
  for (const [path, description] of authPages) {
    const result = await testPage(path, description)
    authResults.push({ path, description, ...result })
  }
  
  // Test protected pages
  console.log('\n🔒 TESTING PROTECTED PAGES')
  
  const protectedPages = [
    ['/dashboard', 'User Dashboard'],
    ['/admin', 'Admin Dashboard'],
    ['/dashboard/create-exam', 'Create Exam Page'],
    ['/admin/users', 'Admin Users Page']
  ]
  
  const protectedResults = []
  for (const [path, description] of protectedPages) {
    const result = await testPage(path, description)
    protectedResults.push({ path, description, ...result })
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(60))
  
  console.log('\n🔐 Authentication Pages:')
  authResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`   ${status} ${result.description} (${result.status})`)
    if (result.error) {
      console.log(`      Error: ${result.error}`)
    }
    if (result.redirect) {
      console.log(`      Redirects to: ${result.redirect}`)
    }
  })
  
  console.log('\n🔒 Protected Pages:')
  protectedResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`   ${status} ${result.description} (${result.status})`)
    if (result.error) {
      console.log(`      Error: ${result.error}`)
    }
    if (result.redirect) {
      console.log(`      Redirects to: ${result.redirect}`)
    }
  })
  
  // Identify issues
  console.log('\n🔍 IDENTIFIED ISSUES:')
  const issues = []
  
  authResults.forEach(result => {
    if (!result.success) {
      issues.push(`${result.description}: ${result.error || 'Failed to load'}`)
    }
  })
  
  protectedResults.forEach(result => {
    if (!result.success && !result.redirect) {
      issues.push(`${result.description}: Should redirect to login but doesn't`)
    }
  })
  
  if (issues.length === 0) {
    console.log('   🎉 No issues found! Authentication system is working correctly.')
  } else {
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
  }
  
  console.log('\n📋 NEXT STEPS:')
  console.log('1. Visit http://localhost:3000/auth-test to manually test auth')
  console.log('2. Try signing up: http://localhost:3000/auth/sign-up')
  console.log('3. Try signing in: http://localhost:3000/auth/sign-in')
  console.log('4. Try admin login: http://localhost:3000/admin/login')
  console.log('5. Check protected pages redirect properly when not authenticated')
}

runComprehensiveTest().catch(console.error)