"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  Activity,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Globe,
  ShoppingCart,
  Calendar,
  Bell,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Star,
  Briefcase,
  PieChart,
  LineChart
} from 'lucide-react';

// Executive dashboard metrics
const executiveMetrics = [
  {
    title: 'Total Employees',
    value: '5',
    change: '+12%',
    trend: 'up',
    icon: Users,
    subtitle: ''
  },
  {
    title: 'Active Employees',
    value: '5',
    change: '+5%',
    trend: 'up',
    icon: CheckCircle,
    subtitle: ''
  },
  {
    title: 'Total Tasks',
    value: '1',
    change: '+8%',
    trend: 'up',
    icon: Activity,
    subtitle: ''
  },
  {
    title: "Today's Attendance",
    value: '0',
    change: '+3%',
    trend: 'up',
    icon: Clock,
    subtitle: ''
  },
  {
    title: 'Pending Tasks',
    value: '1',
    change: '',
    trend: 'up',
    icon: Clock,
    subtitle: ''
  },
  {
    title: 'Completed Tasks',
    value: '0',
    change: '',
    trend: 'up',
    icon: CheckCircle,
    subtitle: ''
  },
  {
    title: 'Active Announcements',
    value: '1',
    change: '',
    trend: 'up',
    icon: Bell,
    subtitle: ''
  }
];

// Market segments data
const marketSegments = [
  { name: 'Technology', value: 35, color: '#ea580c' },
  { name: 'Healthcare', value: 28, color: '#f97316' },
  { name: 'Finance', value: 22, color: '#fb923c' },
  { name: 'Retail', value: 15, color: '#fed7aa' }
];

// Executive insights data
const executiveInsights = [
  {
    id: 1,
    title: 'Q4 Revenue Target',
    description: 'On track to exceed quarterly goals',
    progress: 87,
    priority: 'high' as const,
    dueDate: '2024-12-31',
    assignee: 'Finance Team',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Market Expansion',
    description: 'New market penetration strategy',
    progress: 65,
    priority: 'medium' as const,
    dueDate: '2024-11-15',
    assignee: 'Strategy Team',
    status: 'Planning'
  },
  {
    id: 3,
    title: 'Digital Transformation',
    description: 'Technology infrastructure upgrade',
    progress: 42,
    priority: 'high' as const,
    dueDate: '2024-10-30',
    assignee: 'IT Department',
    status: 'In Progress'
  }
];

// Top products data
const topProducts = [
  { name: 'Enterprise Suite', revenue: '$2.4M', growth: '+15%', trend: 'up' as const },
  { name: 'Cloud Platform', revenue: '$1.8M', growth: '+22%', trend: 'up' as const },
  { name: 'Analytics Pro', revenue: '$1.2M', growth: '+8%', trend: 'up' as const },
  { name: 'Mobile App', revenue: '$950K', growth: '-3%', trend: 'down' as const }
];

// Advanced circular progress component
const AdvancedProgress = ({ percentage, size = 120, color = '#ea580c' }: { percentage: number; size?: number; color?: string }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

// Market segment chart component
const MarketSegmentChart = ({ segments }: { segments: { name: string; value: number; color: string; }[] }) => {
  const maxValue = Math.max(...segments.map(s => s.value));
  
  return (
    <div className="space-y-3">
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{segment.name}</span>
              <span className="text-sm font-semibold text-gray-900">{segment.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${(segment.value / maxValue) * 100}%`,
                  backgroundColor: segment.color 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Insight card component
const InsightCard = ({ insight }: { insight: { 
  id: number;
  title: string;
  description: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  status: string;
} }) => {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
        </div>
        <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
          {insight.priority}
        </Badge>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-900">{insight.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${insight.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{insight.assignee}</span>
        <span>{new Date(insight.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated (fallback, middleware should handle this)
  if (!isSignedIn) {
    window.location.href = '/sign-in';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
        <div className="max-w-7xl mx-auto">
          <main className="space-y-6">
            {/* Dashboard Header - Compact */}
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-xs text-gray-600">Welcome back to <span className="font-semibold text-orange-600">Business Ventures ERP</span></p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">Saturday, August 9, 2025</p>
                    <p className="text-xs text-gray-500">12:53 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Dashboard Metrics Grid */}
            <div className="space-y-4">
              {/* First Row - 4 metrics - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {executiveMetrics.slice(0, 4).map((metric, index) => {
                  const Icon = metric.icon;
                  const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: `${100 + (index * 50)}ms`, animationFillMode: 'forwards' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                        {metric.change && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <TrendIcon className="h-3 w-3" />
                            <span className="text-xs font-semibold">{metric.change}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-xs font-medium text-gray-600">{metric.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Second Row - 3 metrics - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {executiveMetrics.slice(4, 7).map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index + 4} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: `${300 + (index * 50)}ms`, animationFillMode: 'forwards' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-xs font-medium text-gray-600">{metric.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analytics Row - Compact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Portfolio Performance - Compact */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Portfolio Performance</h3>
                      <p className="text-xs text-gray-500 mt-1">Real-time monitoring</p>
                    </div>
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <AdvancedProgress percentage={94} size={80} color="#ea580c" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900">99.8%</p>
                      <p className="text-xs text-gray-500">Uptime</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">1.2s</p>
                      <p className="text-xs text-gray-500">Response</p>
                    </div>
                  </div>
                </div>

                {/* Market Segments - Compact */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Market Segments</h3>
                      <p className="text-xs text-gray-500 mt-1">Revenue distribution</p>
                    </div>
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                      <PieChart className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <MarketSegmentChart segments={marketSegments} />
                </div>

                {/* Top Products - Compact */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
                      <p className="text-xs text-gray-500 mt-1">Revenue leaders</p>
                    </div>
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {topProducts.map((product, index) => {
                      const TrendIcon = product.trend === 'up' ? TrendingUp : TrendingDown;
                      const trendColor = product.trend === 'up' ? 'text-green-600' : 'text-red-600';
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.revenue}</p>
                          </div>
                          <div className={`flex items-center space-x-1 ${trendColor}`}>
                            <TrendIcon className="h-3 w-3" />
                            <span className="text-xs font-semibold">{product.growth}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Executive Insights - Compact */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Executive Insights</h3>
                    <p className="text-xs text-gray-500 mt-1">Strategic initiatives overview</p>
                  </div>
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {executiveInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}