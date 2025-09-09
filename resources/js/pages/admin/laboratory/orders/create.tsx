import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Search, User2 } from 'lucide-react';
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.visit('/admin/laboratory/orders')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create New Lab Order</h1>
                        <p className="text-muted-foreground">Select a patient to continue</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Choose Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center">
                            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-80" />
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((p) => (
                                <Card
                                    key={p.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => router.visit(`/admin/laboratory/patients/${p.id}/orders`)}
                                >
                                    <CardContent className="flex items-center gap-3 p-4">
                                        <User2 className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {p.last_name}, {p.first_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {p.age ? `${p.age} yrs` : ''} {p.sex ? `• ${p.sex}` : ''}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
