import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    AlertTriangle, 
    Users,
    Search,
    Plus,
    Edit,
    Eye,
    Trash2,
    ArrowLeft,
    BarChart3,
    TrendingDown,
    CheckCircle,
    Minus,
    X
} from 'lucide-react';
import { useState } from 'react';

type DoctorNurseItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    low_stock_alert: number;
};

type DoctorNurseStats = {
    totalItems: number;
    lowStock: number;
    consumedItems: number;
    rejectedItems: number;
};

interface DoctorNurseProps {
    items: DoctorNurseItem[];
    stats: DoctorNurseStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Doctor & Nurse Items',
        href: '/admin/inventory/doctor-nurse',
    },
];

export default function DoctorNurse({
    items,
    stats,
}: DoctorNurseProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [consumeModalOpen, setConsumeModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DoctorNurseItem | null>(null);
    const [consumeForm, setConsumeForm] = useState({
        quantity: '',
        notes: '',
        handled_by: ''
    });
    const [rejectForm, setRejectForm] = useState({
        quantity: '',
        notes: '',
        handled_by: ''
    });

    const filteredItems = items.filter((item) => {
        const search = searchTerm.toLowerCase();
        return item.item_name.toLowerCase().includes(search) || 
               item.item_code.toLowerCase().includes(search) ||
               item.category.toLowerCase().includes(search);
    });

    const handleConsumeClick = (item: DoctorNurseItem) => {
        setSelectedItem(item);
        setConsumeForm({
            quantity: '',
            notes: '',
            handled_by: ''
        });
        setConsumeModalOpen(true);
    };

    const handleRejectClick = (item: DoctorNurseItem) => {
        setSelectedItem(item);
        setRejectForm({
            quantity: '',
            notes: '',
            handled_by: ''
        });
        setRejectModalOpen(true);
    };

    const handleConsumeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        router.post(`/admin/inventory/${selectedItem.id}/consume`, consumeForm, {
            onSuccess: () => {
                setConsumeModalOpen(false);
                setSelectedItem(null);
                setConsumeForm({ quantity: '', notes: '', handled_by: '' });
            }
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        router.post(`/admin/inventory/${selectedItem.id}/reject`, rejectForm, {
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedItem(null);
                setRejectForm({ quantity: '', notes: '', handled_by: '' });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor & Nurse Inventory" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Doctor & Nurse Inventory</h1>
                                <p className="text-sm text-black mt-1">Items assigned to Doctor & Nurse department</p>
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
                            <Button 
                                onClick={() => router.visit('/admin/inventory/create')}
                                className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Doctor & Nurse Items"
                        icon={<Users className="h-5 w-5 text-black" />}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/reports')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Reports
                                </Button>
                            </div>
                        }
                    >
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.lowStock}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.consumedItems}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.rejectedItems}</div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">Item Name</TableHead>
                                            <TableHead className="font-semibold text-black">Code</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Consumed</TableHead>
                                            <TableHead className="font-semibold text-black">Rejected</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">
                                                            {searchTerm ? 'No items found' : 'No items assigned to Doctor & Nurse'}
                                                        </h3>
                                                        <p className="text-black">
                                                            {searchTerm ? 'Try adjusting your search terms' : 'Add items to get started'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 bg-gray-100 rounded-full">
                                                                <Package className="h-4 w-4 text-black" />
                                                            </div>
                                                            {item.item_name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-black">{item.item_code}</TableCell>
                                                    <TableCell className="text-sm text-black">{item.category}</TableCell>
                                                    <TableCell className="text-sm text-black">{item.stock} {item.unit}</TableCell>
                                                    <TableCell className="text-sm text-black">{item.consumed} {item.unit}</TableCell>
                                                    <TableCell className="text-sm text-black">{item.rejected} {item.unit}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.status === 'Low Stock' ? 'destructive' : item.status === 'Out of Stock' ? 'destructive' : 'default'}>
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2 flex-wrap">
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={`/admin/inventory/${item.id}`}>
                                                                    <Eye className="mr-1 h-3 w-3" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => handleConsumeClick(item)}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            >
                                                                <Minus className="mr-1 h-3 w-3" />
                                                                Consume
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => handleRejectClick(item)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <X className="mr-1 h-3 w-3" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>

                {/* Consume Modal */}
                <Dialog open={consumeModalOpen} onOpenChange={setConsumeModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Consume Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleConsumeSubmit} className="space-y-4">
                            {selectedItem && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Item Name</Label>
                                        <Input value={selectedItem.item_name} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Item Code</Label>
                                        <Input value={selectedItem.item_code} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Current Stock</Label>
                                        <Input value={`${selectedItem.stock} ${selectedItem.unit}`} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consume-quantity">Quantity to Consume</Label>
                                        <Input
                                            id="consume-quantity"
                                            type="number"
                                            min="1"
                                            max={selectedItem.stock}
                                            value={consumeForm.quantity}
                                            onChange={(e) => setConsumeForm({ ...consumeForm, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consume-notes">Reason / Notes</Label>
                                        <Textarea
                                            id="consume-notes"
                                            value={consumeForm.notes}
                                            onChange={(e) => setConsumeForm({ ...consumeForm, notes: e.target.value })}
                                            placeholder="Enter reason for consumption (optional)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consume-handled-by">Handled By</Label>
                                        <Input
                                            id="consume-handled-by"
                                            value={consumeForm.handled_by}
                                            onChange={(e) => setConsumeForm({ ...consumeForm, handled_by: e.target.value })}
                                            placeholder="Enter staff name (optional)"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setConsumeModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Consume
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reject Modal */}
                <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reject Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            {selectedItem && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Item Name</Label>
                                        <Input value={selectedItem.item_name} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Item Code</Label>
                                        <Input value={selectedItem.item_code} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Current Stock</Label>
                                        <Input value={`${selectedItem.stock} ${selectedItem.unit}`} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reject-quantity">Quantity to Reject</Label>
                                        <Input
                                            id="reject-quantity"
                                            type="number"
                                            min="1"
                                            max={selectedItem.stock}
                                            value={rejectForm.quantity}
                                            onChange={(e) => setRejectForm({ ...rejectForm, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reject-notes">Reason / Notes</Label>
                                        <Textarea
                                            id="reject-notes"
                                            value={rejectForm.notes}
                                            onChange={(e) => setRejectForm({ ...rejectForm, notes: e.target.value })}
                                            placeholder="Enter reason for rejection (optional)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reject-handled-by">Handled By</Label>
                                        <Input
                                            id="reject-handled-by"
                                            value={rejectForm.handled_by}
                                            onChange={(e) => setRejectForm({ ...rejectForm, handled_by: e.target.value })}
                                            placeholder="Enter staff name (optional)"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    <X className="mr-2 h-4 w-4" />
                                    Confirm Reject
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
