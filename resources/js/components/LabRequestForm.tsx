import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FlaskConical, Calculator } from 'lucide-react';
import { router } from '@inertiajs/react';

interface LabTest {
    id: number;
    name: string;
    code: string;
    price: number;
}

interface LabRequestFormProps {
    visitId: number;
    availableTests: LabTest[];
    onClose: () => void;
}

export default function LabRequestForm({ visitId, availableTests, onClose }: LabRequestFormProps) {
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTestToggle = (testId: number) => {
        setSelectedTests(prev => 
            prev.includes(testId) 
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const calculateTotal = () => {
        return selectedTests.reduce((total, testId) => {
            const test = availableTests.find(t => t.id === testId);
            return total + (test?.price || 0);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedTests.length === 0) {
            alert('Please select at least one lab test.');
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post('/api/lab-requests/store', {
                visit_id: visitId,
                lab_test_ids: selectedTests,
                notes: notes,
            }, {
                onSuccess: () => {
                    onClose();
                },
                onError: (errors) => {
                    console.error('Lab request creation failed:', errors);
                    alert('Failed to create lab requests. Please try again.');
                }
            });
        } catch (error) {
            console.error('Error creating lab requests:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-blue-600" />
                            Add Lab Tests
                        </h3>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Available Lab Tests */}
                        <div>
                            <Label className="text-base font-medium mb-4 block">Select Lab Tests</Label>
                            <div className="grid gap-4">
                                {availableTests.map((test) => (
                                    <Card key={test.id} className={`cursor-pointer transition-colors ${
                                        selectedTests.includes(test.id) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`test-${test.id}`}
                                                    checked={selectedTests.includes(test.id)}
                                                    onCheckedChange={() => handleTestToggle(test.id)}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label 
                                                                htmlFor={`test-${test.id}`}
                                                                className="font-medium cursor-pointer"
                                                            >
                                                                {test.name}
                                                            </Label>
                                                            <p className="text-sm text-gray-500">Code: {test.code}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-green-600">
                                                                ₱{test.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes" className="text-base font-medium mb-2 block">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any special instructions or notes for the lab tests..."
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Cost Summary */}
                        {selectedTests.length > 0 && (
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-900">Total Cost</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                ₱{calculateTotal().toFixed(2)}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                {selectedTests.length} test(s) selected
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={selectedTests.length === 0 || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Lab Requests'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
