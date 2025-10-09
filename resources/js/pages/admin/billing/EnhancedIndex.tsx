import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Eye
} from 'lucide-react';

interface BillingAnalytics {
  overview: {
    total_revenue: number;
    monthly_revenue: number;
    today_revenue: number;
    average_transaction: number;
    total_transactions: number;
  };
  payment_methods: Record<string, { count: number; total: number }>;
  hmo_providers: Record<string, { count: number; total: number }>;
  monthly_trends: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  doctor_payments: Record<string, { transactions: number; revenue: number }>;
}

interface RecentTransaction {
  id: number;
  transaction_id: string;
  patient_name: string;
  doctor_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  items_count: number;
}

interface PendingPayment {
  id: number;
  patient_name: string;
  total_amount: number;
  due_date: string;
  days_overdue: number;
}

interface EnhancedBillingIndexProps {
  analytics: BillingAnalytics;
  recentTransactions: RecentTransaction[];
  pendingPayments: PendingPayment[];
}

export default function EnhancedBillingIndex({ analytics, recentTransactions, pendingPayments }: EnhancedBillingIndexProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <Head title="Enhanced Billing Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Billing Management</h1>
            <p className="text-muted-foreground">
              Comprehensive billing, payments, and financial reporting
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('admin.billing.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.monthly_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.overview.today_revenue)} today
              </p>
            </CardContent>
          </Card>

          {/* Total Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_transactions}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(analytics.overview.average_transaction)}
              </p>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>
                Revenue breakdown by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.payment_methods).map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm capitalize">{method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(data.total)}</p>
                      <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HMO Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>HMO Providers</span>
              </CardTitle>
              <CardDescription>
                Revenue from HMO providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.hmo_providers).map(([provider, data]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="text-sm">{provider}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(data.total)}</p>
                      <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Latest billing transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="text-sm font-medium">{transaction.transaction_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.patient_name} • {transaction.doctor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(transaction.total_amount)}
                    </span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <Link href={route('admin.billing.show', transaction.id)}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Payments</span>
            </CardTitle>
            <CardDescription>
              Transactions awaiting payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div>
                    <p className="text-sm font-medium">{payment.patient_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                      {payment.days_overdue > 0 && (
                        <span className="text-red-600 ml-2">
                          ({payment.days_overdue} days overdue)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(payment.total_amount)}
                    </span>
                    <Button variant="outline" size="sm">
                      Process Payment
                    </Button>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Financial Reports</span>
            </CardTitle>
            <CardDescription>
              Access comprehensive financial reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href={route('admin.billing.financial-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Financial Report</span>
                </Button>
              </Link>
              <Link href={route('admin.billing.doctor-payment-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Doctor Payments</span>
                </Button>
              </Link>
              <Link href={route('admin.billing.hmo-report')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <CreditCard className="h-6 w-6" />
                  <span>HMO Report</span>
                </Button>
              </Link>
              <Link href={route('admin.billing.receipts')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Receipts</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
