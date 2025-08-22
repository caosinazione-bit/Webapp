import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface AnalyticsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

interface AnalyticsData {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
}

class GoogleAnalyticsService {
  private oauth2Client: OAuth2Client;
  private analytics: any;
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    this.analytics = google.analyticsdata({
      version: 'v1beta',
      auth: this.oauth2Client
    });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  /**
   * Set credentials using refresh token
   */
  setCredentials(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
  }

  /**
   * Get basic analytics data for a property
   */
  async getAnalyticsData(propertyId: string, startDate: string, endDate: string): Promise<AnalyticsData[]> {
    try {
      const [response] = await this.analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'date' }
          ]
        }
      });

      if (!response.rows) {
        return [];
      }

      return response.rows.map(row => ({
        date: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0')
      }));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeData(propertyId: string) {
    try {
      const [response] = await this.analytics.properties.runRealtimeReport({
        property: `properties/${propertyId}`,
        requestBody: {
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' }
          ],
          dimensions: [
            { name: 'pagePath' }
          ]
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  /**
   * Get top pages by page views
   */
  async getTopPages(propertyId: string, startDate: string, endDate: string, limit: number = 10) {
    try {
      const [response] = await this.analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' }
          ],
          dimensions: [
            { name: 'pagePath' }
          ],
          limit
        }
      });

      if (!response.rows) {
        return [];
      }

      return response.rows.map(row => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        avgSessionDuration: parseFloat(row.metricValues?.[2]?.value || '0')
      }));
    } catch (error) {
      console.error('Error fetching top pages:', error);
      throw error;
    }
  }

  /**
   * Get user demographics
   */
  async getUserDemographics(propertyId: string, startDate: string, endDate: string) {
    try {
      const [response] = await this.analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'totalUsers' }
          ],
          dimensions: [
            { name: 'ageBracket' },
            { name: 'gender' }
          ]
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching user demographics:', error);
      throw error;
    }
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(propertyId: string, startDate: string, endDate: string) {
    try {
      const [response] = await this.analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' }
          ],
          dimensions: [
            { name: 'sessionDefaultChannelGroup' }
          ]
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      throw error;
    }
  }
}

export default GoogleAnalyticsService;
export type { AnalyticsConfig, AnalyticsData };