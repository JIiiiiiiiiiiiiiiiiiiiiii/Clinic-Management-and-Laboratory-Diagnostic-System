import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  XCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Calendar
} from 'lucide-react';

interface InventoryAnalytics {
  overview: {
    total_products: number;
    active_products: number;
    total_value: number;
    low_stock_items: number;
    expiring_soon: number;
    expired_items: number;
  };
  movement: {
    inbound_this_month: number;
    outbound_this_month: number;
    rejected_this_month: number;
    waste_this_month: number;
  };
  categories: Record<string, { count: number; total_value: number }>;
  suppliers: Record<string, { products_count: number; total_value: number }>;
  trends: Array<{
    month: string;
    inbound: number;
    outbound: number;
  }>;
}

interface InventoryAlert {
  low_stock: Array<{
    id: number;
    name: string;
    current_stock: number;
    min_level: number;
    category: string;
  }>;
  expiring_soon: Array<{
    id: number;
    name: string;
    expiry_date: string;
    days_until_expiry: number;
    quantity: number;
  }>;
  expired: Array<{
    id: number;
    name: string;
    expiry_date: string;
    days_expired: number;
    quantity: number;
  }>;
}

interface RecentActivity {
  id: number;
  product_name: string;
  type: string;
  subtype: string;
  quantity: number;
  user_name: string;
  transaction_date: string;
  status: string;
  notes: string;
}

interface EnhancedInventoryIndexProps {
  analytics: InventoryAnalytics;
  alerts: InventoryAlert;
  recentActivity: RecentActivity[];
}

export default function EnhancedInventoryIndex({ analytics, alerts, recentActivity }: EnhancedInventoryIndexProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'out': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <Head title="Enhanced Inventory Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Inventory Management</h1>
            <p className="text-muted-foreground">
              Comprehensive inventory tracking, analytics, and reporting
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_products}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.active_products} active
              </p>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.overview.low_stock_items}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analytics.overview.expiring_soon}</div>
              <p className="text-xs text-muted-foreground">
                Within 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Movement Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Monthly Movement</span>
              </CardTitle>
              <CardDescription>
                Inventory movement this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Inbound</span>
                  </div>
                  <span className="font-medium">{analytics.movement.inbound_this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Outbound</span>
                  </div>
                  <span className="font-medium">{analytics.movement.outbound_this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="font-medium">{analytics.movement.rejected_this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Waste</span>
                  </div>
                  <span className="font-medium">{analytics.movement.waste_this_month}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Category Breakdown</span>
              </CardTitle>
              <CardDescription>
                Products by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.categories).slice(0, 5).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{data.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(data.total_value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Low Stock Alerts</span>
              </CardTitle>
              <CardDescription>
                Items needing restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.low_stock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {item.current_stock}/{item.min_level}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.low_stock.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No low stock items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Soon Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>Expiring Soon</span>
              </CardTitle>
              <CardDescription>
                Items expiring within 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.expiring_soon.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.days_until_expiry} days left
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.expiring_soon.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items expiring soon
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expired Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Expired Items</span>
              </CardTitle>
              <CardDescription>
                Items that have expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.expired.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.days_expired} days expired
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.expired.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No expired items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium">{activity.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subtype} • {activity.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getMovementColor(activity.type)}`}>
                      {activity.type === 'in' ? '+' : '-'}{activity.quantity}
                    </span>
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Inventory Reports</span>
            </CardTitle>
            <CardDescription>
              Access detailed inventory reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href={route('admin.inventory.detailed-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Detailed Report</span>
                </Button>
              </Link>
              <Link href={route('admin.inventory.usage-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <TrendingDown className="h-6 w-6" />
                  <span>Usage Report</span>
                </Button>
              </Link>
              <Link href={route('admin.inventory.supplier-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Supplier Report</span>
                </Button>
              </Link>
              <Link href={route('admin.inventory.inoutflow-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <LineChart className="h-6 w-6" />
                  <span>In/Out Flow</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
