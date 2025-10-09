import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreatePermission() {
    const { data, setData, post, processing, errors } = useForm({ name: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.permissions.store'));
    };
    return (
        <AppLayout>
            <Head title="Create Permission" />
            <div className="p-6">
                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Create Permission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-sm">Name</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-black">{errors.name}</div>}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Save
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.permissions.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
