import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SystemHealthCheck from '@/components/SystemHealthCheck';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Health', href: '/admin/system-health' },
];

interface SystemHealthPageProps {
    initialHealth?: {
        overall_health: string;
        health_details: any;
        recommendations: string[];
    };
}

export default function SystemHealthPage({ initialHealth }: SystemHealthPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Health Check" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Health Check</h1>
                        <p className="text-muted-foreground">
                            Monitor and fix system health issues to ensure optimal performance
                        </p>
                    </div>
                </div>

                <SystemHealthCheck initialHealth={initialHealth} />
            </div>
        </AppLayout>
    );
}
