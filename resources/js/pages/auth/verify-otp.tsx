import { Form, Head, router } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface VerifyOtpProps {
    email: string;
    type: 'login' | 'register' | 'password_reset';
    status?: string;
    devOtpCode?: string;
}

export default function VerifyOtp({ email, type, status, devOtpCode }: VerifyOtpProps) {
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Start countdown for resend (60 seconds)
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
    };

    const handleResend = () => {
        router.post(route('otp.resend'), {}, {
            preserveState: true,
            onSuccess: () => {
                setCountdown(60);
                setCanResend(false);
            },
        });
    };

    const getTitle = () => {
        switch (type) {
            case 'login':
                return 'Verify Your Login';
            case 'register':
                return 'Verify Your Email';
            case 'password_reset':
                return 'Verify Password Reset';
            default:
                return 'Verify Your Code';
        }
    };

    const getDescription = () => {
        switch (type) {
            case 'login':
                return 'We sent a verification code to your email. Please enter it below to complete your login.';
            case 'register':
                return 'We sent a verification code to your email. Please enter it below to verify your account.';
            case 'password_reset':
                return 'We sent a verification code to your email. Please enter it below to reset your password.';
            default:
                return 'Please enter the verification code sent to your email.';
        }
    };

    return (
        <AuthLayout title={getTitle()} description={getDescription()}>
            <Head title="Verify OTP" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
            )}

            {devOtpCode && (
                <div className="mb-6 rounded-lg bg-amber-50 border-2 border-amber-300 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center justify-center gap-2">
                        <span className="text-lg">⚠️</span>
                        Development Mode - OTP Code
                    </p>
                    <div className="bg-white rounded-lg border-2 border-dashed border-amber-400 p-4 mb-3">
                        <p className="text-3xl font-mono font-bold text-center text-amber-900 tracking-[0.5em]">
                            {devOtpCode}
                        </p>
                    </div>
                    <p className="text-xs text-amber-800 text-center leading-relaxed">
                        Email is not configured. Use this code to test. Configure Gmail SMTP to receive emails.
                    </p>
                </div>
            )}

            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                        Verification code sent to
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 break-all">
                        {email}
                    </p>
                </div>

                <Form method="post" action={route('otp.verify')} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-3">
                                <Label htmlFor="code" className="text-sm font-semibold text-gray-900">
                                    Verification Code
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="code"
                                        type="text"
                                        name="code"
                                        value={code}
                                        onChange={handleCodeChange}
                                        required
                                        autoFocus
                                        maxLength={6}
                                        placeholder="000000"
                                        className="h-14 text-center text-3xl tracking-[0.3em] font-mono font-bold border-2 focus:border-green-500 focus:ring-green-500/20"
                                        inputMode="numeric"
                                    />
                                </div>
                                <InputError message={errors.code} />
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold shadow-sm bg-green-600 hover:bg-green-700 text-white border-0" 
                                disabled={processing || code.length !== 6}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Code
                            </Button>
                        </>
                    )}
                </Form>

                <div className="space-y-4 pt-2">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wide">
                            <span className="bg-white px-3 text-muted-foreground font-medium">Didn't receive the code?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        {canResend ? (
                            <Button
                                type="button"
                                onClick={handleResend}
                                className="w-full h-10 bg-green-600 hover:bg-green-700 text-white border-0"
                            >
                                Resend Code
                            </Button>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
                                <p className="text-sm text-muted-foreground font-medium">
                                    Resend code in <span className="font-semibold text-gray-900">{countdown}</span> seconds
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-2 text-center text-sm text-muted-foreground">
                    <TextLink href={route('login')} className="text-green-600 hover:text-green-700 hover:underline font-semibold">
                        Back to login
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

