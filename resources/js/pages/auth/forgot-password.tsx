// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 text-center shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Enter your email address and we'll send you a verification code to reset your password.
                    </p>
                </div>

                <Form method="post" action={route('password.email')} className="space-y-5">
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
                                    autoComplete="off" 
                                    autoFocus 
                                    placeholder="name@example.com"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold shadow-sm bg-green-600 hover:bg-green-700 text-white border-0" 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Send Verification Code
                                </Button>
                        </>
                    )}
                </Form>

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <TextLink href={route('login')} className="text-green-600 hover:text-green-700 hover:underline font-semibold">
                            Sign in
                        </TextLink>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
