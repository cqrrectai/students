// Test the simple auth page functionality
// Run this with: node test-simple-auth-page.js

const BASE_URL = 'http://localhost:3000'

async function testSimpleAuthPage() {
  console.log('🧪 Testing Simple Auth Page Functionality')
  console.log('=' .repeat(50))
  
  try {
    // First, get the page
    console.log('\n📄 Fetching simple auth test page...')
    const response = await fetch(`${BASE_URL}/simple-auth-test`)
    const html = await response.text()
    
    if (response.status !== 200) {
      console.log(`❌ Page failed to load: ${response.status}`)
      return
    }
    
    console.log('✅ Page loaded successfully')
    
    // Check for key elements in the HTML
    const checks = [
      ['Auth Context Error', html.includes('Auth Context Error'), false],
      ['Auth Context Missing', html.includes('Auth Context Missing'), false],
      ['Current Auth State', html.includes('Current Auth State'), true],
      ['Test User Sign In', html.includes('Test User Sign In'), true],
      ['Test Admin Sign In', html.includes('Test Admin Sign In'), true],
      ['Debug Info', html.includes('Debug Info'), true],
      ['hasAuthContext', html.includes('hasAuthContext'), true]
    ]
    
    console.log('\n🔍 Checking page content...')
    let allGood = true
    
    for (const [name, found, shouldBePresent] of checks) {
      if (found === shouldBePresent) {
        console.log(`✅ ${name}: ${shouldBePresent ? 'Present' : 'Not present'} (as expected)`)
      } else {
        console.log(`❌ ${name}: ${found ? 'Present' : 'Not present'} (expected ${shouldBePresent ? 'present' : 'not present'})`)
        allGood = false
      }
    }
    
    if (allGood) {
      console.log('\n🎉 Simple auth page appears to be working correctly!')
      console.log('📋 Manual testing steps:')
      console.log('1. Visit http://localhost:3000/simple-auth-test')
      console.log('2. Check the "Current Auth State" section')
      console.log('3. Try clicking "Test User Sign In" button')
      console.log('4. Try clicking "Test Admin Sign In" button')
      console.log('5. Check the Debug Info section for auth context details')
    } else {
      console.log('\n⚠️  Some issues detected with the auth page')
    }
    
    // Try to extract some debug info from the HTML
    console.log('\n🔧 Extracting debug information...')
    
    // Look for JSON in the debug section
    const debugMatch = html.match(/"hasAuthContext":\s*(true|false)/);
    if (debugMatch) {
      console.log(`Auth Context Available: ${debugMatch[1]}`)
    }
    
    const loadingMatch = html.match(/"loading":\s*(true|false)/);
    if (loadingMatch) {
      console.log(`Auth Loading State: ${loadingMatch[1]}`)
    }
    
  } catch (error) {
    console.log(`❌ Error testing page: ${error.message}`)
  }
}

testSimpleAuthPage()