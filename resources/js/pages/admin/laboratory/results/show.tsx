import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50">
                                <Link href="/admin/laboratory/orders">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-black mb-2">Order #{order.id}</h1>
                                <p className="text-lg text-gray-600">
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
                        {/* removed Total Results counter */}
                    </div>
                </div>

                {/* removed Actions card */}

                {/* Results Cards */}
                <div className="space-y-8">
                    {results.length === 0 ? (
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">No Results</CardTitle>
                                        <p className="text-sm text-gray-500">No results saved for this order</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center text-gray-500 py-8">No results saved for this order.</div>
                            </CardContent>
                        </Card>
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
                                <Card key={r.id} className="shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-black" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-gray-900">
                                                    {r.test?.name ?? 'Unknown Test'}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">{r.test?.code ? `Test ID: ${r.test.code}` : ''}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-sm font-semibold text-gray-700">Test Parameters</h5>
                            <div className="bg-green-100 rounded-full border border-green-200 shadow-sm px-3 py-1">
                                <span className="text-green-800 font-semibold text-sm">
                                                    {rows.length} parameters
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {rows.length === 0 ? (
                                                <div className="text-center text-gray-500 py-8">No parameters stored.</div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b text-left text-sm text-gray-600 uppercase tracking-wider">
                                                                <th className="px-4 py-4 font-bold text-base">Parameter</th>
                                                                <th className="px-4 py-4 font-bold text-base">Value</th>
                                                                <th className="px-4 py-4 font-bold text-base">Unit</th>
                                                                <th className="px-4 py-4 font-bold text-base">Reference Range</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rows.map((row) => {
                                                                const [value, unit] = row.value.split(' ');
                                                                return (
                                                                    <tr key={row.key} className="border-b last:border-0 hover:bg-gray-50">
                                                                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">{row.key}</td>
                                                                        <td className="px-4 py-3 text-gray-700 text-sm">{value || row.value}</td>
                                                                        <td className="px-4 py-3 text-gray-500 text-sm">{unit || '—'}</td>
                                                                        <td className="px-4 py-3 text-gray-500 text-sm">—</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Status</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        r.verified_at 
                                                            ? 'bg-gray-100 text-black' 
                                                            : 'bg-gray-100 text-black'
                                                    }`}>
                                                        {r.verified_at ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                                {r.verified_at && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Verified {new Date(r.verified_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Test Section Cards */}
                <div className="grid gap-8 md:grid-cols-2 mt-8">
                    {/* Hematology Section */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Hematology</CardTitle>
                                    <p className="text-sm text-gray-500">Blood test parameters</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-semibold text-gray-700">Test Parameters</h5>
                                <div className="bg-gray-100 rounded-full border border-gray-300 shadow-sm px-3 py-1">
                                    <span className="text-gray-700 font-semibold text-sm">5 fields</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-sm text-gray-600 uppercase tracking-wider">
                                                <th className="px-4 py-4 font-bold text-base">Parameter</th>
                                                <th className="px-4 py-4 font-bold text-base">Value</th>
                                                <th className="px-4 py-4 font-bold text-base">Unit</th>
                                                <th className="px-4 py-4 font-bold text-base">Reference Range</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">White Blood Cell Count</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">7.2</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">x10³/μL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">4.5-11.0</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Red Blood Cell Count</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">4.5</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">x10⁶/μL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">4.0-5.5</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Hemoglobin</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">14.2</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">g/dL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">12.0-16.0</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Hematocrit</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">42.1</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">%</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">36.0-46.0</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Platelet Count</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">285</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">x10³/μL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">150-450</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chemistry Section */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Chemistry</CardTitle>
                                    <p className="text-sm text-gray-500">Chemical analysis parameters</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-semibold text-gray-700">Test Parameters</h5>
                                <div className="bg-gray-100 rounded-full border border-gray-300 shadow-sm px-3 py-1">
                                    <span className="text-gray-700 font-semibold text-sm">4 fields</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-sm text-gray-600 uppercase tracking-wider">
                                                <th className="px-4 py-4 font-bold text-base">Parameter</th>
                                                <th className="px-4 py-4 font-bold text-base">Value</th>
                                                <th className="px-4 py-4 font-bold text-base">Unit</th>
                                                <th className="px-4 py-4 font-bold text-base">Reference Range</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Glucose</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">95</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">mg/dL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">70-100</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Total Cholesterol</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">180</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">mg/dL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">&lt;200</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">Creatinine</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">0.9</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">mg/dL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">0.6-1.2</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-sm">BUN</td>
                                                <td className="px-4 py-3 text-gray-700 text-sm">12</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">mg/dL</td>
                                                <td className="px-4 py-3 text-gray-500 text-sm">7-20</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
