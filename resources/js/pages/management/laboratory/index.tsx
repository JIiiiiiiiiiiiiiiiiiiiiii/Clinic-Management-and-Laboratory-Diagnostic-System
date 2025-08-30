import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laboratory Management', href: '/management/laboratory' }];

const ALL = '__all__';

export default function LaboratoryIndex({ requests = [], pagination, tests = [], filters = {} as any }: any) {
    const [status, setStatus] = useState(filters.status || ALL);
    const [testId, setTestId] = useState(filters.test_id || ALL);
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = () => {
        router.get(
            '/management/laboratory',
            {
                status: status === ALL ? '' : status,
                test_id: testId === ALL ? '' : testId,
                date_from: dateFrom || '',
                date_to: dateTo || '',
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Laboratory Requests</h1>
                    <Button asChild>
                        <Link href="/management/laboratory/create">New Request</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        <SelectItem value="Requested">Requested</SelectItem>
                                        <SelectItem value="Sample Collected">Sample Collected</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Released">Released</SelectItem>
                                        <SelectItem value="Billed">Billed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Test</label>
                                <Select value={testId} onValueChange={setTestId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Tests" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        {tests.map((t: any) => (
                                            <SelectItem key={t.test_id} value={String(t.test_id)}>
                                                {t.test_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">From</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">To</label>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={applyFilters} variant="secondary">
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {requests.map((r: any) => (
                                <div key={r.laboratory_request_id} className="flex items-center justify-between rounded border p-3">
                                    <div>
                                        <div className="font-medium">{r.test?.test_name || 'Test'}</div>
                                        <div className="text-sm text-muted-foreground">Status: {r.status}</div>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={`/management/laboratory/${r.laboratory_request_id}`}>View</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
