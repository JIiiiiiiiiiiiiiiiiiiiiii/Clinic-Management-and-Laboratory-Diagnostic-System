import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function LaboratoryIndex() {
  useEffect(() => {
    // Redirect to lab orders as the default laboratory page
    router.visit('/admin/laboratory/orders', {
      method: 'get',
      replace: true,
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Laboratory Orders...</p>
      </div>
    </div>
  );
}
