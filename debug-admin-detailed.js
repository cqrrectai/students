async function debugAdminDetailed() {
  try {
    console.log('Detailed admin page debugging...');
    
    const response = await fetch('http://localhost:3000/admin');
    const html = await response.text();
    
    console.log('Response status:', response.status);
    console.log('HTML length:', html.length);
    
    // Check for specific patterns
    const patterns = [
      { name: 'HTML structure', pattern: /<html/i },
      { name: 'Body tag', pattern: /<body/i },
      { name: 'React root', pattern: /id="__next"/i },
      { name: 'Dashboard component', pattern: /AdminDashboard/i },
      { name: 'Loading state', pattern: /Loading\.\.\./i },
      { name: 'Error boundary', pattern: /Error|error/i },
      { name: 'JavaScript errors', pattern: /SyntaxError|TypeError|ReferenceError/i },
      { name: 'Next.js scripts', pattern: /_next\/static/i },
      { name: 'CSS styles', pattern: /\.css/i }
    ];
    
    patterns.forEach(pattern => {
      const found = pattern.pattern.test(html);
      console.log(`${found ? '✅' : '❌'} ${pattern.name}: ${found}`);
    });
    
    // Look for the main content area
    const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1];
      console.log('\nBody content length:', bodyContent.length);
      
      // Check if body is mostly empty
      const textContent = bodyContent.replace(/<[^>]*>/g, '').trim();
      console.log('Text content length:', textContent.length);
      console.log('First 200 chars of text:', textContent.substring(0, 200));
    }
    
    // Check for specific error messages
    if (html.includes('ChunkLoadError') || html.includes('Loading chunk')) {
      console.log('⚠️  Chunk loading error detected');
    }
    
    if (html.includes('Hydration') || html.includes('hydration')) {
      console.log('⚠️  Hydration error detected');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugAdminDetailed();