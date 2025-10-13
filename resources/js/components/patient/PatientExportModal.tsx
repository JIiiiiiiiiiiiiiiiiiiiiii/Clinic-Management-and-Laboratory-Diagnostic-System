import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, Database, Download, FileImage, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface PatientExportModalProps {
    patientId?: number;
    patientName?: string;
    trigger?: React.ReactNode;
}

interface ExportFilters {
    format: 'excel' | 'csv' | 'pdf';
    type: 'summary' | 'detailed' | 'medical_history';
    dateFrom?: string;
    dateTo?: string;
    includeVisits: boolean;
    includeLabOrders: boolean;
    includeMedicalHistory: boolean;
}

export default function PatientExportModal({ patientId, patientName, trigger }: PatientExportModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [filters, setFilters] = useState<ExportFilters>({
        format: 'excel',
        type: 'summary',
        includeVisits: true,
        includeLabOrders: true,
        includeMedicalHistory: true,
    });

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const params = new URLSearchParams();
            params.append('format', filters.format);
            params.append('type', filters.type);

            if (filters.dateFrom) params.append('date_from', filters.dateFrom);
            if (filters.dateTo) params.append('date_to', filters.dateTo);
            if (filters.includeVisits) params.append('include_visits', '1');
            if (filters.includeLabOrders) params.append('include_lab_orders', '1');
            if (filters.includeMedicalHistory) params.append('include_medical_history', '1');

            const url = patientId ? `/admin/patient/${patientId}/export?${params.toString()}` : `/admin/patient/export?${params.toString()}`;

            // Test the simple route first
            const testUrl = '/admin/patient/export';
            console.log('Testing simple route:', testUrl);

            // Test if the route is accessible
            try {
                const testResponse = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                console.log('Test route response:', testResponse.status, testResponse.statusText);
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log('Test route data:', testData);
                } else {
                    console.error('Test route failed with status:', testResponse.status);
                }
            } catch (testError) {
                console.error('Test route failed:', testError);
            }

            console.log('Export URL:', url);
            console.log('Export parameters:', {
                format: filters.format,
                type: filters.type,
                patientId,
                patientName,
            });

            // Use fetch to handle the download properly
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,text/csv',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                let errorMessage = `Export failed: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // If we can't parse JSON, just use the status text
                    console.error('Export failed:', response.status, response.statusText);
                }
                throw new Error(errorMessage);
            }

            // Check if the response is actually a file download
            const contentType = response.headers.get('content-type');
            if (!contentType || (!contentType.includes('application/') && !contentType.includes('text/csv'))) {
                console.error('Unexpected content type:', contentType);
                const responseText = await response.text();
                console.error('Response content:', responseText);
                throw new Error('Server returned unexpected content type');
            }

            // Get the filename from the response headers or create a default one
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'patient_export';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            } else {
                // Create filename based on format and type
                const extension = filters.format === 'excel' ? 'xlsx' : filters.format === 'csv' ? 'csv' : 'pdf';
                filename = `patients_${filters.type}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
            }

            // Create blob and download
            const blob = await response.blob();
            console.log('Blob created:', {
                size: blob.size,
                type: blob.type,
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            console.log('Download URL created:', downloadUrl);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);

            console.log('Triggering download:', {
                filename,
                href: link.href,
                download: link.download,
            });

            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            window.URL.revokeObjectURL(downloadUrl);
            console.log('Download completed successfully');

            setIsOpen(false);
        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Export failed. Please try again.';
            alert(`Export failed: ${errorMessage}`);
        } finally {
            setIsExporting(false);
        }
    };

    const formatOptions = [
        { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
        { value: 'csv', label: 'CSV (.csv)', icon: FileText },
        { value: 'pdf', label: 'PDF (.pdf)', icon: FileImage },
    ];

    const typeOptions = [
        { value: 'summary', label: 'Summary Report', description: 'Basic patient information and statistics' },
        { value: 'detailed', label: 'Detailed Report', description: 'Complete patient data with all fields' },
        { value: 'medical_history', label: 'Medical History', description: 'Medical history and health information only' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        Export {patientName ? `${patientName}'s Data` : 'Patient Data'}
                    </DialogTitle>
                    <p className="mt-2 text-sm text-gray-600">Choose your export preferences and download patient data in your preferred format.</p>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Export Type Selection */}
                    <Card className="holographic-card overflow-hidden rounded-lg border border-white/40 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/70">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Settings className="h-5 w-5 text-blue-600" />
                                Export Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            {typeOptions.map((option) => (
                                <div key={option.value} className="group">
                                    <div
                                        className="flex cursor-pointer items-start space-x-4 rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50"
                                        onClick={() => setFilters({ ...filters, type: option.value as any })}
                                    >
                                        <input
                                            type="radio"
                                            id={option.value}
                                            name="type"
                                            value={option.value}
                                            checked={filters.type === option.value}
                                            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={option.value} className="cursor-pointer font-semibold text-gray-900">
                                                {option.label}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                                        </div>
                                        {filters.type === option.value && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Format Selection */}
                    <Card className="holographic-card overflow-hidden rounded-lg border border-white/40 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/70">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                Export Format
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                                {formatOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = filters.format === option.value;
                                    return (
                                        <div
                                            key={option.value}
                                            className={`group cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md'
                                            }`}
                                            onClick={() => setFilters({ ...filters, format: option.value as any })}
                                        >
                                            <div className="flex flex-col items-center space-y-3">
                                                <div
                                                    className={`rounded-lg p-3 transition-colors ${
                                                        isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`h-8 w-8 transition-colors ${
                                                            isSelected ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-center text-sm font-semibold transition-colors ${
                                                        isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-blue-900'
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                                {isSelected && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-800">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date Range Filters */}
                    <Card className="holographic-card overflow-hidden rounded-lg border border-white/40 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/70">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Date Range (Optional)
                            </CardTitle>
                            <p className="mt-1 text-sm text-gray-600">Filter data by registration date range</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dateFrom" className="text-sm font-semibold text-gray-700">
                                        From Date
                                    </Label>
                                    <Input
                                        id="dateFrom"
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateTo" className="text-sm font-semibold text-gray-700">
                                        To Date
                                    </Label>
                                    <Input
                                        id="dateTo"
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Include Options */}
                    <Card className="holographic-card overflow-hidden rounded-lg border border-white/40 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/70">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Database className="h-5 w-5 text-orange-600" />
                                Include Data
                            </CardTitle>
                            <p className="mt-1 text-sm text-gray-600">Select which data to include in your export</p>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid gap-4">
                                {[
                                    { id: 'includeVisits', label: 'Include Visit History', description: 'Patient visit records and appointments' },
                                    { id: 'includeLabOrders', label: 'Include Laboratory Orders', description: 'Lab test orders and results' },
                                    {
                                        id: 'includeMedicalHistory',
                                        label: 'Include Medical History',
                                        description: 'Medical history and health information',
                                    },
                                ].map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30"
                                    >
                                        <Checkbox
                                            id={option.id}
                                            checked={filters[option.id as keyof ExportFilters] as boolean}
                                            onCheckedChange={(checked) => setFilters({ ...filters, [option.id]: checked as boolean })}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={option.id} className="cursor-pointer font-semibold text-gray-900">
                                                {option.label}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-6" />

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isExporting}
                            className="border-gray-300 px-6 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="min-w-[140px] bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Data
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
