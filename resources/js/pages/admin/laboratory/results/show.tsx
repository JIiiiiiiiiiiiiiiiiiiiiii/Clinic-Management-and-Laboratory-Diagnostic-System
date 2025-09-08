import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Pencil } from 'lucide-react';

type Result = {
    id: number;
    lab_test_id: number;
    results: Record<string, any> | null;
    verified_by?: number | null;
    verified_at?: string | null;
    test?: { id: number; name: string; code: string } | null;
    values?: Array<{
        id: number;
        parameter_key: string;
        parameter_label?: string | null;
        value?: string | null;
        unit?: string | null;
        reference_text?: string | null;
        reference_min?: string | null;
        reference_max?: string | null;
    }>;
};

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    age?: number;
    sex?: string;
};

type Order = {
    id: number;
    status: string;
    created_at: string;
    patient: Patient | null;
};

export default function ResultsShow({ order, patient, results }: { order: Order; patient: Patient | null; results: Result[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Laboratory', href: '/admin/laboratory' },
        { title: 'Lab Orders', href: '/admin/laboratory/orders' },
        { title: `Order #${order.id}`, href: `/admin/laboratory/orders/${order.id}/results/view` },
    ];

    const flatten = (obj: Record<string, any> | null, prefix = ''): Array<{ key: string; value: string }> => {
        if (!obj) return [];
        const rows: Array<{ key: string; value: string }> = [];
        const walker = (o: Record<string, any>, p = '') => {
            Object.entries(o).forEach(([k, v]) => {
                const path = p ? `${p}.${k}` : k;
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    walker(v as Record<string, any>, path);
                } else {
                    rows.push({ key: path, value: String(v ?? '') });
                }
            });
        };
        walker(obj);
        return rows;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lab Results - Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/admin/laboratory/orders">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                            <p className="text-muted-foreground">
                                {patient ? (
                                    <>
                                        {patient.last_name}, {patient.first_name}
                                    </>
                                ) : (
                                    'Unknown patient'
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Results</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/report`)}>
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download PDF</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/export.xlsx`)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download Excel</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.length === 0 ? (
                            <div className="text-muted-foreground">No results saved.</div>
                        ) : (
                            results.map((r) => {
                                const rows =
                                    r.values && r.values.length > 0
                                        ? r.values.map((v) => ({
                                              key: v.parameter_label || v.parameter_key,
                                              value: [v.value, v.unit].filter(Boolean).join(' '),
                                          }))
                                        : flatten(r.results);
                                return (
                                    <Card key={r.id} className="border">
                                        <CardHeader>
                                            <CardTitle className="text-base">
                                                {r.test?.name ?? 'Unknown Test'}{' '}
                                                {r.test?.code ? <span className="text-muted-foreground">({r.test.code})</span> : null}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-2 text-sm">
                                                {rows.length === 0 ? (
                                                    <div className="text-muted-foreground">No parameters stored.</div>
                                                ) : (
                                                    rows.map((row) => (
                                                        <div key={row.key} className="flex items-center justify-between gap-4">
                                                            <div className="text-muted-foreground">{row.key}</div>
                                                            <div className="font-medium">{row.value}</div>
                                                        </div>
                                                    ))
                                                )}
                                                <div className="pt-2 text-xs text-muted-foreground">
                                                    {r.verified_at ? <>Verified {new Date(r.verified_at).toLocaleString()}</> : <>Not verified</>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
