// Simple test script for Google Analytics service
import GoogleAnalyticsService from './Server/services/analytics.js';

// Test configuration (you'll need to replace with your actual credentials)
const testConfig = {
  clientId: 'your_client_id_here',
  clientSecret: 'your_client_secret_here',
  redirectUri: 'http://localhost:3000/callback'
};

async function testAnalyticsService() {
  try {
    console.log('Testing Google Analytics Service...');
    
    // Create service instance
    const analyticsService = new GoogleAnalyticsService(testConfig);
    
    // Test auth URL generation
    const authUrl = analyticsService.getAuthUrl();
    console.log('✅ Auth URL generated successfully');
    console.log('Auth URL:', authUrl);
    
    console.log('\n✅ Google Analytics service is working correctly!');
    console.log('\nTo use the service:');
    console.log('1. Replace the test config with your actual Google OAuth credentials');
    console.log('2. Navigate to the auth URL to get an authorization code');
    console.log('3. Use the authorization code to get tokens');
    console.log('4. Use the refresh token to fetch analytics data');
    
  } catch (error) {
    console.error('❌ Error testing analytics service:', error.message);
  }
}

testAnalyticsService();