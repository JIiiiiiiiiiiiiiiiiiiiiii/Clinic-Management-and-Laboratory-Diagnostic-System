import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laboratory Management', href: '/management/laboratory' }];

export default function LaboratoryShow({ request, resultSchema }: any) {
    const { data, setData, processing } = useForm<{ [key: string]: any }>({});

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.post(`/management/laboratory/${request.laboratory_request_id}/results`, data as any, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lab Request #${request.laboratory_request_id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 text-sm">
                            <div>
                                <span className="font-medium">Test:</span> {request.test?.test_name}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span> {request.status}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            {(resultSchema?.fields || []).map((f: any) => (
                                <div key={f.key} className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor={f.key}>
                                        {f.label}
                                    </label>
                                    {f.type === 'text' || !f.type || f.type === 'number' ? (
                                        <Input
                                            id={f.key}
                                            type={f.type === 'number' ? 'number' : 'text'}
                                            step={f.step || (f.type === 'number' ? 'any' : undefined)}
                                            value={data[f.key] ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const value = f.type === 'number' ? (val === '' ? '' : Number(val)) : val;
                                                setData((prev: { [key: string]: any }) => ({ ...(prev as any), [f.key]: value }));
                                            }}
                                        />
                                    ) : null}
                                </div>
                            ))}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Save Results
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
