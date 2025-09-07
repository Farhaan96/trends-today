'use client';

import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface RevenueMetrics {
  affiliateRevenue: {
    total: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    topProviders: Array<{
      provider: string;
      revenue: number;
      clicks: number;
    }>;
  };
  premiumRevenue: {
    total: number;
    subscriptions: number;
    churn: number;
    mrr: number;
    newSignups: number;
    cancellations: number;
  };
  adRevenue: {
    total: number;
    impressions: number;
    clicks: number;
    ctr: number;
    rpm: number;
  };
  totalRevenue: number;
  period: string;
  lastUpdated: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon, color, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-900 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change >= 0 ? (
            <ArrowUpIcon className="w-4 h-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-red-600 mr-1" />
          )}
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}% from last period
          </span>
        </div>
      )}
    </div>
  );
}

interface RevenueDashboardProps {
  className?: string;
  period?: '7d' | '30d' | '90d';
}

export default function RevenueDashboard({ className = '', period = '30d' }: RevenueDashboardProps) {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    fetchMetrics(selectedPeriod);
  }, [selectedPeriod]);

  const fetchMetrics = async (timePeriod: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/revenue-tracking?period=${timePeriod}&metric=all`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch revenue metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-800 mt-2">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-700">Failed to load revenue metrics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
          <p className="text-gray-800">Performance metrics for Trends Today monetization</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12.3}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="bg-green-600"
          subtitle={`Updated ${new Date(metrics.lastUpdated).toLocaleString()}`}
        />
        <MetricCard
          title="Affiliate Revenue"
          value={formatCurrency(metrics.affiliateRevenue.total)}
          change={3.4}
          icon={<ShoppingCartIcon className="w-6 h-6 text-white" />}
          color="bg-blue-600"
          subtitle={`${formatNumber(metrics.affiliateRevenue.clicks)} clicks`}
        />
        <MetricCard
          title="Premium Revenue"
          value={formatCurrency(metrics.premiumRevenue.total)}
          change={-1.2}
          icon={<UserGroupIcon className="w-6 h-6 text-white" />}
          color="bg-purple-600"
          subtitle={`${formatNumber(metrics.premiumRevenue.subscriptions)} subs`}
        />
        <MetricCard
          title="Ad Revenue"
          value={formatCurrency(metrics.adRevenue.total)}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="bg-amber-600"
          subtitle={`${formatNumber(metrics.adRevenue.impressions)} impressions`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Affiliate Performance</h3>
            <ArrowTrendingUpIcon className="w-5 h-5 text-gray-900" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-800">Clicks</p>
              <p className="text-lg font-semibold">{formatNumber(metrics.affiliateRevenue.clicks)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800">Conversions</p>
              <p className="text-lg font-semibold">{formatNumber(metrics.affiliateRevenue.conversions)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800">Conversion Rate</p>
              <p className="text-lg font-semibold">{metrics.affiliateRevenue.conversionRate}%</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Top Providers</p>
            <div className="space-y-2">
              {metrics.affiliateRevenue.topProviders.map((p) => (
                <div key={p.provider} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 capitalize">{p.provider}</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Premium + Ads</h3>
            <EyeIcon className="w-5 h-5 text-gray-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-800">Subscriptions</p>
              <p className="text-lg font-semibold">{formatNumber(metrics.premiumRevenue.subscriptions)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800">MRR</p>
              <p className="text-lg font-semibold">{formatCurrency(metrics.premiumRevenue.mrr)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800">Churn</p>
              <p className="text-lg font-semibold">{metrics.premiumRevenue.churn}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-800">Ad RPM</p>
              <p className="text-lg font-semibold">{metrics.adRevenue.rpm.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

