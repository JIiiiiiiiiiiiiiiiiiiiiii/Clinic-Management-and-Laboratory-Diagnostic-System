import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Table, Link, BarChart3 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface HealthCheck {
  database_connection: {
    status: 'healthy' | 'unhealthy';
    message: string;
  };
  table_structure: {
    status: 'healthy' | 'unhealthy';
    message: string;
    tables?: string[];
    missing?: string[];
  };
  data_integrity: {
    status: 'healthy' | 'unhealthy';
    message: string;
    issues?: string[];
  };
  foreign_keys: {
    status: 'healthy' | 'unhealthy';
    message: string;
    count?: number;
  };
  indexes: {
    status: 'healthy' | 'unhealthy';
    message: string;
    count?: number;
  };
  data_relationships: {
    status: 'healthy' | 'unhealthy';
    message: string;
    issues?: string[];
  };
}

interface SystemHealthCheckProps {
  initialHealth?: {
    overall_health: string;
    health_details: HealthCheck;
    recommendations: string[];
  };
}

export default function SystemHealthCheck({ initialHealth }: SystemHealthCheckProps) {
  const [health, setHealth] = useState(initialHealth);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<any>(null);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/health-check');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to check system health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixAllIssues = async () => {
    setIsFixing(true);
    try {
      const response = await fetch('/api/system/fix-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      const data = await response.json();
      setFixResults(data);
      
      // Refresh health check after fix
      setTimeout(() => {
        checkSystemHealth();
      }, 2000);
    } catch (error) {
      console.error('Failed to fix system issues:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const fixComponent = async (component: string) => {
    setIsFixing(true);
    try {
      const response = await fetch(`/api/system/fix-component/${component}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      const data = await response.json();
      setFixResults(data);
      
      // Refresh health check after fix
      setTimeout(() => {
        checkSystemHealth();
      }, 2000);
    } catch (error) {
      console.error(`Failed to fix component ${component}:`, error);
    } finally {
      setIsFixing(false);
    }
  };

  const getHealthIcon = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getHealthBadge = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? (
      <Badge variant="default" className="bg-green-500">Healthy</Badge>
    ) : (
      <Badge variant="destructive">Unhealthy</Badge>
    );
  };

  const getOverallHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'good': return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case 'fair': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'poor': return <XCircle className="h-6 w-6 text-red-500" />;
      default: return <AlertTriangle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getHealthPercentage = (health: string) => {
    switch (health) {
      case 'excellent': return 95;
      case 'good': return 80;
      case 'fair': return 60;
      case 'poor': return 30;
      default: return 0;
    }
  };

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <CardDescription>
            Check and fix system health issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkSystemHealth} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check System Health'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOverallHealthIcon(health.overall_health)}
            System Health Status
          </CardTitle>
          <CardDescription>
            Overall system health: <span className={getOverallHealthColor(health.overall_health)}>
              {health.overall_health.toUpperCase()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-sm text-gray-500">{getHealthPercentage(health.overall_health)}%</span>
            </div>
            <Progress value={getHealthPercentage(health.overall_health)} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Health Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.database_connection.status)}
              {getHealthBadge(health.health_details.database_connection.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.database_connection.message}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Table className="h-4 w-4" />
              Table Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.table_structure.status)}
              {getHealthBadge(health.health_details.table_structure.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.table_structure.message}
            </p>
            {health.health_details.table_structure.missing && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-600">Missing Tables:</p>
                <ul className="text-xs text-red-500">
                  {health.health_details.table_structure.missing.map((table, index) => (
                    <li key={index}>• {table}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Data Integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.data_integrity.status)}
              {getHealthBadge(health.health_details.data_integrity.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.data_integrity.message}
            </p>
            {health.health_details.data_integrity.issues && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-600">Issues:</p>
                <ul className="text-xs text-red-500">
                  {health.health_details.data_integrity.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link className="h-4 w-4" />
              Foreign Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.foreign_keys.status)}
              {getHealthBadge(health.health_details.foreign_keys.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.foreign_keys.message}
            </p>
            {health.health_details.foreign_keys.count && (
              <p className="text-xs text-green-600 mt-1">
                {health.health_details.foreign_keys.count} foreign keys found
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Indexes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.indexes.status)}
              {getHealthBadge(health.health_details.indexes.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.indexes.message}
            </p>
            {health.health_details.indexes.count && (
              <p className="text-xs text-green-600 mt-1">
                {health.health_details.indexes.count} indexes found
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link className="h-4 w-4" />
              Data Relationships
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {getHealthIcon(health.health_details.data_relationships.status)}
              {getHealthBadge(health.health_details.data_relationships.status)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {health.health_details.data_relationships.message}
            </p>
            {health.health_details.data_relationships.issues && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-600">Issues:</p>
                <ul className="text-xs text-red-500">
                  {health.health_details.data_relationships.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Fix Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Fix Actions</CardTitle>
          <CardDescription>
            Fix system issues to improve health and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={fixAllIssues} 
              disabled={isFixing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                'Fix All Issues'
              )}
            </Button>
            
            <Button 
              onClick={() => fixComponent('patients')} 
              disabled={isFixing}
              variant="outline"
            >
              Fix Patients
            </Button>
            
            <Button 
              onClick={() => fixComponent('appointments')} 
              disabled={isFixing}
              variant="outline"
            >
              Fix Appointments
            </Button>
            
            <Button 
              onClick={() => fixComponent('visits')} 
              disabled={isFixing}
              variant="outline"
            >
              Fix Visits
            </Button>
            
            <Button 
              onClick={() => fixComponent('billing')} 
              disabled={isFixing}
              variant="outline"
            >
              Fix Billing
            </Button>
            
            <Button 
              onClick={() => fixComponent('relationships')} 
              disabled={isFixing}
              variant="outline"
            >
              Fix Relationships
            </Button>
          </div>

          <Button 
            onClick={checkSystemHealth} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Refresh Health Check'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Fix Results */}
      {fixResults && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Results</CardTitle>
          </CardHeader>
          <CardContent>
            {fixResults.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {fixResults.message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {fixResults.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
