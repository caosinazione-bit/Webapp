import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Ui/card';
import { Button } from './Ui/button';
import { Input } from './Ui/input';
import { Label } from './Ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Ui/tabs';
import { Badge } from './Ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Calendar,
  Settings,
  RefreshCw,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
}

interface TopPage {
  pagePath: string;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
}

interface AnalyticsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    refreshToken: ''
  });
  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/auth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const { authUrl } = await response.json();
      window.open(authUrl, '_blank');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExchange = async (code: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, code })
      });
      
      const tokens = await response.json();
      setConfig(prev => ({ ...prev, refreshToken: tokens.refresh_token }));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token exchange error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!propertyId || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          propertyId,
          startDate,
          endDate
        })
      });
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPages = async () => {
    if (!propertyId || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/top-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          propertyId,
          startDate,
          endDate,
          limit: 10
        })
      });
      
      const data = await response.json();
      setTopPages(data);
    } catch (error) {
      console.error('Top pages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    if (!propertyId) return;
    
    try {
      const response = await fetch('/api/analytics/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          propertyId
        })
      });
      
      const data = await response.json();
      setRealTimeData(data);
    } catch (error) {
      console.error('Real-time data error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      fetchAnalyticsData();
      fetchTopPages();
      fetchRealTimeData();
      
      // Set up real-time data refresh
      const interval = setInterval(fetchRealTimeData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, propertyId, startDate, endDate]);

  const totalSessions = analyticsData.reduce((sum, item) => sum + item.sessions, 0);
  const totalUsers = analyticsData.reduce((sum, item) => sum + item.users, 0);
  const totalPageViews = analyticsData.reduce((sum, item) => sum + item.pageViews, 0);
  const avgBounceRate = analyticsData.length > 0 
    ? analyticsData.reduce((sum, item) => sum + item.bounceRate, 0) / analyticsData.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Google Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your website performance and user behavior</p>
        </div>
        <Button onClick={fetchAnalyticsData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
          <CardDescription>Set up your Google Analytics credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={config.clientId}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Enter your Google OAuth Client ID"
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={config.clientSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                placeholder="Enter your Google OAuth Client Secret"
              />
            </div>
            <div>
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                value={config.redirectUri}
                onChange={(e) => setConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
                placeholder="http://localhost:3000/callback"
              />
            </div>
            <div>
              <Label htmlFor="propertyId">Property ID</Label>
              <Input
                id="propertyId"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter your GA4 Property ID"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAuth} disabled={loading || !config.clientId || !config.clientSecret}>
              Authenticate with Google
            </Button>
            {isAuthenticated && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Connected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Label>Date Range:</Label>
            </div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <span>to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{totalPageViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{avgBounceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Sessions and users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessions" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages by Page Views</CardTitle>
              <CardDescription>Most visited pages in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pagePath" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pageViews" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
              <CardDescription>Current active users and page views</CardDescription>
            </CardHeader>
            <CardContent>
              {realTimeData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">
                        {realTimeData.totals?.[0]?.metricValues?.[0]?.value || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {realTimeData.totals?.[0]?.metricValues?.[1]?.value || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Page Views</p>
                    </div>
                  </div>
                  
                  {realTimeData.rows && realTimeData.rows.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Active Pages</h4>
                      <div className="space-y-2">
                        {realTimeData.rows.slice(0, 5).map((row: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="truncate">
                              {row.dimensionValues?.[0]?.value || 'Unknown'}
                            </span>
                            <Badge variant="secondary">
                              {row.metricValues?.[1]?.value || 0} views
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No real-time data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}