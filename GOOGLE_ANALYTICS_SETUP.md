# Google Analytics Integration Setup Guide

This guide will help you set up Google Analytics integration with your application.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Analytics 4 (GA4) property
3. Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Analytics Data API v1:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click on it and press "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen:
   - User Type: External (or Internal if you have Google Workspace)
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
   - Add scopes: `https://www.googleapis.com/auth/analytics.readonly`
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Your app name
   - Authorized redirect URIs: Add your callback URL (e.g., `http://localhost:3000/callback`)
5. Note down the Client ID and Client Secret

## Step 3: Get Your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to "Admin" > "Property Settings"
4. Copy the Property ID (format: `123456789`)

## Step 4: Configure Environment Variables

Create a `.env` file in your project root (if not already present) and add:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/callback
```

## Step 5: Using the Analytics Dashboard

1. Start your application:
   ```bash
   npm run dev
   ```

2. Navigate to the Analytics Dashboard:
   - Go to `http://localhost:3000/analytics`
   - Or click "Analytics Dashboard" in the main navigation

3. Configure your credentials:
   - Enter your Google OAuth Client ID
   - Enter your Google OAuth Client Secret
   - Enter your redirect URI
   - Enter your GA4 Property ID

4. Authenticate with Google:
   - Click "Authenticate with Google"
   - Complete the OAuth flow
   - Grant the necessary permissions

5. View your analytics data:
   - The dashboard will automatically fetch and display your analytics data
   - Use the date range selector to view different periods
   - Switch between different views (Overview, Top Pages, Real-time)

## API Endpoints

The following API endpoints are available:

### Authentication
- `POST /api/analytics/auth-url` - Generate OAuth authorization URL
- `POST /api/analytics/tokens` - Exchange authorization code for tokens

### Analytics Data
- `POST /api/analytics/data` - Get basic analytics data
- `POST /api/analytics/realtime` - Get real-time analytics data
- `POST /api/analytics/top-pages` - Get top pages by page views
- `POST /api/analytics/demographics` - Get user demographics
- `POST /api/analytics/traffic-sources` - Get traffic sources

## Request Examples

### Get Analytics Data
```javascript
const response = await fetch('/api/analytics/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    redirectUri: 'your_redirect_uri',
    refreshToken: 'your_refresh_token',
    propertyId: 'your_property_id',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});

const data = await response.json();
```

### Get Real-time Data
```javascript
const response = await fetch('/api/analytics/realtime', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    redirectUri: 'your_redirect_uri',
    refreshToken: 'your_refresh_token',
    propertyId: 'your_property_id'
  })
});

const data = await response.json();
```

## Features

The analytics dashboard includes:

- **Real-time Analytics**: View current active users and page views
- **Historical Data**: Analyze trends over time with customizable date ranges
- **Top Pages**: See your most visited pages
- **User Demographics**: Understand your audience
- **Traffic Sources**: See where your traffic comes from
- **Interactive Charts**: Visualize data with line charts and bar charts
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:
   - Verify your Client ID and Client Secret are correct
   - Ensure the redirect URI matches exactly
   - Check that the Google Analytics Data API is enabled

2. **"Property not found" error**:
   - Verify your Property ID is correct
   - Ensure you have access to the GA4 property
   - Check that the property is a GA4 property (not Universal Analytics)

3. **"Insufficient permissions" error**:
   - Ensure you've granted the necessary scopes during OAuth
   - Check that your Google account has access to the GA4 property

4. **No data showing**:
   - Verify your GA4 property has data
   - Check the date range you've selected
   - Ensure the property is properly configured

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Google Cloud Console settings
3. Ensure your GA4 property is properly set up
4. Check that you have the necessary permissions

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive configuration
- Implement proper session management for production use
- Consider implementing rate limiting for API calls
- Store refresh tokens securely

## Production Deployment

For production deployment:

1. Update the redirect URI to your production domain
2. Set up proper environment variables
3. Implement secure token storage
4. Add rate limiting and error handling
5. Set up monitoring and logging
6. Consider implementing caching for analytics data

## Additional Resources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GA4 Property Setup Guide](https://support.google.com/analytics/answer/10089681)