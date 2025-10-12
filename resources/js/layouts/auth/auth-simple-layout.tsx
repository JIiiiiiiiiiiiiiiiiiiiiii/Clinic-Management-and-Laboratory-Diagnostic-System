import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex min-h-[600px]">
                        {/* Left side - Image section */}
                        <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
                                <div className="absolute inset-0 bg-black/20"></div>
                            </div>
                            <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white">
                                <div className="mb-8">
                                    <img 
                                        src="/st-james-logo.png" 
                                        alt="St. James Clinic Logo" 
                                        className="h-20 w-auto mx-auto"
                                    />
                                </div>
                                <h2 className="text-4xl font-bold mb-6">Welcome to St. James Clinic</h2>
                                <p className="text-xl text-green-100 max-w-md">
                                    Your trusted healthcare partner for quality medical services and compassionate care.
                                </p>
                                <div className="mt-8 flex items-center justify-center space-x-4 text-green-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                                        <span className="text-sm">24/7 Emergency Care</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                                        <span className="text-sm">Expert Medical Team</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Login form */}
                        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                            <div className="w-full max-w-md">
                                {/* Mobile logo */}
                                <div className="flex flex-col items-center gap-4 lg:hidden mb-8">
                                    <Link href={route('home')} className="flex flex-col items-center gap-2">
                                        <img 
                                            src="/st-james-logo.png" 
                                            alt="St. James Clinic Logo" 
                                            className="h-12 w-auto"
                                        />
                                        <span className="text-sm text-muted-foreground">St. James Clinic</span>
                                    </Link>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                                        <p className="text-muted-foreground mt-2">{description}</p>
                                    </div>
                                    
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
