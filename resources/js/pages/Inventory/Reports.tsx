import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    TrendingUp,
    AlertTriangle,
    Plus,
    Building2,
    ArrowLeft,
    BarChart3,
    Download
} from 'lucide-react';
import { useState } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
];

export default function InventoryReports() {
    const [selectedFormat, setSelectedFormat] = useState('pdf');

    const handleExportAll = (format: string) => {
        const exportUrl = `/admin/inventory/reports/export-all?format=${format}`;
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Inventory Reports</h1>
                                <p className="text-sm text-black mt-1">Comprehensive inventory analytics and reporting</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Inventory
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-black" />
                                Inventory Reports Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Header Actions */}
                            <div className="mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="excel">Excel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={() => handleExportAll(selectedFormat)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Export All Reports
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/reports/used-rejected')}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                            </div>
                            {/* Quick Report Generation */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Generation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Button asChild className="h-auto p-4 flex flex-col items-center gap-2">
                                        <Link href="/admin/inventory/reports/used-rejected">
                                            <AlertTriangle className="h-6 w-6" />
                                            <span>Used/Rejected Supplies</span>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                        <Link href="/admin/inventory/reports/in-out-supplies">
                                            <TrendingUp className="h-6 w-6" />
                                            <span>In/Out Supplies</span>
                                        </Link>
                                    </Button>
                                    <Button asChild className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link href="/admin/inventory/reports/supply-items-by-department">
                                            <Building2 className="h-6 w-6" />
                                            <span>Supply Items by Department</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </AppLayout>
    );
}
