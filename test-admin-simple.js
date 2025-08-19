async function testAdminSimple() {
  try {
    console.log('Testing simple admin page...');
    
    const response = await fetch('http://localhost:3000/admin/simple');
    const html = await response.text();
    
    console.log('Response status:', response.status);
    console.log('HTML length:', html.length);
    
    if (html.includes('Simple Admin Page')) {
      console.log('✅ Simple admin page content found');
    } else {
      console.log('❌ Simple admin page content NOT found');
    }
    
    if (html.includes('Hydration') || html.includes('hydration')) {
      console.log('⚠️  Hydration error detected');
    } else {
      console.log('✅ No hydration errors detected');
    }
    
    // Show first 500 chars if there's an issue
    if (!html.includes('Simple Admin Page')) {
      console.log('\nFirst 500 characters:');
      console.log(html.substring(0, 500));
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAdminSimple();