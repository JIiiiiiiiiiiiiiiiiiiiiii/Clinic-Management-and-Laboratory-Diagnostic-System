import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    email: string;
}

export default function ResetPassword({ email }: ResetPasswordProps) {
    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 text-center shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Your email has been verified. Please enter your new password below.
                    </p>
                </div>

            <Form
                method="post"
                action={route('password.store')}
                    transform={(data) => ({ ...data, email })}
                onSubmitComplete={(form) => form.reset('password', 'password_confirmation')}
                    className="space-y-5"
            >
                {({ processing, errors }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                                    Email Address
                                </Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    name="email" 
                                    autoComplete="email" 
                                    value={email} 
                                    className="h-11 border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed" 
                                    readOnly 
                                />
                                <InputError message={errors.email} />
                        </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                                    New Password
                                </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                autoFocus
                                    placeholder="Enter your new password"
                            />
                            <InputError message={errors.password} />
                        </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-900">
                                    Confirm New Password
                                </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                    placeholder="Confirm your new password"
                            />
                                <InputError message={errors.password_confirmation} />
                        </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold shadow-sm mt-2 bg-green-600 hover:bg-green-700 text-white border-0" 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Reset Password
                        </Button>
                        </>
                )}
            </Form>
            </div>
        </AuthLayout>
    );
}
