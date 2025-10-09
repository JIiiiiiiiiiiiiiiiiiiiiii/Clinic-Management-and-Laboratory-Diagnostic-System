import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AdminLogoutButton() {
    return (
        <Link 
            href={route('logout')} 
            method="post" 
            as="button"
            className="inline-flex items-center"
        >
            <Button variant="outline" size="sm" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </Link>
    );
}
