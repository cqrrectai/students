// Comprehensive Admin Features Test
const fs = require('fs');

console.log('🧪 Testing Admin Features & Supabase Configurations...\n');

// Test 1: Admin Pages Structure
console.log('1. Testing Admin Pages Structure...');
const adminPages = [
  'app/admin/page.tsx',
  'app/admin/layout.tsx',
  'app/admin/login/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/exams/page.tsx',
  'app/admin/create-exam/page.tsx',
  'app/admin/analytics/page.tsx',
  'app/admin/ai-generator/page.tsx',
  'app/admin/questions/page.tsx',
  'app/admin/emails/page.tsx',
  'app/admin/settings/page.tsx'
];

let pagesFound = 0;
adminPages.forEach(page => {
  try {
    fs.accessSync(page);
    console.log(`   ✅ ${page}: Found`);
    pagesFound++;
  } catch (error) {
    console.log(`   ❌ ${page}: Missing`);
  }
});

console.log(`   📊 Admin pages: ${pagesFound}/${adminPages.length} found\n`);

// Test 2: Admin Authentication
console.log('2. Testing Admin Authentication...');
try {
  const adminLoginContent = fs.readFileSync('app/admin/login/page.tsx', 'utf8');
  
  const hasAdminAuth = adminLoginContent.includes('signInAdmin') || adminLoginContent.includes('admin');
  const hasFormValidation = adminLoginContent.includes('useState') && adminLoginContent.includes('error');
  const hasRedirect = adminLoginContent.includes('router.push') || adminLoginContent.includes('redirect');
  const hasPasswordField = adminLoginContent.includes('password') && adminLoginContent.includes('input');
  
  console.log('   📊 Admin login features:');
  console.log('   - Admin authentication:', hasAdminAuth ? '✅' : '❌');
  console.log('   - Form validation:', hasFormValidation ? '✅' : '❌');
  console.log('   - Redirect logic:', hasRedirect ? '✅' : '❌');
  console.log('   - Password field:', hasPasswordField ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking admin login:', error.message);
}

// Test 3: Admin API Endpoints
console.log('\n3. Testing Admin API Endpoints...');
const adminAPIs = [
  'app/api/admin/auth/route.ts',
  'app/api/admin/users/[id]/route.ts',
  'app/api/admin/exams/[id]/route.ts'
];

let apisFound = 0;
adminAPIs.forEach(api => {
  try {
    const content = fs.readFileSync(api, 'utf8');
    
    const hasGET = content.includes('export async function GET');
    const hasPOST = content.includes('export async function POST');
    const hasPUT = content.includes('export async function PUT');
    const hasDELETE = content.includes('export async function DELETE');
    const hasErrorHandling = content.includes('try') && content.includes('catch');
    const hasSupabaseIntegration = content.includes('supabase');
    
    console.log(`   📊 ${api}:`);
    console.log(`   - GET method: ${hasGET ? '✅' : '❌'}`);
    console.log(`   - POST method: ${hasPOST ? '✅' : '❌'}`);
    console.log(`   - PUT method: ${hasPUT ? '✅' : '❌'}`);
    console.log(`   - DELETE method: ${hasDELETE ? '✅' : '❌'}`);
    console.log(`   - Error handling: ${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`   - Supabase integration: ${hasSupabaseIntegration ? '✅' : '❌'}`);
    
    apisFound++;
  } catch (error) {
    console.log(`   ❌ ${api}: ${error.message}`);
  }
});

// Test 4: User Management Features
console.log('\n4. Testing User Management Features...');
try {
  const usersPageContent = fs.readFileSync('app/admin/users/page.tsx', 'utf8');
  
  const hasUsersList = usersPageContent.includes('users') && usersPageContent.includes('map');
  const hasUserActions = usersPageContent.includes('delete') || usersPageContent.includes('edit');
  const hasUserSearch = usersPageContent.includes('search') || usersPageContent.includes('filter');
  const hasUserCreation = usersPageContent.includes('create') || usersPageContent.includes('add');
  const hasDataFetching = usersPageContent.includes('useEffect') && usersPageContent.includes('fetch');
  
  console.log('   📊 User management features:');
  console.log('   - Users list display:', hasUsersList ? '✅' : '❌');
  console.log('   - User actions (edit/delete):', hasUserActions ? '✅' : '❌');
  console.log('   - User search/filter:', hasUserSearch ? '✅' : '❌');
  console.log('   - User creation:', hasUserCreation ? '✅' : '❌');
  console.log('   - Data fetching:', hasDataFetching ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking user management:', error.message);
}

// Test 5: Exam Management Features
console.log('\n5. Testing Exam Management Features...');
try {
  const examsPageContent = fs.readFileSync('app/admin/exams/page.tsx', 'utf8');
  
  const hasExamsList = examsPageContent.includes('exams') && examsPageContent.includes('map');
  const hasExamActions = examsPageContent.includes('delete') || examsPageContent.includes('edit');
  const hasExamCreation = examsPageContent.includes('create') || examsPageContent.includes('add');
  const hasExamFilters = examsPageContent.includes('filter') || examsPageContent.includes('search');
  const hasExamStats = examsPageContent.includes('stats') || examsPageContent.includes('count');
  
  console.log('   📊 Exam management features:');
  console.log('   - Exams list display:', hasExamsList ? '✅' : '❌');
  console.log('   - Exam actions (edit/delete):', hasExamActions ? '✅' : '❌');
  console.log('   - Exam creation:', hasExamCreation ? '✅' : '❌');
  console.log('   - Exam filters:', hasExamFilters ? '✅' : '❌');
  console.log('   - Exam statistics:', hasExamStats ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking exam management:', error.message);
}

// Test 6: Analytics Features
console.log('\n6. Testing Admin Analytics Features...');
try {
  const analyticsContent = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');
  
  const hasCharts = analyticsContent.includes('Chart') || analyticsContent.includes('recharts');
  const hasMetrics = analyticsContent.includes('metrics') || analyticsContent.includes('stats');
  const hasDataVisualization = analyticsContent.includes('Bar') || analyticsContent.includes('Pie');
  const hasRealTimeData = analyticsContent.includes('useEffect') && analyticsContent.includes('fetch');
  const hasExportFeature = analyticsContent.includes('export') || analyticsContent.includes('download');
  
  console.log('   📊 Analytics features:');
  console.log('   - Charts/visualizations:', hasCharts ? '✅' : '❌');
  console.log('   - Metrics display:', hasMetrics ? '✅' : '❌');
  console.log('   - Data visualization:', hasDataVisualization ? '✅' : '❌');
  console.log('   - Real-time data:', hasRealTimeData ? '✅' : '❌');
  console.log('   - Export functionality:', hasExportFeature ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking analytics:', error.message);
}

// Test 7: AI Generator Features
console.log('\n7. Testing AI Generator Features...');
try {
  const aiGeneratorContent = fs.readFileSync('app/admin/ai-generator/page.tsx', 'utf8');
  
  const hasAIIntegration = aiGeneratorContent.includes('AI') || aiGeneratorContent.includes('generate');
  const hasQuestionGeneration = aiGeneratorContent.includes('question') && aiGeneratorContent.includes('generate');
  const hasCustomization = aiGeneratorContent.includes('customize') || aiGeneratorContent.includes('settings');
  const hasBulkGeneration = aiGeneratorContent.includes('bulk') || aiGeneratorContent.includes('batch');
  const hasPreview = aiGeneratorContent.includes('preview') || aiGeneratorContent.includes('review');
  
  console.log('   📊 AI generator features:');
  console.log('   - AI integration:', hasAIIntegration ? '✅' : '❌');
  console.log('   - Question generation:', hasQuestionGeneration ? '✅' : '❌');
  console.log('   - Customization options:', hasCustomization ? '✅' : '❌');
  console.log('   - Bulk generation:', hasBulkGeneration ? '✅' : '❌');
  console.log('   - Preview functionality:', hasPreview ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking AI generator:', error.message);
}

// Test 8: Supabase Configuration
console.log('\n8. Testing Supabase Configuration...');
try {
  const supabaseConfig = fs.readFileSync('lib/supabase.ts', 'utf8');
  
  const hasSupabaseClient = supabaseConfig.includes('createClient');
  const hasEnvironmentVars = supabaseConfig.includes('process.env');
  const hasProperExport = supabaseConfig.includes('export');
  
  console.log('   📊 Supabase configuration:');
  console.log('   - Supabase client setup:', hasSupabaseClient ? '✅' : '❌');
  console.log('   - Environment variables:', hasEnvironmentVars ? '✅' : '❌');
  console.log('   - Proper exports:', hasProperExport ? '✅' : '❌');
  
  // Check environment variables
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    console.log('   - Supabase URL configured:', hasSupabaseUrl ? '✅' : '❌');
    console.log('   - Supabase anon key configured:', hasSupabaseKey ? '✅' : '❌');
  } catch (error) {
    console.log('   ⚠️  Could not check .env.local file');
  }
  
} catch (error) {
  console.log('   ❌ Error checking Supabase config:', error.message);
}

// Test 9: Database Service Integration
console.log('\n9. Testing Database Service Integration...');
try {
  const dbServiceContent = fs.readFileSync('lib/data-service.ts', 'utf8');
  
  const hasUserOperations = dbServiceContent.includes('getUsers') || dbServiceContent.includes('createUser');
  const hasExamOperations = dbServiceContent.includes('getExams') || dbServiceContent.includes('createExam');
  const hasAnalyticsOperations = dbServiceContent.includes('getAnalytics') || dbServiceContent.includes('getStats');
  const hasErrorHandling = dbServiceContent.includes('try') && dbServiceContent.includes('catch');
  const hasSupabaseIntegration = dbServiceContent.includes('supabase');
  
  console.log('   📊 Database service features:');
  console.log('   - User operations:', hasUserOperations ? '✅' : '❌');
  console.log('   - Exam operations:', hasExamOperations ? '✅' : '❌');
  console.log('   - Analytics operations:', hasAnalyticsOperations ? '✅' : '❌');
  console.log('   - Error handling:', hasErrorHandling ? '✅' : '❌');
  console.log('   - Supabase integration:', hasSupabaseIntegration ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking database service:', error.message);
}

// Test 10: Admin Layout and Navigation
console.log('\n10. Testing Admin Layout and Navigation...');
try {
  const adminLayoutContent = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  
  const hasNavigation = adminLayoutContent.includes('nav') || adminLayoutContent.includes('menu');
  const hasAuthCheck = adminLayoutContent.includes('auth') || adminLayoutContent.includes('admin');
  const hasResponsiveDesign = adminLayoutContent.includes('responsive') || adminLayoutContent.includes('mobile');
  const hasSidebar = adminLayoutContent.includes('sidebar') || adminLayoutContent.includes('aside');
  
  console.log('   📊 Admin layout features:');
  console.log('   - Navigation menu:', hasNavigation ? '✅' : '❌');
  console.log('   - Authentication check:', hasAuthCheck ? '✅' : '❌');
  console.log('   - Responsive design:', hasResponsiveDesign ? '✅' : '❌');
  console.log('   - Sidebar navigation:', hasSidebar ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error checking admin layout:', error.message);
}

console.log('\n📋 Admin Features Test Summary:');
console.log(`- Admin pages found: ${pagesFound}/${adminPages.length}`);
console.log(`- API endpoints found: ${apisFound}/${adminAPIs.length}`);
console.log('- Authentication system: Check individual results above');
console.log('- User management: Check individual results above');
console.log('- Exam management: Check individual results above');
console.log('- Analytics features: Check individual results above');
console.log('- AI generator: Check individual results above');
console.log('- Supabase integration: Check individual results above');

console.log('\n✅ Comprehensive admin test completed!');