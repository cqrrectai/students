async function testAdminPage() {
  try {
    console.log('Testing admin page...');
    
    const response = await fetch('http://localhost:3000/admin');
    
    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const html = await response.text();
      console.log('HTML length:', html.length);
      
      // Check for key elements
      const checks = [
        { name: 'Dashboard title', pattern: /Dashboard/i },
        { name: 'Admin content', pattern: /admin/i },
        { name: 'Loading spinner', pattern: /animate-spin/i },
        { name: 'Error content', pattern: /error|Error/i },
        { name: 'Login redirect', pattern: /login/i }
      ];
      
      checks.forEach(check => {
        const found = check.pattern.test(html);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found}`);
      });
      
      // Show first 500 characters if it looks like an error
      if (html.includes('error') || html.includes('Error') || html.length < 1000) {
        console.log('\nFirst 500 characters:');
        console.log(html.substring(0, 500));
      }
      
    } else {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAdminPage();