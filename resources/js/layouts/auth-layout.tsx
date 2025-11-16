import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { usePage } from '@inertiajs/react';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    const page = usePage();
    const user = (page.props as any).user;
    
    return (
        <AuthLayoutTemplate title={title} description={description} user={user} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
