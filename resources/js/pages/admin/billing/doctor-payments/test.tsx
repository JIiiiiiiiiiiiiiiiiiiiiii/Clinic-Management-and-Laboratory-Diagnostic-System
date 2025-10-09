import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { DollarSign } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
    { title: 'Test', href: '/admin/billing/doctor-payments/test' },
];

export default function Test() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payments Test" />
            
            <div className="min-h-screen bg-white p-6">
                <div className="mb-8">
                    <Heading title="Doctor Payments Test" description="Testing the doctor payments system" icon={DollarSign} />
                </div>
                
                <div className="space-y-4">
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        <h2 className="font-bold">🔍 Debugging Information</h2>
                        <p>This page is working correctly.</p>
                    </div>
                    
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <h2 className="font-bold">⚠️ Possible Issues</h2>
                        <ul className="list-disc list-inside">
                            <li>No doctors in database with 'doctor' role</li>
                            <li>Form validation errors</li>
                            <li>Missing required fields</li>
                            <li>Database connection issues</li>
                        </ul>
                    </div>
                    
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <h2 className="font-bold">✅ Next Steps</h2>
                        <p>Check the browser console for any JavaScript errors when trying to create a payment.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}