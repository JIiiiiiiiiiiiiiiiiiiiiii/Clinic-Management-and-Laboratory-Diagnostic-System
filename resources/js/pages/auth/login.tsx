import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthLayout title="Sign in to your account" description="Enter your credentials to access your account">
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
            )}

            <Form method="post" action={route('login')} onSubmitComplete={(form) => form.reset('password')} className="space-y-6">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink 
                                            href={route('password.request')} 
                                            className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium" 
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Remember me
                                </Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold shadow-sm mt-2 bg-green-600 hover:bg-green-700 text-white border-0" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                                <TextLink href={route('register')} className="text-green-600 hover:text-green-700 hover:underline font-semibold">
                                    Sign up
                            </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
