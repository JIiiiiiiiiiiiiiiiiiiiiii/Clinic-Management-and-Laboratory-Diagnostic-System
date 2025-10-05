import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { ArrowLeft, Search, User2, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    age?: number;
    sex?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Lab Orders', href: '/admin/laboratory/orders' },
    { title: 'Create New Order', href: '/admin/laboratory/orders/create' },
];

export default function LabOrdersCreate({ patients = [] }: { patients?: Patient[] }) {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return patients;
        return patients.filter(
            (p) => `${p.last_name}, ${p.first_name}`.toLowerCase().includes(q) || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q),
        );
    }, [patients, query]);

    useEffect(() => {
        if (patients.length === 0) {
            router.reload({ only: ['patients'] });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Lab Order" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <Heading title="Create New Lab Order" description="Select a patient to continue" icon={FileText} />
                </div>

                <div className="grid gap-8 md:grid-cols-3 items-start">
                    <div className="md:col-span-2 space-y-8">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <User2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Choose Patient</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Search and select a patient to begin the order</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center">
                                    <Search className="mr-2 h-4 w-4 text-blue-600" />
                                    <Input placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-80 h-12 border-gray-300 rounded-xl shadow-sm" />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {filtered.map((p) => (
                                        <div
                                            key={p.id}
                                            className="bg-white rounded-xl border border-blue-200 shadow-sm cursor-pointer transition-colors hover:bg-blue-50"
                                            onClick={() => router.visit(`/admin/laboratory/patients/${p.id}/orders`)}
                                        >
                                            <div className="flex items-center gap-3 p-4">
                                                <User2 className="h-6 w-6 text-blue-600" />
                                                <div>
                                                    <div className="font-medium">
                                                        {p.last_name}, {p.first_name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {p.age ? `${p.age} yrs` : ''} {p.sex ? `• ${p.sex}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Tips */}
                    <Card className="shadow-lg sticky top-0 self-start">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Quick Tips</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Selecting patients for orders</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <div className="font-semibold text-gray-800 mb-1">Search Precisely</div>
                                <div className="text-sm text-gray-600">Use both first and last name to narrow results</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <div className="font-semibold text-gray-800 mb-1">Verify Identity</div>
                                <div className="text-sm text-gray-600">Confirm age/sex to avoid selecting the wrong patient</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <div className="font-semibold text-gray-800 mb-1">Recent Patients</div>
                                <div className="text-sm text-gray-600">Recently seen patients are often at the top</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
