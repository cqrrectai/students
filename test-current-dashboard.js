// Test to see what's currently at /dashboard route
const { execSync } = require('child_process');

console.log('🔍 Testing current dashboard route...\n');

try {
  // Start the dev server in background
  console.log('Starting development server...');
  const serverProcess = execSync('npm run dev &', { encoding: 'utf8' });
  
  // Wait a bit for server to start
  setTimeout(() => {
    try {
      // Test the dashboard route
      const response = execSync('curl -s http://localhost:3000/dashboard', { encoding: 'utf8' });
      
      console.log('Dashboard route response (first 500 chars):');
      console.log('=' .repeat(50));
      console.log(response.substring(0, 500));
      console.log('=' .repeat(50));
      
      // Check if it contains specific elements from the screenshot
      const hasWelcomeBack = response.includes('Welcome back');
      const hasCreateExam = response.includes('Create Your Exam') || response.includes('Create Exam');
      const hasExamsCompleted = response.includes('Exams Completed');
      const hasAverageScore = response.includes('Average Score');
      const hasCurrentStreak = response.includes('Current Streak');
      
      console.log('\nElements found:');
      console.log('- Welcome back:', hasWelcomeBack ? '✅' : '❌');
      console.log('- Create Exam:', hasCreateExam ? '✅' : '❌');
      console.log('- Exams Completed:', hasExamsCompleted ? '✅' : '❌');
      console.log('- Average Score:', hasAverageScore ? '✅' : '❌');
      console.log('- Current Streak:', hasCurrentStreak ? '✅' : '❌');
      
    } catch (error) {
      console.log('❌ Error testing dashboard:', error.message);
    }
  }, 5000);
  
} catch (error) {
  console.log('❌ Error starting server:', error.message);
}

console.log('\nNote: This test starts the dev server. You may need to stop it manually with Ctrl+C');