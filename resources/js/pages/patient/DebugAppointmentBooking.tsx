import { Head } from '@inertiajs/react';

export default function DebugAppointmentBooking() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head title="Debug Appointment Booking" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug: Appointment Booking Route</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-green-600 text-lg mb-4">✅ Route is working!</p>
                    <p className="text-gray-600">If you can see this page, the route `/patient/appointments/create` is working correctly.</p>
                    <p className="text-gray-600 mt-2">The issue might be with the full appointment booking component.</p>
                </div>
            </div>
        </div>
    );
}
