import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

type PageProps = { role: { id: number; name: string; permissions: string[] }; availablePermissions: string[] };

export default function EditRole() {
    const { props } = usePage<PageProps>();
    const { data, setData, put, processing, errors } = useForm<{ name: string; permissions: string[] }>({
        name: props.role.name,
        permissions: props.role.permissions || [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.roles.update', props.role.id));
    };

    return (
        <AppLayout>
            <Head title="Edit Role" />
            <div className="p-6">
                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Edit Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="text-sm">Name</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
                            </div>
                            <div>
                                <div className="text-sm font-medium">Permissions</div>
                                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {props.availablePermissions.map((perm) => (
                                        <label key={perm} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={data.permissions.includes(perm)}
                                                onCheckedChange={(checked) => {
                                                    const next = new Set(data.permissions);
                                                    if (checked) next.add(perm);
                                                    else next.delete(perm);
                                                    setData('permissions', Array.from(next));
                                                }}
                                            />
                                            {perm}
                                        </label>
                                    ))}
                                </div>
                                {errors.permissions && <div className="text-sm text-red-600">{String(errors.permissions)}</div>}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.roles.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
