import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileDown, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type LabTest = { id: number; name: string; code: string };
type Patient = { id: number; first_name: string; last_name: string };
type OrderLite = {
    id: number;
    created_at: string;
    patient: Patient | null;
    lab_tests: LabTest[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Reports', href: '/admin/laboratory/reports' },
];

export default function LaboratoryReportsIndex({ orders = [], tests = [] }: { orders?: OrderLite[]; tests?: LabTest[] }) {
    const [search, setSearch] = useState('');
    const [testId, setTestId] = useState<number | 'all'>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (orders || []).filter((o) => {
            const name = `${o.patient?.last_name ?? ''}, ${o.patient?.first_name ?? ''}`.toLowerCase();
            const matchesName = !q || name.includes(q) || `${o.id}`.includes(q);
            const matchesTest = testId === 'all' || (o.lab_tests || []).some((t) => t.id === testId);
            const created = new Date(o.created_at).getTime();
            const fromOk = !dateFrom || created >= new Date(dateFrom + 'T00:00:00').getTime();
            const toOk = !dateTo || created <= new Date(dateTo + 'T23:59:59').getTime();
            return matchesName && matchesTest && fromOk && toOk;
        });
    }, [orders, search, testId, dateFrom, dateTo]);

    const handleExportOrders = () => {
        window.open('/admin/laboratory/exports/orders.xlsx', '_self');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">Filter and export laboratory data</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Order # or patient name"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Test</Label>
                            <select
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                value={testId}
                                onChange={(e) => setTestId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            >
                                <option value="all">All</option>
                                {(tests || []).map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>From</Label>
                            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <Label>To</Label>
                            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Results</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExportOrders}>
                                <FileDown className="mr-2 h-4 w-4" /> Export Orders (Excel)
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">No data for selected filters</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                                            <th className="px-3 py-2">Order #</th>
                                            <th className="px-3 py-2">Patient</th>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Tests</th>
                                            <th className="px-3 py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((o) => (
                                            <tr key={o.id} className="border-b last:border-0">
                                                <td className="px-3 py-2 font-medium">#{o.id}</td>
                                                <td className="px-3 py-2">{o.patient ? `${o.patient.last_name}, ${o.patient.first_name}` : '—'}</td>
                                                <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                                                <td className="px-3 py-2">{(o.lab_tests || []).map((t) => t.name).join(', ')}</td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(`/admin/laboratory/orders/${o.id}/results/view`)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
