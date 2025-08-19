async function testAdminBypass() {
  try {
    console.log('Testing admin bypass page...');
    
    const response = await fetch('http://localhost:3000/admin-bypass');
    const html = await response.text();
    
    console.log('Response status:', response.status);
    console.log('HTML length:', html.length);
    
    if (html.includes('Admin Bypass Page')) {
      console.log('✅ Admin bypass page content found');
    } else {
      console.log('❌ Admin bypass page content NOT found');
    }
    
    if (html.includes('Hydration') || html.includes('hydration')) {
      console.log('⚠️  Hydration error detected');
    } else {
      console.log('✅ No hydration errors detected');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAdminBypass();