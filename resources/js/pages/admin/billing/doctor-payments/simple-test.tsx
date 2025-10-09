import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { DollarSign } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
    { title: 'Test', href: '/admin/billing/doctor-payments/simple-test' },
];

export default function SimpleTest() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payments Test" />
            
            <div className="min-h-screen bg-white p-6">
                <div className="mb-8">
                    <Heading title="Doctor Payments Test" description="Testing the doctor payments system" icon={DollarSign} />
                </div>
                
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <h2 className="font-bold">✅ System Working!</h2>
                    <p>The doctor payments system is working correctly.</p>
                </div>
            </div>
        </AppLayout>
    );
}