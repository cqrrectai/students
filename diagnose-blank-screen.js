// Diagnose Blank Screen Issue
const fs = require('fs');

console.log('🔍 Diagnosing Dashboard Blank Screen Issue...\n');

// Test 1: Check if auth context exists and is valid
console.log('1. Checking Authentication Context...');
try {
  const authContent = fs.readFileSync('lib/auth-context.tsx', 'utf8');
  
  const hasUseAuth = authContent.includes('export const useAuth');
  const hasAuthProvider = authContent.includes('export const AuthProvider') || authContent.includes('export function AuthProvider');
  const hasUserState = authContent.includes('user') && authContent.includes('useState');
  const hasLoadingState = authContent.includes('loading') && authContent.includes('useState');
  
  console.log('   📊 Auth context status:');
  console.log('   - useAuth hook exists:', hasUseAuth ? '✅' : '❌');
  console.log('   - AuthProvider exists:', hasAuthProvider ? '✅' : '❌');
  console.log('   - User state management:', hasUserState ? '✅' : '❌');
  console.log('   - Loading state management:', hasLoadingState ? '✅' : '❌');
  
  if (!hasUseAuth || !hasAuthProvider) {
    console.log('   ⚠️  Auth context issues detected!');
  }
  
} catch (error) {
  console.log('   ❌ Error reading auth context:', error.message);
}

// Test 2: Check if layout has proper providers
console.log('\n2. Checking Root Layout...');
try {
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  
  const hasAuthProvider = layoutContent.includes('AuthProvider');
  const hasGlobalDataProvider = layoutContent.includes('GlobalDataProvider');
  const hasProperStructure = layoutContent.includes('<html') && layoutContent.includes('<body');
  
  console.log('   📊 Layout status:');
  console.log('   - AuthProvider wrapped:', hasAuthProvider ? '✅' : '❌');
  console.log('   - GlobalDataProvider wrapped:', hasGlobalDataProvider ? '✅' : '❌');
  console.log('   - Proper HTML structure:', hasProperStructure ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error reading layout:', error.message);
}

// Test 3: Check dashboard file syntax
console.log('\n3. Checking Dashboard File Syntax...');
try {
  const dashboardContent = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
  
  // Basic syntax validation
  const hasUseClient = dashboardContent.includes('"use client"');
  const hasExportDefault = dashboardContent.includes('export default');
  const hasReturn = dashboardContent.includes('return');
  const hasValidJSX = dashboardContent.includes('<div') && dashboardContent.includes('</div>');
  
  // Check for common issues
  const hasUnmatchedBraces = (dashboardContent.match(/{/g) || []).length !== (dashboardContent.match(/}/g) || []).length;
  const hasUnmatchedParens = (dashboardContent.match(/\(/g) || []).length !== (dashboardContent.match(/\)/g) || []).length;
  
  console.log('   📊 Dashboard syntax:');
  console.log('   - "use client" directive:', hasUseClient ? '✅' : '❌');
  console.log('   - Export default:', hasExportDefault ? '✅' : '❌');
  console.log('   - Return statement:', hasReturn ? '✅' : '❌');
  console.log('   - Valid JSX:', hasValidJSX ? '✅' : '❌');
  console.log('   - Unmatched braces:', hasUnmatchedBraces ? '⚠️  Found' : '✅ None');
  console.log('   - Unmatched parentheses:', hasUnmatchedParens ? '⚠️  Found' : '✅ None');
  
} catch (error) {
  console.log('   ❌ Error reading dashboard:', error.message);
}

// Test 4: Check for import issues
console.log('\n4. Checking Import Dependencies...');
const requiredFiles = [
  'lib/auth-context.tsx',
  'app/layout.tsx',
  'lib/global-data-context.tsx'
];

requiredFiles.forEach(file => {
  try {
    fs.accessSync(file);
    console.log(`   ✅ ${file}: Found`);
  } catch (error) {
    console.log(`   ❌ ${file}: Missing or inaccessible`);
  }
});

// Test 5: Check Next.js configuration
console.log('\n5. Checking Next.js Configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasNextJs = packageJson.dependencies && packageJson.dependencies.next;
  const hasReact = packageJson.dependencies && packageJson.dependencies.react;
  const hasDevScript = packageJson.scripts && packageJson.scripts.dev;
  
  console.log('   📊 Next.js setup:');
  console.log('   - Next.js installed:', hasNextJs ? '✅' : '❌');
  console.log('   - React installed:', hasReact ? '✅' : '❌');
  console.log('   - Dev script exists:', hasDevScript ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

console.log('\n📋 Diagnosis Summary:');
console.log('The minimal dashboard version should help identify the issue:');
console.log('- If minimal version shows: Issue is with complex components/auth');
console.log('- If minimal version is blank: Issue is with routing/build system');
console.log('- Check browser console for specific error messages');

console.log('\n🔧 Troubleshooting Steps:');
console.log('1. Check browser console for JavaScript errors');
console.log('2. Verify development server is running on correct port');
console.log('3. Try hard refresh (Ctrl+Shift+R)');
console.log('4. Clear browser cache and cookies');
console.log('5. Check if other pages load correctly');

console.log('\n✅ Diagnosis completed!');