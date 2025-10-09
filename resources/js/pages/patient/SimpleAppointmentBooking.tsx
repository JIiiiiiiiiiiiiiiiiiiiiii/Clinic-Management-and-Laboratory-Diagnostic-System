import { Head } from '@inertiajs/react';

export default function SimpleAppointmentBooking() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head title="Book Appointment" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Book New Appointment</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">This is a simple test to verify the route is working.</p>
                    <p className="text-gray-600 mt-2">If you can see this, the appointment booking page is loading correctly!</p>
                </div>
            </div>
        </div>
    );
}
