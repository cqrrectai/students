async function testAdminAuth() {
  try {
    console.log('Testing admin authentication...');
    
    // Test admin login endpoint
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Admin login test:', loginResponse.status, loginResult.success ? 'SUCCESS' : 'FAILED');
    
    if (loginResult.success) {
      console.log('✅ Admin authentication is working');
      console.log('Admin user:', loginResult.admin.username);
    } else {
      console.log('❌ Admin authentication failed:', loginResult.error);
    }
    
    // Test admin login page
    const loginPageResponse = await fetch('http://localhost:3000/admin/login');
    console.log('Admin login page:', loginPageResponse.status, loginPageResponse.ok ? 'OK' : 'FAILED');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAdminAuth();