import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm, router } from '@inertiajs/react';
import { Save, User, Mail, Heart, CheckCircle, X, Lock } from 'lucide-react';

interface Nurse {
    id: number;
    name: string;
    email: string;
    contact?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface NurseModalProps {
    isOpen: boolean;
    onClose: () => void;
    nurse?: Nurse | null;
    mode: 'create' | 'edit' | 'view';
    onSuccess?: () => void;
}

export default function NurseModal({ 
    isOpen, 
    onClose, 
    nurse = null, 
    mode, 
    onSuccess 
}: NurseModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submittingRef = useRef(false);

    const { data, setData, errors, reset, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact: '',
        status: 'Active',
    });

    // Reset form when modal opens/closes or nurse changes
    useEffect(() => {
        if (isOpen) {
            if ((mode === 'edit' || mode === 'view') && nurse) {
                setData({
                    name: nurse.name || '',
                    email: nurse.email || '',
                    password: '',
                    password_confirmation: '',
                    contact: nurse.contact || '',
                    status: nurse.is_active ? 'Active' : 'Inactive',
                });
            } else if (mode === 'create') {
                reset();
            }
        } else {
            // Reset submitting state when modal closes
            setIsSubmitting(false);
            submittingRef.current = false;
        }
    }, [isOpen, mode, nurse]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        submittingRef.current = true;

        const url = mode === 'create' 
            ? '/admin/specialists/nurses' 
            : `/admin/specialists/nurses/${nurse?.id}`;
        
        const method = mode === 'create' ? 'post' : 'put';

        // Prepare data - only include password fields for create mode or if password is provided in edit mode
        const submitData: any = { ...data };
        
        if (mode === 'edit') {
            // For edit mode, only include password if it's provided
            if (!submitData.password) {
                delete submitData.password;
                delete submitData.password_confirmation;
            } else {
                // If password is provided, ensure password_confirmation is also included
                if (!submitData.password_confirmation) {
                    submitData.password_confirmation = submitData.password;
                }
            }
        }

        const onSuccessCallback = (page: any) => {
            setIsSubmitting(false);
            submittingRef.current = false;
            onClose();
            onSuccess?.();
        };

        const onErrorCallback = (errors: any) => {
            setIsSubmitting(false);
            submittingRef.current = false;
        };

        const onFinishCallback = () => {
            setIsSubmitting(false);
            submittingRef.current = false;
        };

        if (method === 'post') {
            router.post(url, submitData, {
                onSuccess: onSuccessCallback,
                onError: onErrorCallback,
                onFinish: onFinishCallback
            });
        } else {
            router.put(url, submitData, {
                onSuccess: onSuccessCallback,
                onError: onErrorCallback,
                onFinish: onFinishCallback
            });
        }
    };

    const handleClose = () => {
        if (!submittingRef.current) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Heart className="h-5 w-5 text-green-600" />
                        {mode === 'create' ? 'Create New Nurse' : mode === 'edit' ? 'Edit Nurse' : 'View Nurse'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create' 
                            ? 'Add a new nurse to the clinic system' 
                            : mode === 'edit' 
                            ? 'Update nurse information'
                            : 'View nurse information'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full"
                                placeholder="Enter nurse's full name"
                                disabled={isSubmitting || mode === 'view'}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full"
                                placeholder="Enter email address"
                                disabled={isSubmitting || mode === 'view'}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Password Section */}
                    {mode !== 'view' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Password {mode === 'create' ? '*' : ''}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full"
                                    placeholder="Enter password"
                                    disabled={isSubmitting}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Confirm Password {mode === 'create' ? '*' : ''}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full"
                                    placeholder="Confirm password"
                                    disabled={isSubmitting}
                                />
                                {errors.password_confirmation && (
                                    <p className="text-red-500 text-sm">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact" className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact Number
                            </Label>
                            <Input
                                id="contact"
                                type="text"
                                value={data.contact}
                                onChange={(e) => setData('contact', e.target.value)}
                                className="w-full"
                                placeholder="Enter contact number"
                                disabled={isSubmitting || mode === 'view'}
                            />
                            {errors.contact && (
                                <p className="text-red-500 text-sm">{errors.contact}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Status *
                            </Label>
                            {mode === 'view' ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800">
                                    {data.status}
                                </div>
                            ) : (
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    disabled={isSubmitting}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            )}
                            {errors.status && (
                                <p className="text-red-500 text-sm">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Information for View Mode */}
                    {mode === 'view' && nurse && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-600">Created At</Label>
                                <div className="text-sm text-gray-800">
                                    {new Date(nurse.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                                <div className="text-sm text-gray-800">
                                    {new Date(nurse.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-end gap-3 pt-4">
                        {mode === 'view' ? (
                            <Button
                                type="button"
                                onClick={handleClose}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Close
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSubmitting 
                                        ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                                        : (mode === 'create' ? 'Create Nurse' : 'Update Nurse')
                                    }
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
