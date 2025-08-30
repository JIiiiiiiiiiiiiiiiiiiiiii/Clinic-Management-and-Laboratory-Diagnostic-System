import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory Management', href: '/management/laboratory' },
    { title: 'Create Request', href: '/management/laboratory/create' },
];

export default function CreateLaboratory({ patients = [], tests = [] as any[] }: any) {
    const [patientOptions, setPatientOptions] = useState<any[]>(patients);
    const [testOptions, setTestOptions] = useState<any[]>(tests);

    const { data, setData, processing, errors } = useForm({
        patient_id: '',
        test_id: '',
    });

    // Fallback fetch if props are empty
    useEffect(() => {
        if (!testOptions?.length) {
            fetch('/management/laboratory-tests')
                .then((r) => r.json())
                .then((arr) => {
                    setTestOptions(arr || []);
                })
                .catch(() => {});
        }
    }, [testOptions?.length]);

    useEffect(() => {
        if (!patientOptions?.length) {
            // Basic fetch for patients list for selection (reuse index API if available),
            // else keep current state; this is optional and can be removed if not needed.
        }
    }, [patientOptions?.length]);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/management/laboratory', { ...data });
    };

    const patientValue = data.patient_id || undefined;
    const testValue = data.test_id || undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Lab Request" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/management/laboratory">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Laboratory Request</h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Patient *</label>
                                    <Select value={patientValue} onValueChange={(v) => setData('patient_id', v)}>
                                        <SelectTrigger className={errors.patient_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patientOptions.map((p: any) => (
                                                <SelectItem key={p.patient_id} value={String(p.patient_id)}>
                                                    {p.last_name}, {p.first_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Test *</label>
                                    <Select value={testValue} onValueChange={(v) => setData('test_id', v)}>
                                        <SelectTrigger className={errors.test_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select test" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {testOptions.map((t: any) => (
                                                <SelectItem key={t.test_id} value={String(t.test_id)}>
                                                    {t.test_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.test_id && <p className="text-sm text-red-500">{errors.test_id}</p>}
                                    {!testOptions.length && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            No clinical tests found. Add tests in the database or seed sample tests.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !data.patient_id || !data.test_id}>
                            <Save className="mr-2 h-4 w-4" />
                            Create Request
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
