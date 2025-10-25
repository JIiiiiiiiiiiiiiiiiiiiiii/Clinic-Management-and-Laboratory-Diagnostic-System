import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, TestTube, Trash2, Search, FlaskConical, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

type TestRow = {
    id: number;
    name: string;
    code: string;
    fields_schema?: any;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Test Templates',
        href: '/admin/laboratory/tests',
    },
];

export default function LabTestsIndex({ tests }: { tests: TestRow[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<TestRow>[] = [
        {
            accessorKey: 'name',
            header: 'Test Name',
        },
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => {
                return <span className="text-sm text-gray-600 font-mono">{row.getValue('code')}</span>;
            },
        },
        {
            accessorKey: 'fields_schema',
            header: 'Fields',
            cell: ({ row }) => {
                const test = row.original;
                const fieldCount = getFieldCount(test);
                return <span className="text-sm text-gray-600">{fieldCount} fields</span>;
            },
        },
        {
            accessorKey: 'version',
            header: 'Version',
            cell: ({ row }) => {
                return <span className="text-sm text-gray-600">v{row.getValue('version')}</span>;
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => {
                return <span className="text-sm text-gray-600">{new Date(row.getValue('created_at')).toLocaleDateString()}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const test = row.original;
                return (
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/laboratory/tests/${test.id}/edit`}>
                                <Edit className="mr-1 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(test.id, test.name)}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: tests,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const handleDelete = (testId: number, testName: string) => {
        if (confirm(`Are you sure you want to delete "${testName}"? This action cannot be undone.`)) {
            router.delete(`/admin/laboratory/tests/${testId}`);
        }
    };

    const getFieldCount = (test: TestRow) => {
        if (!test.fields_schema?.sections) return 0;
        return Object.values(test.fields_schema.sections).reduce((total: number, section: any) => {
            return total + Object.keys(section.fields || {}).length;
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Test Templates" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Lab Test Templates</h1>
                                <p className="text-sm text-black mt-1">Manage laboratory diagnostic test templates and configurations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TestTube className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{tests.length}</div>
                                        <div className="text-gray-600 text-sm font-medium">Total Tests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tests Section */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                        {/* Table Controls */}
                        <div className="flex items-center py-4">
                            <Input
                                placeholder="Search tests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white ml-4"
                            >
                                <Link href="/admin/laboratory/tests/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Test
                                </Link>
                            </Button>
                        </div>
                                
                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : (
                                                            <div
                                                                className={
                                                                    header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none flex items-center'
                                                                        : 'flex items-center'
                                                                }
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {header.column.getCanSort() && (
                                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                                )}
                                                            </div>
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && 'selected'}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-muted-foreground flex-1 text-sm">
                                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                {table.getFilteredRowModel().rows.length} row(s) selected.
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Rows per page</p>
                                    <select 
                                        className="h-8 w-[70px] rounded border border-gray-300 px-2 text-sm"
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value))
                                        }}
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                                    {table.getPageCount()}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="hidden size-8 lg:flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Go to first page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="size-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Go to previous page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="size-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Go to next page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="hidden size-8 lg:flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Go to last page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
