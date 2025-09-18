import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';

type PageProps = { permissions: Array<{ id: number; name: string; guard_name: string; createdAt: string }> };

export default function PermissionsIndex() {
    const { props } = usePage<PageProps>();
    const permissions = props.permissions ?? [];

    return (
        <AppLayout>
            <Head title="Permissions" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Permissions</h1>
                    <Button asChild>
                        <Link href={route('admin.permissions.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Permission
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Guard</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.guard_name}</TableCell>
                                        <TableCell>{p.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('admin.permissions.edit', p.id)}>
                                                        <Edit className="mr-1 h-3 w-3" /> Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        if (confirm('Delete this permission?')) {
                                                            router.delete(route('admin.permissions.destroy', p.id));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
