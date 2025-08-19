// Test the sign-in flow specifically
// Run this with: node test-sign-in-flow.js

const BASE_URL = 'http://localhost:3000'

async function testSignInFlow() {
    console.log('🧪 Testing Sign-In Flow')
    console.log('='.repeat(40))

    // Test if server is running
    console.log('\n1. Testing server connection...')
    try {
        const response = await fetch(BASE_URL)
        if (!response.ok) {
            console.log('❌ Server is not running. Please start with: npm run dev')
            return
        }
        console.log('✅ Server is running')
    } catch (error) {
        console.log('❌ Server is not accessible:', error.message)
        return
    }

    // Test sign-in page loads
    console.log('\n2. Testing sign-in page...')
    try {
        const response = await fetch(`${BASE_URL}/auth/sign-in`)
        if (response.ok) {
            console.log('✅ Sign-in page loads correctly')
        } else {
            console.log('❌ Sign-in page failed to load:', response.status)
            return
        }
    } catch (error) {
        console.log('❌ Error loading sign-in page:', error.message)
        return
    }

    // Test dashboard page (should be accessible)
    console.log('\n3. Testing dashboard page...')
    try {
        const response = await fetch(`${BASE_URL}/dashboard`)
        if (response.ok) {
            console.log('✅ Dashboard page loads correctly')
        } else {
            console.log('❌ Dashboard page failed to load:', response.status)
        }
    } catch (error) {
        console.log('❌ Error loading dashboard page:', error.message)
    }

    // Test auth-test page for debugging
    console.log('\n4. Testing auth-test page...')
    try {
        const response = await fetch(`${BASE_URL}/auth-test`)
        if (response.ok) {
            console.log('✅ Auth-test page loads correctly')
        } else {
            console.log('❌ Auth-test page failed to load:', response.status)
        }
    } catch (error) {
        console.log('❌ Error loading auth-test page:', error.message)
    }

    console.log('\n' + '='.repeat(40))
    console.log('📋 Manual Testing Steps:')
    console.log('1. Open browser to: http://localhost:3000/auth/sign-in')
    console.log('2. Open browser console (F12)')
    console.log('3. Try signing in with: test@example.com / testpassword123')
    console.log('4. Watch console for debug messages')
    console.log('5. Check if redirect to dashboard happens')
    console.log('6. If redirect fails, try visiting: http://localhost:3000/auth-test')
    console.log('   to see current auth state')

    console.log('\n🔧 Debugging Tips:')
    console.log('- Check browser console for errors')
    console.log('- Check Network tab for failed requests')
    console.log('- Verify Supabase credentials in .env.local')
    console.log('- Try creating a new user via sign-up first')
}

testSignInFlow().catch(console.error)