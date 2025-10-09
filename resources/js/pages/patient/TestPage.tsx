import { Head } from '@inertiajs/react';

interface TestPageProps {
    message: string;
}

export default function TestPage({ message }: TestPageProps) {
    return (
        <>
            <Head title="Test Page" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
                    <p className="text-xl text-gray-600">{message}</p>
                </div>
            </div>
        </>
    );
}
