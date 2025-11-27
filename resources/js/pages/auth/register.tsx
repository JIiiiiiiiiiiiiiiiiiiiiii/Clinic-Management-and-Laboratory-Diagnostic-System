import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PrivacyActModal from '@/components/PrivacyActModal';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [privacyActAccepted, setPrivacyActAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <Form
                method="post"
                action={route('register')}
                onSubmitComplete={(form) => form.reset('password', 'password_confirmation')}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors, submit }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-900">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm your password"
                                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Privacy Act and Terms Acceptance */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Required Acceptances</h4>
                                
                                {/* Privacy Act Checkbox */}
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="privacy-act-accept"
                                        checked={privacyActAccepted}
                                        onCheckedChange={(checked) => setPrivacyActAccepted(checked === true)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="privacy-act-accept"
                                            className="text-sm font-medium leading-relaxed cursor-pointer flex items-start gap-2"
                                        >
                                            <span className="flex-1">
                                                I have read and accept the{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPrivacyModal(true)}
                                                    className="text-green-600 hover:text-green-700 underline font-semibold"
                                                >
                                                    Data Privacy Act Notice (RA 10173)
                                                </button>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Terms of Service Checkbox */}
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms-accept"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="terms-accept"
                                            className="text-sm font-medium leading-relaxed cursor-pointer flex items-start gap-2"
                                        >
                                            <span className="flex-1">
                                                I have read and accept the{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTermsModal(true)}
                                                    className="text-green-600 hover:text-green-700 underline font-semibold"
                                                >
                                                    Terms of Service
                                                </button>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Error message if not accepted */}
                                {(!privacyActAccepted || !termsAccepted) && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Please accept both the Privacy Act Notice and Terms of Service to continue.
                                    </p>
                                )}
                            </div>

                            <Button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (privacyActAccepted && termsAccepted) {
                                        submit();
                                    }
                                }}
                                className="w-full h-11 text-base font-semibold shadow-sm mt-2 bg-green-600 hover:bg-green-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                                tabIndex={5}
                                disabled={processing || !privacyActAccepted || !termsAccepted}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Create Account
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                                <TextLink href={route('login')} className="text-green-600 hover:text-green-700 hover:underline font-semibold" tabIndex={6}>
                                    Sign in
                            </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>

            {/* Privacy Act Modal */}
            <PrivacyActModal
                open={showPrivacyModal}
                onAccept={() => {
                    setPrivacyActAccepted(true);
                    setShowPrivacyModal(false);
                }}
                onClose={() => setShowPrivacyModal(false)}
            />

            {/* Terms of Service Modal */}
            <TermsOfServiceModal
                open={showTermsModal}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                }}
                onClose={() => setShowTermsModal(false)}
            />
        </AuthLayout>
    );
}
