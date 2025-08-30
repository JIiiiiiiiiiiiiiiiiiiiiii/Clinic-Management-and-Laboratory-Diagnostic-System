import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { AlertTriangle, FileDown, Filter, MoreHorizontal, Package2, Plus, Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    sku: string;
    stock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    price: number;
    supplier: string;
    expiryDate: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
    lastUpdated: string;
}

const mockInventoryData: InventoryItem[] = [
    {
        id: 1,
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        sku: 'MED-001',
        stock: 150,
        minStock: 50,
        maxStock: 200,
        unit: 'Tablets',
        price: 2.5,
        supplier: 'PharmaCorp',
        expiryDate: '2026-12-31',
        status: 'In Stock',
        lastUpdated: '2025-01-15',
    },
    {
        id: 2,
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        sku: 'MED-002',
        stock: 75,
        minStock: 100,
        maxStock: 300,
        unit: 'Capsules',
        price: 5.0,
        supplier: 'MedSupply Co.',
        expiryDate: '2025-06-30',
        status: 'Low Stock',
        lastUpdated: '2025-01-14',
    },
    {
        id: 3,
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        sku: 'MED-003',
        stock: 200,
        minStock: 80,
        maxStock: 250,
        unit: 'Tablets',
        price: 3.0,
        supplier: 'PharmaCorp',
        expiryDate: '2026-08-15',
        status: 'In Stock',
        lastUpdated: '2025-01-13',
    },
    {
        id: 4,
        name: 'Omeprazole 20mg',
        category: 'Gastrointestinal',
        sku: 'MED-004',
        stock: 0,
        minStock: 50,
        maxStock: 150,
        unit: 'Capsules',
        price: 8.5,
        supplier: 'MedSupply Co.',
        expiryDate: '2025-03-31',
        status: 'Out of Stock',
        lastUpdated: '2025-01-12',
    },
    {
        id: 5,
        name: 'Metformin 500mg',
        category: 'Diabetes',
        sku: 'MED-005',
        stock: 120,
        minStock: 60,
        maxStock: 180,
        unit: 'Tablets',
        price: 4.25,
        supplier: 'PharmaCorp',
        expiryDate: '2025-09-30',
        status: 'In Stock',
        lastUpdated: '2025-01-11',
    },
];

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Inventory Management', href: '/admin/inventory' },
];

export default function InventoryManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const filteredInventory = mockInventoryData.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'In Stock':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'Out of Stock':
                return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'Expired':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getStockStatus = (stock: number, minStock: number) => {
        if (stock === 0) return 'Out of Stock';
        if (stock <= minStock) return 'Low Stock';
        return 'In Stock';
    };

    const categories = ['all', ...Array.from(new Set(mockInventoryData.map((item) => item.category)))];

    const totalItems = mockInventoryData.length;
    const lowStockItems = mockInventoryData.filter((item) => item.stock <= item.minStock).length;
    const outOfStockItems = mockInventoryData.filter((item) => item.stock === 0).length;
    const totalValue = mockInventoryData.reduce((sum, item) => sum + item.stock * item.price, 0);

    return (
        <AppLayout
            breadcrumbs={breadcrumbs.map(b => ({
                ...b,
                title: b.label, // Fix: add 'title' property required by BreadcrumbItem
            }))}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                        <p className="text-muted-foreground">Manage clinic supplies, medications, and equipment inventory</p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalItems}</div>
                            <p className="text-xs text-muted-foreground">Unique inventory items</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                            <p className="text-xs text-muted-foreground">Items below minimum stock</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
                            <p className="text-xs text-muted-foreground">Items with zero stock</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalValue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Current inventory value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>Search and filter through all inventory items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search items, SKU, or supplier..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category === 'all' ? 'All Categories' : category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Advanced Filters
                                </Button>
                                <Button variant="outline" size="sm">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="mt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-muted-foreground">{item.supplier}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">{item.sku}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.stock}</span>
                                                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Min: {item.minStock} | Max: {item.maxStock}
                                                </div>
                                            </TableCell>
                                            <TableCell>₱{item.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setSelectedItem(item)}>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit Item</DropdownMenuItem>
                                                        <DropdownMenuItem>Update Stock</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Delete Item</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Item Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                        <DialogDescription>Add a new item to the clinic inventory</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input id="name" placeholder="Enter item name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" placeholder="Enter SKU" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pain-relief">Pain Relief</SelectItem>
                                    <SelectItem value="antibiotics">Antibiotics</SelectItem>
                                    <SelectItem value="gastrointestinal">Gastrointestinal</SelectItem>
                                    <SelectItem value="diabetes">Diabetes</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Initial Stock</Label>
                            <Input id="stock" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Minimum Stock</Label>
                            <Input id="minStock" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxStock">Maximum Stock</Label>
                            <Input id="maxStock" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input id="unit" placeholder="e.g., Tablets, Capsules" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" type="number" step="0.01" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input id="supplier" placeholder="Enter supplier name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input id="expiryDate" type="date" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Enter item description" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button>Add Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Item Details Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Item Details</DialogTitle>
                        <DialogDescription>Detailed information about the selected item</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Item Name</Label>
                                    <p className="text-sm">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">SKU</Label>
                                    <p className="font-mono text-sm">{selectedItem.sku}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Category</Label>
                                    <p className="text-sm">{selectedItem.category}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Current Stock</Label>
                                    <p className="text-sm">
                                        {selectedItem.stock} {selectedItem.unit}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Price</Label>
                                    <p className="text-sm">₱{selectedItem.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge className={getStatusBadge(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Supplier</Label>
                                    <p className="text-sm">{selectedItem.supplier}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Expiry Date</Label>
                                    <p className="text-sm">{selectedItem.expiryDate}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Stock Range</Label>
                                <p className="text-sm">
                                    Minimum: {selectedItem.minStock} | Maximum: {selectedItem.maxStock}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Last Updated</Label>
                                <p className="text-sm">{selectedItem.lastUpdated}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Close
                        </Button>
                        <Button>Edit Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
