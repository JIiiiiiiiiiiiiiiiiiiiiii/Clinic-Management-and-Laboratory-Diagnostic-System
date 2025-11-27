import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

interface MovementModalProps {
    itemId: number;
    itemName: string;
    currentStock: number;
    unit: string;
    trigger?: React.ReactNode;
}

const MovementModal: React.FC<MovementModalProps> = ({ 
    itemId, 
    itemName, 
    currentStock, 
    unit,
    trigger 
}) => {
    const [open, setOpen] = useState(false);
    const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');

    const { data, setData, post, processing, errors, reset } = useForm({
        movement_type: 'IN' as 'IN' | 'OUT',
        quantity: 1,
        remarks: '',
        expiry_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/inventory/${itemId}/movement`, {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
        }
    };

    const handleMovementTypeChange = (type: 'IN' | 'OUT') => {
        setMovementType(type);
        setData('movement_type', type);
        // Clear expiry_date when switching to OUT
        if (type === 'OUT') {
            setData('expiry_date', '');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        In/Out
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {movementType === 'IN' ? (
                                <ArrowUp className="h-5 w-5 text-green-600" />
                            ) : (
                                <ArrowDown className="h-5 w-5 text-red-600" />
                            )}
                            {movementType === 'IN' ? 'Add Stock' : 'Remove Stock'} - {itemName}
                        </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Movement Type */}
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={movementType === 'IN' ? 'default' : 'outline'}
                                onClick={() => handleMovementTypeChange('IN')}
                                className="flex items-center gap-2"
                            >
                                <ArrowUp className="h-4 w-4" />
                                Add Stock
                            </Button>
                            <Button
                                type="button"
                                variant={movementType === 'OUT' ? 'default' : 'outline'}
                                onClick={() => handleMovementTypeChange('OUT')}
                                className="flex items-center gap-2"
                            >
                                <ArrowDown className="h-4 w-4" />
                                Remove Stock
                            </Button>
                        </div>
                        {errors.movement_type && (
                            <p className="text-sm text-red-600">{errors.movement_type}</p>
                        )}
                    </div>

                    {/* Current Stock Display */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Available Stock:</span>
                            <span className="font-bold text-lg">
                                {currentStock} {unit}
                            </span>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={movementType === 'OUT' ? currentStock : undefined}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                            className={errors.quantity ? 'border-red-500' : ''}
                        />
                        {movementType === 'OUT' && (
                            <p className="text-sm text-gray-500">
                                Maximum available: {currentStock} {unit}
                            </p>
                        )}
                        {errors.quantity && (
                            <p className="text-sm text-red-600">{errors.quantity}</p>
                        )}
                    </div>

                    {/* Expiry Date - Only for IN movements */}
                    {movementType === 'IN' && (
                        <div className="space-y-2">
                            <Label htmlFor="expiry_date" className="text-sm font-semibold">
                                Expiry Date (Optional)
                            </Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date || ''}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className={`h-11 ${errors.expiry_date ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Select expiry date for this batch"
                            />
                            <p className="text-xs text-gray-500">
                                Set expiration date for this batch of items to track when to restock
                            </p>
                            {errors.expiry_date && (
                                <p className="text-sm text-red-600">{errors.expiry_date}</p>
                            )}
                        </div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Transaction Notes</Label>
                        <Textarea
                            id="remarks"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder={
                                movementType === 'IN' 
                                    ? 'e.g. New delivery from supplier, Restocked inventory'
                                    : 'e.g. Used for patient treatment, Consumed by Dr. Smith'
                            }
                            rows={3}
                        />
                        <p className="text-xs text-gray-500">Add details about this stock movement for tracking purposes</p>
                        {movementType === 'OUT' && (
                            <p className="text-sm text-gray-500">
                                Tip: Include "reject" in remarks to mark as rejected item
                            </p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm">
                            <p className="font-medium text-blue-900">
                                Stock Update Preview:
                            </p>
                            <p className="text-blue-700">
                                New stock level: {movementType === 'IN' 
                                    ? `${currentStock + data.quantity} ${unit}` 
                                    : `${currentStock - data.quantity} ${unit}`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className={movementType === 'IN'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }
                                >
                                    {processing ? 'Processing...' : `${movementType === 'IN' ? 'Add Stock' : 'Remove Stock'}`}
                                </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MovementModal;
