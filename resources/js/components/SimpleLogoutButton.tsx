import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SimpleLogoutButton() {
    return (
        <Link 
            href={route('logout')} 
            method="post" 
            as="button"
            className="inline-flex items-center"
        >
            <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </Link>
    );
}
