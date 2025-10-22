/**
 * Date Monitoring Dashboard
 * Monitors date validation issues across the system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    RefreshCw,
    Database,
    FileText,
    Users
} from 'lucide-react';

interface DateValidationStats {
    totalAppointments: number;
    invalidAppointments: number;
    totalTransactions: number;
    invalidTransactions: number;
    totalPatients: number;
    invalidPatients: number;
    lastValidation: string;
}

export default function DateMonitoring() {
    const [stats, setStats] = useState<DateValidationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // This would typically fetch from an API endpoint
            // For now, we'll simulate the data
            const mockStats: DateValidationStats = {
                totalAppointments: 1250,
                invalidAppointments: 0,
                totalTransactions: 890,
                invalidTransactions: 0,
                totalPatients: 2100,
                invalidPatients: 0,
                lastValidation: new Date().toISOString()
            };
            setStats(mockStats);
        } catch (error) {
            console.error('Failed to fetch date validation stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const runValidation = async () => {
        try {
            setValidating(true);
            // This would typically call an API endpoint to run validation
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            await fetchStats();
        } catch (error) {
            console.error('Failed to run validation:', error);
        } finally {
            setValidating(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const getHealthStatus = () => {
        if (!stats) return 'unknown';
        
        const totalInvalid = stats.invalidAppointments + stats.invalidTransactions + stats.invalidPatients;
        if (totalInvalid === 0) return 'healthy';
        if (totalInvalid < 10) return 'warning';
        return 'critical';
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getHealthIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            case 'critical': return <AlertTriangle className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <Head title="Date Monitoring" />
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading date validation stats...</span>
                </div>
            </AppLayout>
        );
    }

    const healthStatus = getHealthStatus();

    return (
        <AppLayout>
            <Head title="Date Monitoring Dashboard" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Date Monitoring Dashboard</h1>
                    <p className="text-gray-600 mt-2">Monitor date validation issues across the system</p>
                </div>

                {/* Health Status */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getHealthIcon(healthStatus)}
                            System Health Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Badge className={getHealthColor(healthStatus)}>
                                {healthStatus.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                                Last validation: {stats?.lastValidation ? new Date(stats.lastValidation).toLocaleString() : 'Never'}
                            </span>
                            <Button 
                                onClick={runValidation} 
                                disabled={validating}
                                size="sm"
                                variant="outline"
                            >
                                {validating ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Run Validation
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span className="font-semibold">{stats?.totalAppointments || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Invalid Dates:</span>
                                    <span className={`font-semibold ${stats?.invalidAppointments === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats?.invalidAppointments || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span className="font-semibold">{stats?.totalTransactions || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Invalid Dates:</span>
                                    <span className={`font-semibold ${stats?.invalidTransactions === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats?.invalidTransactions || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patients */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Patients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span className="font-semibold">{stats?.totalPatients || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Invalid Dates:</span>
                                    <span className={`font-semibold ${stats?.invalidPatients === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats?.invalidPatients || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {healthStatus === 'healthy' ? (
                            <div className="text-green-700">
                                <p>✅ All dates are valid. The system is healthy.</p>
                            </div>
                        ) : healthStatus === 'warning' ? (
                            <div className="text-yellow-700">
                                <p>⚠️ Some dates need attention. Consider running validation to fix issues.</p>
                            </div>
                        ) : (
                            <div className="text-red-700">
                                <p>🚨 Critical date validation issues detected. Immediate action required.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

