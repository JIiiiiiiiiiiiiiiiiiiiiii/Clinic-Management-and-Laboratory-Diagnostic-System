import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Calendar, Download, FileText, Package, TrendingDown, Users, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
];

export default function ReportsIndex() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportAll = async (format: 'excel' | 'pdf' | 'word') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({ format });
            window.location.href = `/admin/inventory/reports/export-all?${params.toString()}`;
            
            // Reset loading state after a delay
            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    // Redirect to the new inventory reports page
    React.useEffect(() => {
        router.visit('/admin/inventory/reports');
    }, []);

    const reportCards = [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Inventory Reports" description="Generate comprehensive inventory analytics and reports" icon={BarChart3} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory')} className="bg-white text-black hover:bg-gray-50 hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inventory
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        disabled={isExporting}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="mr-2 h-4 w-4" />
                                        )}
                                        {isExporting ? 'Exporting...' : 'Export All Reports'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                        onClick={() => handleExportAll('excel')}
                                        disabled={isExporting}
                                    >
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleExportAll('pdf')}
                                        disabled={isExporting}
                                    >
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleExportAll('word')}
                                        disabled={isExporting}
                                    >
                                        Word
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {reportCards.map((report) => {
                        const IconComponent = report.icon;
                        return (
                            <div
                                key={report.href}
                                className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                                onClick={() => router.visit(report.href)}
                            >
                                <div className="">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl border-2 border-gray-200">
                                                <IconComponent className="h-6 w-6 text-black" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-black">{report.title}</h3>
                                                <p className="text-black text-sm mt-1">{report.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 mt-auto">
                                    <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                        Generate Report
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
