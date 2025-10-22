import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  user: any;
  error?: string;
}

export default function HospitalReportsError({ user, error }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports Error', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reports Error - Hospital" />
      
      <div className="space-y-6">
        {/* Error Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-600">Reports Error</h1>
            <p className="text-muted-foreground">
              There was an issue loading the reports. Please try again.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button asChild>
              <Link href={route('hospital.dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Details */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Error Details
            </CardTitle>
            <CardDescription>
              The reports system encountered an error while loading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-800">Error Message:</h4>
                <p className="text-sm text-red-600 mt-1">
                  {error || 'Unknown error occurred while loading reports.'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-red-800">Possible Solutions:</h4>
                <ul className="text-sm text-red-600 mt-1 space-y-1">
                  <li>• Clear your browser cache and try again</li>
                  <li>• Check if you're logged in with proper hospital access</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact system administrator if the issue persists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Try Debug Route</CardTitle>
              <CardDescription>
                Test if the basic routes are working
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={route('hospital.reports.debug')}>
                  Test Debug Route
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Go to Dashboard</CardTitle>
              <CardDescription>
                Return to the main hospital dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={route('hospital.dashboard')}>
                  Hospital Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Refresh Page</CardTitle>
              <CardDescription>
                Try reloading the current page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
